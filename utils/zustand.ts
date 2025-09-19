import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface Store {
  store_id: string;
  store_name: string;
  business_id: string;
  business_name: string;
  location: string;
  currency: string;
  is_default: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  business_id: string;
}

interface ActiveStore {
  store_id: string;
  business_id: string;
  store_name: string;
  currency: string;
  location: string;
  business_name: string;
}

interface AppStore {
  user: User | null;
  stores: Store[];
  active_store: ActiveStore | null;
}

interface UseStore {
  appStore: AppStore;

  // Generic
  setAppStore: (appStore: Partial<AppStore>) => void;
  clearAppStore: () => void;

  // Helpers
  setUser: (user: User | null) => void;
  setStores: (stores: Store[]) => void;
  setActiveStore: (active_store: ActiveStore | null) => void;

  // Selectors
  getActiveStore: () => Store | null;
  isLoggedIn: () => boolean;
  hasStores: () => boolean;
  activeStoreName: () => string | null;
}

const initialAppStore: AppStore = {
  user: null,
  stores: [],
  active_store: null,
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

      setActiveStore: (active_store) =>
        set((state) => {
          state.appStore.active_store = active_store;
        }),

      // ✅ Selector: Get currently active store object
      getActiveStore: () => {
        const { appStore } = get();
        if (!appStore.active_store) return null;
        return (
          appStore.stores.find(
            (s) => s.store_id === appStore.active_store?.store_id
          ) ?? null
        );
      },

      // ✅ Computed selectors
      isLoggedIn: () => !!get().appStore.user,
      hasStores: () => get().appStore.stores.length > 0,
      activeStoreName: () => get().getActiveStore()?.store_name ?? null,
    })),
    {
      name: "app-store", // localStorage key
      partialize: (state) => ({ appStore: state.appStore }), // only persist appStore
    }
  )
);

export default useStore;
