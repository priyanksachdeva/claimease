import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  orgId?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => {
        const state = useAuthStore.getState();
        return !!state.token && !!state.user;
      },
    }),
    {
      name: "claimease-auth",
    },
  ),
);

interface NotificationStore {
  notifications: Array<{
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
  }>;
  addNotification: (
    message: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (message, type = "info") => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }],
    }));
    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));

interface BillsStore {
  bills: any[];
  loading: boolean;
  setBills: (bills: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useBillsStore = create<BillsStore>((set) => ({
  bills: [],
  loading: false,
  setBills: (bills) => set({ bills }),
  setLoading: (loading) => set({ loading }),
}));
