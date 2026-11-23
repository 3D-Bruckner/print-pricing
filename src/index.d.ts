export type Material = "PLA" | "PETG";

export type Rates = {
  readonly perKg: Readonly<Record<Material, number>>;
  readonly perHour: number;
  readonly orderFee: number;
  readonly multicolorSurcharge: number;
};

/** An extra part that counts towards the price. */
export type AddOnLine = { pricePerPiece: number; quantity: number };

export type PriceInput = {
  /** Slicer total in grams, flush waste included. */
  weightGrams: number;
  printTimeMinutes: number;
  multicolor: boolean;
  material: Material;
  addOns?: readonly AddOnLine[];
};

export type PriceParts = { material: number; time: number; multicolor: number; addOns: number; fee: number };

export const RATES: Rates;
export const ESTIMATE_SPREAD: number;
export function multicolorPrice(singleColorPrice: number, rates?: Rates): number;
export function exactPrice(input: PriceInput, rates?: Rates): number;
export function roundUpEuros(price: number): number;
export function customerPrice(input: PriceInput, rates?: Rates): number;
export function priceParts(input: PriceInput, rates?: Rates): PriceParts;
export function estimateRange(input: PriceInput, rates?: Rates): { low: number; high: number };
