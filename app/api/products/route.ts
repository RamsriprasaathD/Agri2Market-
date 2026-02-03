import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { ensureProductBucketExists, getSupabaseAdmin, PRODUCT_IMAGE_BUCKET } from '@/lib/supabase-server';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES_PER_PRODUCT = 6;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const scope = searchParams.get('scope');

    const token = request.cookies.get('token')?.value;
    const user = token ? verifyToken(token) : null;

    const where: Record<string, unknown> = {};

    if (scope === 'farmer') {
      if (!user || user.role !== 'farmer') {
        return NextResponse.json(
          { error: 'Farmer access required' },
          { status: 403 }
        );
      }

      where.farmerId = user.id;
    } else {
      // default / buyer scope surfaces market-ready products
      where.status = ProductStatus.AVAILABLE;
    }

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      where.price = priceFilter;
    }

    const baseInclude = Prisma.validator<Prisma.ProductInclude>()({
      farmer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      images: {
        select: {
          id: true,
          url: true,
          createdAt: true,
        },
      },
    });

    const farmerInclude = Prisma.validator<Prisma.ProductInclude>()({
      farmer: baseInclude.farmer,
      images: baseInclude.images,
      orders: {
        select: {
          id: true,
          status: true,
          totalPrice: true,
          createdAt: true,
          buyer: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' as const },
        take: 5,
      },
    });

    const include = scope === 'farmer' ? farmerInclude : baseInclude;

    const products = await prisma.product.findMany({
      where,
      include,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'farmer') {
      return NextResponse.json(
        { error: 'Only farmers can create products' },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      const title = formData.get('title')?.toString().trim();
      const description = formData.get('description')?.toString().trim() ?? '';
      const category = formData.get('category')?.toString().trim();
      const unit = formData.get('unit')?.toString().trim();
      const quantityRaw = formData.get('quantity')?.toString().trim();
      const priceRaw = formData.get('price')?.toString().trim();
      const minimumOrderRaw = formData.get('minimumOrder')?.toString().trim();

      if (!title || !category || !unit || !priceRaw || !quantityRaw) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const parsedPrice = parseFloat(priceRaw);
      const parsedQuantity = parseFloat(quantityRaw);
      const parsedMinimumOrder = minimumOrderRaw ? parseFloat(minimumOrderRaw) : null;

      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number' },
          { status: 400 }
        );
      }

      if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be a positive number' },
          { status: 400 }
        );
      }

      if (parsedMinimumOrder !== null && (!Number.isFinite(parsedMinimumOrder) || parsedMinimumOrder < 0)) {
        return NextResponse.json(
          { error: 'Minimum order must be a positive number' },
          { status: 400 }
        );
      }

      const imageFiles = formData
        .getAll('images')
        .filter((file): file is File => file instanceof File && file.size > 0);

      if (imageFiles.length > MAX_IMAGES_PER_PRODUCT) {
        return NextResponse.json(
          { error: `You can upload up to ${MAX_IMAGES_PER_PRODUCT} images per product.` },
          { status: 400 }
        );
      }

      if (imageFiles.some((file) => file.size > MAX_IMAGE_SIZE)) {
        return NextResponse.json(
          { error: 'Each image must be 5MB or smaller.' },
          { status: 400 }
        );
      }

      await ensureProductBucketExists();
      const supabase = getSupabaseAdmin();

      const imageUrls: string[] = [];

      for (const file of imageFiles) {
        const extension = file.name?.split('.').pop()?.trim().replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
        const objectPath = `${user.id}/${randomUUID()}.${extension}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(PRODUCT_IMAGE_BUCKET)
          .upload(objectPath, file, {
            contentType: file.type || 'application/octet-stream',
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError || !uploadData) {
          console.error('Supabase upload error:', uploadError);
          return NextResponse.json({ error: 'Failed to upload one of the images.' }, { status: 500 });
        }

        const { data: publicData } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(uploadData.path);
        if (publicData?.publicUrl) {
          imageUrls.push(publicData.publicUrl);
        }
      }

      const productData = Prisma.validator<Prisma.ProductUncheckedCreateInput>()({
        title,
        description: description.length ? description : null,
        category,
        price: parsedPrice,
        quantity: parsedQuantity,
        unit,
        minimumOrder: parsedMinimumOrder ?? null,
        farmerId: user.id,
        images: imageUrls.length
          ? {
              create: imageUrls.map((url) => ({ url })),
            }
          : undefined,
      });

      const product = await prisma.product.create({
        data: productData,
        include: {
          images: {
            select: {
              id: true,
              url: true,
              createdAt: true,
            },
          },
        },
      });

      return NextResponse.json(
        { message: 'Product created successfully', product },
        { status: 201 }
      );
    }

    // JSON fallback (without file uploads) to keep compatibility with earlier clients
    const body = await request.json();
    const { title, description, category, price, quantity, unit, minimumOrder, images } = body;

    if (!title || !category || !price || !quantity || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const parsedPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    const parsedQuantity = typeof quantity === 'string' ? parseFloat(quantity) : Number(quantity);
    const parsedMinimumOrder = minimumOrder
      ? typeof minimumOrder === 'string'
        ? parseFloat(minimumOrder)
        : Number(minimumOrder)
      : null;

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    if (parsedMinimumOrder !== null && (!Number.isFinite(parsedMinimumOrder) || parsedMinimumOrder < 0)) {
      return NextResponse.json(
        { error: 'Minimum order must be a positive number' },
        { status: 400 }
      );
    }

    const imageUrls: string[] = Array.isArray(images)
      ? images.filter((url: unknown): url is string => typeof url === 'string' && url.trim().length > 0)
      : [];

    const fallbackData = Prisma.validator<Prisma.ProductUncheckedCreateInput>()({
      title,
      description: description ?? null,
      category,
      price: parsedPrice,
      quantity: parsedQuantity,
      unit,
      minimumOrder: parsedMinimumOrder ?? null,
      farmerId: user.id,
      images: imageUrls.length
        ? {
            create: imageUrls.map((url) => ({ url })),
          }
        : undefined,
    });

    const product = await prisma.product.create({
      data: fallbackData,
      include: {
        images: {
          select: {
            id: true,
            url: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
