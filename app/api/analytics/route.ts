import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus, ProductStatus } from '@prisma/client';
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
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    let analytics;

    if (user.role === 'admin') {
      analytics = await getAdminAnalytics();
    } else if (user.role === 'farmer') {
      analytics = await getFarmerAnalytics(user.id);
    } else {
      analytics = await getBuyerAnalytics(user.id);
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getAdminAnalytics() {
  const [totalRevenue, totalOrders, totalUsers, totalProducts] = await Promise.all([
    prisma.order.aggregate({
      where: { status: OrderStatus.DELIVERED },
      _sum: { totalPrice: true },
    }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count(),
  ]);

  const salesByMonth = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      SUM("totalPrice") as revenue
    FROM "Order" 
    WHERE status = ${OrderStatus.DELIVERED}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month DESC
    LIMIT 12
  `;

  return {
    totalRevenue: totalRevenue._sum?.totalPrice ?? 0,
    totalOrders,
    totalUsers,
    totalProducts,
    salesByMonth,
  };
}

async function getFarmerAnalytics(farmerId: string) {
  const [totalRevenue, totalOrders, totalProducts] = await Promise.all([
    prisma.order.aggregate({
      where: {
        product: { farmerId },
        status: OrderStatus.DELIVERED,
      },
      _sum: { totalPrice: true },
    }),
    prisma.order.count({
      where: {
        product: { farmerId },
      },
    }),
    prisma.product.count({
      where: { farmerId },
    }),
  ]);

  const topProducts = await prisma.product.findMany({
    where: { farmerId },
    include: {
      orders: {
        where: { status: OrderStatus.DELIVERED },
      },
    },
    orderBy: {
      orders: {
        _sum: { totalPrice: 'desc' },
      },
    },
    take: 5,
  });

  return {
    totalRevenue: totalRevenue._sum?.totalPrice ?? 0,
    totalOrders,
    totalProducts,
    topProducts,
  };
}

async function getBuyerAnalytics(buyerId: string) {
  const [totalSpent, totalOrders, averageOrderValue, recentOrders, recommendedProducts] = await Promise.all([
    prisma.order.aggregate({
      where: { buyerId, status: OrderStatus.DELIVERED },
      _sum: { totalPrice: true },
    }),
    prisma.order.count({
      where: { buyerId },
    }),
    prisma.order.aggregate({
      where: { buyerId, status: OrderStatus.DELIVERED },
      _avg: { totalPrice: true },
    }),
    prisma.order.findMany({
      where: { buyerId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            unit: true,
            price: true,
            farmer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.product.findMany({
      where: {
        status: ProductStatus.AVAILABLE,
        orders: {
          none: {
            buyerId,
          },
        },
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    totalSpent: totalSpent._sum?.totalPrice ?? 0,
    totalOrders,
    averageOrderValue: averageOrderValue._avg?.totalPrice ?? 0,
    recentOrders,
    recommendedProducts,
  };
}
