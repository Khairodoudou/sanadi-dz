import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "NEW_REQUEST"
  | "REQUEST_ACCEPTED"
  | "REQUEST_REFUSED"
  | "NEW_MESSAGE"
  | "NEW_APPOINTMENT"
  | "RECORD_UPDATED"
  | "INFO";

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  link?: string
) {
  return prisma.notification.create({
    data: { userId, type, message, link: link ?? null, read: false },
  });
}

export async function createNotificationMany(
  userIds: string[],
  type: NotificationType,
  message: string,
  link?: string
) {
  if (userIds.length === 0) return;
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type,
      message,
      link: link ?? null,
      read: false,
    })),
  });
}
