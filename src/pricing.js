/* Fiyatların ve AI hakkının kaynağı backend paket kataloğu; ilk HTML ağ olmadan da okunur. */
export async function initPricing() {
  const api = (import.meta.env.VITE_API_BASE || "https://threed-license.codecore.tech").replace(/\/$/, "");
  try {
    const response = await fetch(`${api}/v1/web/plans`, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return;
    const catalog = await response.json();
    if (catalog.currency !== "USD" || catalog.price_period !== "month" || !Array.isArray(catalog.plans)) return;
    // Yalnız eksiksiz ve geçerli katalog uygulanır; ağ hatasında onaylı HTML fiyatları kalır.
    const cards = [...document.querySelectorAll(".pricing-plan[data-plan]")];
    const entries = cards.map((card) => catalog.plans.find((p) => p.id === card.dataset.plan));
    if (entries.some((p) => !p || !Number.isSafeInteger(p.price_cents) || p.price_cents < 0 ||
      !Number.isSafeInteger(p.ai_monthly_limit_cents) || p.ai_monthly_limit_cents < 0)) return;
    const usd = (cents) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    cards.forEach((card, index) => {
      const plan = entries[index];
      card.querySelector("[data-price]").textContent = usd(plan.price_cents);
      card.querySelector("[data-allowance]").textContent = usd(plan.ai_monthly_limit_cents);
    });
  } catch { /* Katalog yayını/bağlantı beklenirken fiyat bölümü kullanılabilir kalır. */ }
}
