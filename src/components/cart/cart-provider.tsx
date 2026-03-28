"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  productId: string;
  productName: string;
  priceCents: number;
  quantity: number;
  image?: string;
  customFieldValues: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, customFieldValues: Record<string, string>) => void;
  updateQuantity: (productId: string, customFieldValues: Record<string, string>, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalCents: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartKey(item: { productId: string; customFieldValues: Record<string, string> }) {
  return `${item.productId}:${JSON.stringify(item.customFieldValues)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sage-nobel-cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        // ignore invalid data
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("sage-nobel-cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const key = getCartKey(item);
      const existingIndex = prev.findIndex((i) => getCartKey(i) === key);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }

      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback(
    (productId: string, customFieldValues: Record<string, string>) => {
      const key = getCartKey({ productId, customFieldValues });
      setItems((prev) => prev.filter((i) => getCartKey(i) !== key));
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, customFieldValues: Record<string, string>, quantity: number) => {
      const key = getCartKey({ productId, customFieldValues });
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => getCartKey(i) !== key));
        return;
      }
      setItems((prev) =>
        prev.map((i) => (getCartKey(i) === key ? { ...i, quantity } : i))
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalCents }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
