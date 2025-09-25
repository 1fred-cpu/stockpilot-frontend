import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface Store {
  storeId: string;
  storeName: string;
  businessId: string;
  businessName: string;
  location: string;
  currency: string;
  isDefault: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId: string;
}

interface ActiveStore {
  storeId: string;
  businessId: string;
  storeName: string;
  currency: string;
  location: string;
  businessName: string;
  address: string;
}

interface AppStore {
  user: User | null;
  stores: Store[];
  activeStore: ActiveStore | null;
}

interface UseStore {
  appStore: AppStore;

  // Generic
  setAppStore: (appStore: Partial<AppStore>) => void;
  clearAppStore: () => void;

  // Helpers
  setUser: (user: User | null) => void;
  setStores: (stores: Store[]) => void;
  setActiveStore: (activeStore: ActiveStore | null) => void;

  // Selectors
  getActiveStore: () => Store | null;
  isLoggedIn: () => boolean;
  hasStores: () => boolean;
  activeStoreName: () => string | null;
}

const initialAppStore: AppStore = {
  user: null,
  stores: [],
  activeStore: null,
};

const useStore = create<UseStore>()(
  persist(
    immer((set, get) => ({
      appStore: initialAppStore,

      // ✅ Generic setter with merge
      setAppStore: (appStore) =>
        set((state) => {
          state.appStore = { ...state.appStore, ...appStore };
        }),

      // ✅ Reset
      clearAppStore: () =>
        set((state) => {
          state.appStore = initialAppStore;
        }),

      // ✅ Helpers
      setUser: (user) =>
        set((state) => {
          state.appStore.user = user;
        }),

      setStores: (stores) =>
        set((state) => {
          state.appStore.stores = stores;
        }),

      setActiveStore: (activeStore) =>
        set((state) => {
          state.appStore.activeStore = activeStore;
        }),

      // ✅ Selector: Get currently active store object
      getActiveStore: () => {
        const { appStore } = get();
        if (!appStore.activeStore) return null;
        return (
          appStore.stores.find(
            (s) => s.storeId === appStore.activeStore?.storeId
          ) ?? null
        );
      },

      // ✅ Computed selectors
      isLoggedIn: () => !!get().appStore.user,
      hasStores: () => get().appStore.stores.length > 0,
      activeStoreName: () => get().getActiveStore()?.storeName ?? null,
    })),
    {
      name: "app-store", // localStorage key
      partialize: (state) => ({ appStore: state.appStore }), // only persist appStore
    }
  )
);

export default useStore;
