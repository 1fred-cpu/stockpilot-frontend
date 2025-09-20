import currency from "currency-codes";
export function getCurrencySymbol(currencyCode?: string) {
  const currencyData = currency.code(currencyCode as string);
  // You can use a simple mapping for common currency symbols
  const symbolMap: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    NGN: "₦",
    GHS: "₵",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "¥",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    INR: "₹",
    BRL: "R$",
    ZAR: "R",
    RUB: "₽",
    KRW: "₩",
    SGD: "S$",
    HKD: "HK$",
    MXN: "$",
    IDR: "Rp",
    TRY: "₺",
    PLN: "zł",
    THB: "฿",
    MYR: "RM",
    PHP: "₱",
    CZK: "Kč",
    HUF: "Ft",
    ILS: "₪",
    SAR: "﷼",
    AED: "د.إ",
    NZD: "NZ$",
    TWD: "NT$",
    COP: "$",
    ARS: "$",
    CLP: "$",
    EGP: "£",
    VND: "₫",
    UAH: "₴",
    RON: "lei",
    QAR: "﷼",
    KWD: "د.ك",
    BHD: ".د.ب",
    OMR: "﷼",
    JOD: "د.ا",
    MAD: "د.م.",
    // Add more as needed
  };
  return currencyData
    ? symbolMap[currencyCode as string] || currencyData.code
    : "";
}
