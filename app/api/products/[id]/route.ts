import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const baseInclude = {
  farmer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  images: {
    select: {
      id: true,
      url: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Parameters<typeof prisma.product.findUnique>[0]['include'];

const orderSelect = {
  id: true,
  status: true,
  totalPrice: true,
  quantity: true,
  createdAt: true,
  buyer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productRecord = await prisma.product.findUnique({
      where: { id: params.id },
      include: baseInclude,
    });

    if (!productRecord) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let recentOrders: Array<{
      id: string;
      status: string;
      totalPrice: number;
      quantity: number;
      createdAt: Date;
      buyer: { id: string; name: string; email: string } | null;
    }> = [];

    try {
      recentOrders = await prisma.order.findMany({
        where: { productId: productRecord.id },
        select: orderSelect,
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    } catch (ordersError) {
      console.error('Get product detail orders error:', ordersError);
    }

    return NextResponse.json({ product: { ...productRecord, orders: recentOrders } });
  } catch (error) {
    console.error('Get product detail error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
