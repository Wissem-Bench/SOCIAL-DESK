"use server";

import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import { revalidatePath } from "next/cache";

/**
 * @description Fetches all unread notifications for the currently authenticated user.
 * @returns {Promise<Array>} A promise that resolves to an array of notification objects.
 */
export async function getUnreadNotifications() {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) return []; // Return empty array if no user is logged in

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Database Error (getUnreadNotifications):", error.message);
    throw new Error("Failed to fetch notifications.");
  }

  return notifications;
}

/**
 * @description Marks all unread notifications for the user as read.
 */
export async function markAllNotificationsAsRead() {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error(
      "Database Error (markAllNotificationsAsRead):",
      error.message
    );
    throw new Error("Failed to update notifications.");
  }

  // Revalidate the dashboard layout to update the notification count everywhere
  revalidatePath("/dashboard", "layout");
}

/**
 * @description A utility function to create a new notification.
 * This should be called from other server actions (e.g., after creating an order).
 * @param {object} notificationData - The data for the new notification.
 * @param {string} notificationData.userId - The ID of the user to notify.
 * @param {string} notificationData.type - The type of notification (e.g., 'new_order').
 * @param {object} notificationData.content - The JSON content of the notification.
 * @param {string} [notificationData.relatedEntityId] - Optional ID of the related entity.
 */
export async function createNotification({
  userId,
  type,
  content,
  relatedEntityId,
}) {
  // This uses the service_role client to bypass RLS,
  // as it's a trusted server-to-server operation.
  const { supabase } = await getSupabaseWithUser(true); // Using admin client

  const { error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      type,
      content,
      related_entity_id: relatedEntityId,
    },
  ]);

  if (error) {
    console.error("Database Error (createNotification):", error.message);
    // We don't throw an error here to avoid failing the parent operation (e.g., order creation)
    // just because the notification failed.
    return { error: "Failed to create notification." };
  }

  // Revalidate the layout to show the new notification immediately
  revalidatePath("/dashboard", "layout");

  return { success: true };
}
