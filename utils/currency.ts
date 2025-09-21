import currency from "currency-codes";

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return "$"; // default if nothing provided

  try {
    const upperCode = currencyCode.toUpperCase();
    const currencyData = currency.code(upperCode);

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

    if (!currencyData) {
      return symbolMap[upperCode] || "$"; // fallback to map or "$"
    }

    return symbolMap[currencyData.code] || "$";
  } catch (err) {
    return "$"; // final fallback
  }
}
