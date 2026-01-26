import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    switch (endpoint) {
      case 'users':
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ users });

      case 'products':
        const products = await prisma.product.findMany({
          include: {
            farmer: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ products });

      case 'orders':
        const orders = await prisma.order.findMany({
          include: {
            product: {
              include: {
                farmer: {
                  select: { id: true, name: true },
                },
              },
            },
            buyer: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ orders });

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { endpoint, data } = await request.json();

    switch (endpoint) {
      case 'user-status':
        const updatedUser = await prisma.user.update({
          where: { id: data.userId },
          data: { role: data.role },
        });
        return NextResponse.json({ user: updatedUser });

      case 'product-status':
        const updatedProduct = await prisma.product.update({
          where: { id: data.productId },
          data: { status: data.status },
        });
        return NextResponse.json({ product: updatedProduct });

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
