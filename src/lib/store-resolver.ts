/**
 * Evrensel Akıllı Mağaza Çözümleyicisi (Universal Smart Store Resolver)
 * 
 * Farklı tarayıcılar (Edge, Chrome, Helium, Brave) arasında geçiş yapıldığında,
 * eklentilerin mağaza bağlantılarının kırılmasını ve hedef tarayıcının mağazayı
 * reddetmesini engeller.
 */

export interface ResolvedStoreInfo {
  storeName: "Chrome Web Store" | "Microsoft Edge Add-ons" | "Development / Unpacked";
  storeUrl: string;
  searchUrl: string;
  isDevelopment: boolean;
  canInstallDirectly: boolean;
}

/**
 * Mevcut tarayıcı ortamını kullanıcı ajanı (User-Agent) üzerinden tespit eder.
 */
export function detectCurrentBrowser(): "helium" | "edge" | "chrome" | "brave" | "other" {
  const ua = (typeof navigator !== "undefined" ? navigator.userAgent : "").toLowerCase();
  if (ua.includes("helium")) return "helium";
  if (ua.includes("edg/")) return "edge";
  if (ua.includes("brave")) return "brave";
  if (ua.includes("chrome")) return "chrome";
  return "other";
}

/**
 * Eklentinin adı, ID'si ve geliştirici modu durumuna göre en uygun mağaza ve arama linklerini üretir.
 * 
 * - Helium veya Chrome'da: Doğrudan Chrome Web Store bağlantısı ve araması üretilir.
 * - Edge'de: Hem Chrome Web Store hem Edge Add-ons uyumlu arama üretilir.
 * - Geliştirici (Unpacked) eklentilerde: Doğrudan yerel geliştirme uyarısı verilir.
 */
export function resolveStoreUrls(
  name: string,
  id: string,
  isDevelopment = false
): ResolvedStoreInfo {
  if (isDevelopment) {
    return {
      storeName: "Development / Unpacked",
      storeUrl: "",
      searchUrl: "",
      isDevelopment: true,
      canInstallDirectly: false,
    };
  }

  const browser = detectCurrentBrowser();
  const encodedName = encodeURIComponent(name);

  // Chrome Web Store evrensel şablonları
  const chromeStoreDirect = `https://chromewebstore.google.com/detail/${id}`;
  const chromeStoreSearch = `https://chromewebstore.google.com/search?q=${encodedName}`;

  // Microsoft Edge Add-ons şablonları
  const edgeStoreSearch = `https://microsoftedge.microsoft.com/addons/search?q=${encodedName}`;

  if (browser === "edge") {
    return {
      storeName: "Microsoft Edge Add-ons",
      storeUrl: chromeStoreDirect, // Edge, Chrome Web Store'dan doğrudan kurabilir
      searchUrl: edgeStoreSearch,
      isDevelopment: false,
      canInstallDirectly: true,
    };
  }

  // Helium, Chrome, Brave ve diğer tüm Chromium tarayıcılar için varsayılan: Chrome Web Store
  return {
    storeName: "Chrome Web Store",
    storeUrl: chromeStoreDirect,
    searchUrl: chromeStoreSearch,
    isDevelopment: false,
    canInstallDirectly: true,
  };
}
