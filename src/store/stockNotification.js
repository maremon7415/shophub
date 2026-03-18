import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStockNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      subscribe: (product) => {
        const notifications = get().notifications;
        if (!notifications.find(n => n.productId === product._id)) {
          set({ notifications: [...notifications, {
            productId: product._id,
            productName: product.name,
            productSlug: product.slug,
            email: null,
            subscribedAt: new Date().toISOString()
          }]});
        }
      },
      unsubscribe: (productId) => {
        const notifications = get().notifications.filter(n => n.productId !== productId);
        set({ notifications });
      },
      isSubscribed: (productId) => {
        return get().notifications.some(n => n.productId === productId);
      },
      setEmail: (productId, email) => {
        const notifications = get().notifications.map(n => 
          n.productId === productId ? { ...n, email } : n
        );
        set({ notifications });
      },
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'stock-notification-storage',
    }
  )
);
