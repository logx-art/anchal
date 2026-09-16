import { clsx } from "clsx";
import type { OrderStatus } from "@prisma/client";

const LABELS: Record<OrderStatus, string> = {
  ORDER_PLACED: "Order Placed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const TONES: Record<OrderStatus, string> = {
  ORDER_PLACED: "bg-beige text-charcoal",
  PROCESSING: "bg-terracotta/20 text-terracotta",
  SHIPPED: "bg-terracotta/20 text-terracotta",
  OUT_FOR_DELIVERY: "bg-terracotta/20 text-terracotta",
  DELIVERED: "bg-maroon/15 text-maroon",
  CANCELLED: "bg-charcoal/10 text-charcoal/50",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={clsx("inline-block rounded-card px-2.5 py-1 text-xs font-medium", TONES[status])}>
      {LABELS[status]}
    </span>
  );
}
