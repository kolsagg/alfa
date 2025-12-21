import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FXState {
  rates: Record<string, number>;
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
  fetchRates: () => Promise<void>;
}

const DEFAULT_RATES: Record<string, number> = {
  TRY: 1,
  USD: 35.5, // Fallback
  EUR: 37.5, // Fallback
};

const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/TRY`;

export const useFXStore = create<FXState>()(
  persist(
    (set, get) => ({
      rates: DEFAULT_RATES,
      lastUpdated: null,
      isLoading: false,
      error: null,

      fetchRates: async () => {
        // 24 hour cache check
        const lastUpdated = get().lastUpdated;
        if (lastUpdated) {
          const lastDate = new Date(lastUpdated);
          const now = new Date();
          const hoursDiff =
            (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

          if (hoursDiff < 24 && Object.keys(get().rates).length > 1) {
            console.log("[FXStore] Using cached rates (valid for 24h)");
            return;
          }
        }

        if (!API_KEY || API_KEY === "your_api_key_here") {
          console.warn("[FXStore] API Key missing, using fallback rates");
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch(BASE_URL);
          const data = await response.json();

          if (data.result === "success") {
            // We want the inverse rates because our base is TRY
            // and we want to know how much 1 USD/EUR is in TRY
            // The API returns: 1 TRY = X USD. So 1 USD = 1/X TRY.
            const apiRates = data.conversion_rates;
            const processedRates: Record<string, number> = {
              TRY: 1,
              USD: 1 / apiRates.USD,
              EUR: 1 / apiRates.EUR,
            };

            set({
              rates: processedRates,
              lastUpdated: new Date().toISOString(),
              isLoading: false,
            });
            console.log("[FXStore] Rates updated successfully", processedRates);
          } else {
            throw new Error(data["error-type"] || "API Error");
          }
        } catch (err) {
          console.error("[FXStore] Fetch failed:", err);
          set({
            error: "Kur bilgileri güncellenemedi, sabit kurlar kullanılıyor.",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "fx-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
