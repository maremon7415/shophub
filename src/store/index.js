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
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: (parseInt(newItems[existingItemIndex].quantity, 10) || 0) + (parseInt(quantity, 10) || 1),
          };
          set({ items: newItems });
        } else {
          const image = product.images?.[0] || product.image || '';
          set({ 
            items: [...items, { 
              _id: product._id,
              name: product.name,
              price: parseFloat(product.price) || 0,
              comparePrice: parseFloat(product.comparePrice) || 0,
              image,
              slug: product.slug,
              quantity: parseInt(quantity, 10) || 1,
              size: size || null,
              color: color || null,
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
        const parsedQuantity = parseInt(quantity, 10);
        if (isNaN(parsedQuantity) || parsedQuantity < 1) return;

        const items = get().items.map((item) => 
          item._id === productId && item.size === size && item.color === color
            ? { ...item, quantity: parsedQuantity }
            : item
        );
        set({ items });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          const price = parseFloat(item.price) || 0;
          const qty = parseInt(item.quantity, 10) || 0;
          return total + (price * qty);
        }, 0);
      },
      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + (parseInt(item.quantity, 10) || 0), 0);
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

export const useRecentStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const filteredItems = items.filter((item) => item._id !== product._id);
        const newItems = [product, ...filteredItems].slice(0, 10);
        set({ items: newItems });
      },
      clearRecent: () => set({ items: [] }),
    }),
    {
      name: 'recent-storage',
    }
  )
);

export const useCompareStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        if (items.length >= 4) return;
        if (!items.find((item) => item._id === product._id)) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (productId) => {
        const items = get().items.filter((item) => item._id !== productId);
        set({ items });
      },
      clearCompare: () => set({ items: [] }),
      isInCompare: (productId) => {
        return get().items.some((item) => item._id === productId);
      },
    }),
    {
      name: 'compare-storage',
    }
  )
);

export const useQuickViewStore = create((set) => ({
  isOpen: false,
  product: null,
  openQuickView: (product) => set({ isOpen: true, product }),
  closeQuickView: () => set({ isOpen: false, product: null }),
}));

export * from './stockNotification';
