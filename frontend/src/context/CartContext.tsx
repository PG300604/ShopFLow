import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

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
  addItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = 'shopflow-cart';

function getLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleCart = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Enrich server cart items with product details
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
          return {
            productId: item.productId,
            quantity: item.quantity,
            productName: 'Unknown Product',
            productPrice: 0,
            productImage: '',
          };
        }
      })
    );
    return enriched;
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

  const addItem = async (productId: number, quantity: number): Promise<void> => {
    if (!isAuthenticated) {
      // Local fallback: fetch product info and add/update locally
      let product: Product;
      try {
        product = await api.get<Product>(`/products/${productId}`);
      } catch {
        product = { id: productId, name: 'Product', price: 0, imageUrl: '' };
      }

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
              productName: product.name,
              productPrice: product.price,
              productImage: product.imageUrl,
            },
          ];
        }
        saveLocalCart(updated);
        return updated;
      });
      return;
    }

    await api.post('/orders/cart', { productId, quantity });
    await fetchCart();
  };

  const removeItem = async (productId: number): Promise<void> => {
    if (!isAuthenticated) {
      setItems((prev) => {
        const updated = prev.filter((i) => i.productId !== productId);
        saveLocalCart(updated);
        return updated;
      });
      return;
    }

    await api.delete(`/orders/cart/${productId}`);
    await fetchCart();
  };

  const clearCart = async (): Promise<void> => {
    if (!isAuthenticated) {
      setItems([]);
      localStorage.removeItem(LOCAL_CART_KEY);
      return;
    }

    await api.delete('/orders/cart');
    setItems([]);
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
