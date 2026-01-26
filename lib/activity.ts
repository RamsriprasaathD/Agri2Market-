import { Prisma, ActivityType } from '@prisma/client';
import { prisma } from './prisma';

interface LogActivityOptions {
  userId: string;
  type: ActivityType;
  description: string;
  productId?: string;
  orderId?: string;
  metadata?: Prisma.JsonValue;
}

export const USER_LOGIN_ACTIVITY: ActivityType = 'USER_LOGIN';

export async function logActivity({
  userId,
  type,
  description,
  productId,
  orderId,
  metadata,
}: LogActivityOptions) {
  try {
    const data = Prisma.validator<Prisma.ActivityLogUncheckedCreateInput>()({
      userId,
      type,
      description,
      metadata: metadata ?? Prisma.DbNull,
      productId: productId ?? null,
      orderId: orderId ?? null,
    });

    await prisma.activityLog.create({ data });
  } catch (error) {
    console.error('Failed to record activity log:', error);
  }
}
