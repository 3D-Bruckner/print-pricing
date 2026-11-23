// The price of a 3D print from the slicer's weight and time. One calculator for everything that shows or suggests a price. Pure and without
// dependencies, so it runs in a browser as well as on a server.

/** The selling rates in euros. Keep them in step with the "(pro Kilo)", "Druckzeit (pro Stunde)" and "Auftragspauschale" products in Invoice Ninja. */
export const RATES = Object.freeze({
  perKg: Object.freeze({ PLA: 45, PETG: 50 }),
  perHour: 1,
  orderFee: 2,
  /** Added to filament and time for multi-colour prints: AMS wear and handling. Flush waste and colour-change time are already in the slicer's numbers. */
  multicolorSurcharge: 0.1,
});

/** How far a rough estimate may be off, either way. */
export const ESTIMATE_SPREAD = 0.125;

const addOnsTotal = (addOns = []) => addOns.reduce((sum, a) => sum + a.pricePerPiece * a.quantity, 0);

/** A single-colour price with the multi-colour surcharge on everything but the order fee. */
export const multicolorPrice = (singleColorPrice, rates = RATES) => (singleColorPrice - rates.orderFee) * (1 + rates.multicolorSurcharge) + rates.orderFee;

function unrounded({ weightGrams, printTimeMinutes, multicolor, material, addOns }, rates) {
  const single = (weightGrams / 1000) * rates.perKg[material] + (printTimeMinutes / 60) * rates.perHour + rates.orderFee;
  // Add-ons come after the surcharge: it covers wear and handling of the print, not bought parts.
  return (multicolor ? multicolorPrice(single, rates) : single) + addOnsTotal(addOns);
}

/** What the formula gives, to the cent. Quotes and invoices use this amount. */
export function exactPrice(input, rates = RATES) {
  return Math.round(unrounded(input, rates) * 100) / 100;
}

/** A price as customers see it: rounded up to whole euros (from the cents, so a float's 6.0000001 stays 6). */
export const roundUpEuros = (price) => Math.ceil(Math.round(price * 100) / 100);

/** The price customers see for a print: the exact one rounded up, at least 1 €. */
export function customerPrice(input, rates = RATES) {
  return Math.max(1, roundUpEuros(exactPrice(input, rates)));
}

/** What a price is made of, in euros and unrounded. */
export function priceParts({ weightGrams, printTimeMinutes, multicolor, material, addOns }, rates = RATES) {
  const materialPart = (weightGrams / 1000) * rates.perKg[material];
  const time = (printTimeMinutes / 60) * rates.perHour;
  return {
    material: materialPart,
    time,
    multicolor: multicolor ? (materialPart + time) * rates.multicolorSurcharge : 0,
    addOns: addOnsTotal(addOns),
    fee: rates.orderFee,
  };
}

/** A rough price range around the formula's price, unrounded. */
export function estimateRange(input, rates = RATES) {
  const price = unrounded(input, rates);
  return { low: price * (1 - ESTIMATE_SPREAD), high: price * (1 + ESTIMATE_SPREAD) };
}
