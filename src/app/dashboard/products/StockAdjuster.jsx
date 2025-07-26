"use client";

import { useFormStatus } from "react-dom";
import { updateStockQuantity } from "@/app/lib/actions/products";

// button component to show a pending state
function ActionButton({ children, className }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "..." : children}
    </button>
  );
}

export default function StockAdjuster({ product }) {
  return (
    <div className="flex items-center gap-2">
      {/* Decrement Button */}
      <form
        action={updateStockQuantity.bind(
          null,
          product.id,
          product.stock_quantity - 1
        )}
      >
        <ActionButton className="px-2 py-0.5 text-lg font-bold bg-gray-200 rounded hover:bg-gray-300">
          -
        </ActionButton>
      </form>

      {/* Stock Display */}
      <span>{product.stock_quantity}</span>

      {/* Increment Button */}
      <form
        action={updateStockQuantity.bind(
          null,
          product.id,
          product.stock_quantity + 1
        )}
      >
        <ActionButton className="px-2 py-0.5 text-lg font-bold bg-gray-200 rounded hover:bg-gray-300">
          +
        </ActionButton>
      </form>
    </div>
  );
}
