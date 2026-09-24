import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { MOCK_PRODUCTS } from '../data/mockProducts';

export interface CartItem {
  productId: number;
  quantity: number;
  productName: string;
  productPrice: number;
  productImage: string;
}

interface ServerCartItem {
  productId: number;
  quantity: number;
  addedAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  toggleCart: () => void;
  addItem: (
    productId: number,
    quantity: number,
    details?: { productName?: string; productPrice?: number; productImage?: string }
  ) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'shopflow-cart';

function resolveFallbackProduct(productId: number): { name: string; price: number; imageUrl: string } {
  const mock = MOCK_PRODUCTS.find((p) => p.id === Number(productId));
  if (mock) {
    return {
      name: mock.name,
      price: mock.price,
      imageUrl: mock.imageUrl,
    };
  }
  return {
    name: 'Featured Product',
    price: 99.0,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  };
}

function sanitizeCartItems(items: CartItem[]): CartItem[] {
  return items.map((item) => {
    // If item is missing price or image, repair with mock catalog data
    if (!item.productPrice || item.productPrice === 0 || !item.productImage || item.productName === 'Product') {
      const fallback = resolveFallbackProduct(item.productId);
      return {
        ...item,
        productName: item.productName === 'Product' ? fallback.name : (item.productName || fallback.name),
        productPrice: item.productPrice && item.productPrice > 0 ? item.productPrice : fallback.price,
        productImage: item.productImage && item.productImage.length > 0 ? item.productImage : fallback.imageUrl,
      };
    }
    return item;
  });
}

function getLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    if (!raw) return [];
    const parsed: CartItem[] = JSON.parse(raw);
    const sanitized = sanitizeCartItems(parsed);
    saveLocalCart(sanitized);
    return sanitized;
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => getLocalCart());
  const [isOpen, setIsOpen] = useState(false);

  const toggleCart = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Enrich server cart items with product details (falling back to mock catalog)
  const enrichCartItems = async (serverItems: ServerCartItem[]): Promise<CartItem[]> => {
    const enriched = await Promise.all(
      serverItems.map(async (item) => {
        try {
          const product = await api.get<Product>(`/products/${item.productId}`);
          return {
            productId: item.productId,
            quantity: item.quantity,
            productName: product.name,
            productPrice: product.price,
            productImage: product.imageUrl,
          };
        } catch {
          const fallback = resolveFallbackProduct(item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            productName: fallback.name,
            productPrice: fallback.price,
            productImage: fallback.imageUrl,
          };
        }
      })
    );
    return sanitizeCartItems(enriched);
  };

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems(getLocalCart());
      return;
    }

    try {
      const serverItems = await api.get<ServerCartItem[]>('/orders/cart');
      const enriched = await enrichCartItems(serverItems);
      setItems(enriched);
    } catch {
      setItems(getLocalCart());
    }
  }, [isAuthenticated]);

  // Fetch cart whenever auth state changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (
    productId: number,
    quantity: number,
    details?: { productName?: string; productPrice?: number; productImage?: string }
  ): Promise<void> => {
    // Resolve product info from passed details, backend, or mock catalog
    const fallback = resolveFallbackProduct(productId);
    let resolvedName = details?.productName || fallback.name;
    let resolvedPrice = details?.productPrice ?? fallback.price;
    let resolvedImage = details?.productImage || fallback.imageUrl;

    if (!details?.productName) {
      try {
        const product = await api.get<Product>(`/products/${productId}`);
        if (product.name) resolvedName = product.name;
        if (product.price) resolvedPrice = product.price;
        if (product.imageUrl) resolvedImage = product.imageUrl;
      } catch {
        // Fallback already resolved from MOCK_PRODUCTS
      }
    }

    if (!isAuthenticated) {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        let updated: CartItem[];
        if (existing) {
          updated = prev.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity: i.quantity + quantity,
                  productName: resolvedName,
                  productPrice: resolvedPrice,
                  productImage: resolvedImage,
                }
              : i
          );
        } else {
          updated = [
            ...prev,
            {
              productId,
              quantity,
              productName: resolvedName,
              productPrice: resolvedPrice,
              productImage: resolvedImage,
            },
          ];
        }
        const sanitized = sanitizeCartItems(updated);
        saveLocalCart(sanitized);
        return sanitized;
      });
      return;
    }

    try {
      await api.post('/orders/cart', { productId, quantity });
      await fetchCart();
    } catch {
      // If server cart fails, maintain local state seamlessly
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        let updated: CartItem[];
        if (existing) {
          updated = prev.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          updated = [
            ...prev,
            {
              productId,
              quantity,
              productName: resolvedName,
              productPrice: resolvedPrice,
              productImage: resolvedImage,
            },
          ];
        }
        const sanitized = sanitizeCartItems(updated);
        saveLocalCart(sanitized);
        return sanitized;
      });
    }
  };

  const removeItem = async (productId: number): Promise<void> => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      saveLocalCart(updated);
      return updated;
    });

    if (isAuthenticated) {
      try {
        await api.delete(`/orders/cart/${productId}`);
      } catch {
        // Handled via local state
      }
    }
  };

  const clearCart = async (): Promise<void> => {
    setItems([]);
    localStorage.removeItem(LOCAL_CART_KEY);

    if (isAuthenticated) {
      try {
        await api.delete('/orders/cart');
      } catch {
        // Handled via local state
      }
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        toggleCart,
        addItem,
        removeItem,
        clearCart,
        fetchCart,
        itemCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
