import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, size, color) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (item) => 
            item._id === product._id && 
            item.size === size && 
            item.color === color
        );

        if (existingItemIndex > -1) {
          const newItems = [...items];
          newItems[existingItemIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({ 
            items: [...items, { 
              ...product, 
              quantity, 
              size, 
              color,
              image: product.images?.[0] || product.image 
            }] 
          });
        }
      },
      removeItem: (productId, size, color) => {
        const items = get().items.filter(
          (item) => !(item._id === productId && item.size === size && item.color === color)
        );
        set({ items });
      },
      updateQuantity: (productId, quantity, size, color) => {
        const items = get().items.map((item) => 
          item._id === productId && item.size === size && item.color === color
            ? { ...item, quantity }
            : item
        );
        set({ items });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        if (!items.find((item) => item._id === product._id)) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (productId) => {
        const items = get().items.filter((item) => item._id !== productId);
        set({ items });
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item._id === productId);
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
