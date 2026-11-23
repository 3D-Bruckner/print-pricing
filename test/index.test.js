import assert from "node:assert/strict";
import { test } from "node:test";
import { customerPrice, estimateRange, exactPrice, multicolorPrice, priceParts, RATES, roundUpEuros } from "../src/index.js";

const print = { weightGrams: 87, printTimeMinutes: 180, multicolor: false, material: "PLA" };

test("a single-colour print is filament, time and the order fee", () => {
  assert.equal(exactPrice(print), 8.91); // 3.915 + 3 + 2 = 8.915, just below the half cent in floating point, as the earlier copies gave
  assert.equal(customerPrice(print), 9);
});

test("multi-colour adds 10 % to filament and time, not to the order fee", () => {
  assert.equal(exactPrice({ ...print, multicolor: true }), 9.61); // 6.915 × 1.10 + 2 = 9.6065
});

test("the estimate is 12.5 % either way", () => {
  const e = estimateRange(print);
  assert.equal(e.low.toFixed(2), "7.80");
  assert.equal(e.high.toFixed(2), "10.03");
});

test("customers see whole euros rounded up, and an exact euro stays", () => {
  assert.equal(roundUpEuros(6.45), 7);
  assert.equal(roundUpEuros(8), 8);
  assert.equal(roundUpEuros(8.000000001), 8);
  assert.equal(customerPrice({ weightGrams: 0, printTimeMinutes: 0, multicolor: false, material: "PLA" }, { ...RATES, orderFee: 0 }), 1);
});

test("add-ons count by quantity and stay outside the multi-colour surcharge", () => {
  const addOns = [
    { pricePerPiece: 0.25, quantity: 4 },
    { pricePerPiece: 0.5, quantity: 1 },
  ];
  assert.equal(exactPrice({ ...print, addOns }), 10.42); // 8.915 + 1.50
  assert.equal(exactPrice({ ...print, multicolor: true, addOns }), 11.11); // 9.6065 + 1.50
  const parts = priceParts({ ...print, multicolor: true, addOns });
  assert.equal(parts.addOns, 1.5);
  assert.equal(parts.multicolor.toFixed(4), "0.6915");
});

test("the parts add up to the price", () => {
  const input = { ...print, weightGrams: 80, material: "PETG", multicolor: true, addOns: [{ pricePerPiece: 0.3, quantity: 2 }] };
  const p = priceParts(input);
  assert.equal(Math.round((p.material + p.time + p.multicolor + p.addOns + p.fee) * 100) / 100, exactPrice(input));
});

test("other rates can be passed in", () => {
  assert.equal(exactPrice(print, { ...RATES, perHour: 2 }), 11.92);
  assert.equal(multicolorPrice(12, { ...RATES, orderFee: 0, multicolorSurcharge: 0.5 }), 18);
});

test("every price is what the two earlier copies of the formula gave", () => {
  const before = (w, m, multi, kg) => {
    const single = (w / 1000) * kg + (m / 60) * 1 + 2;
    return Math.round((multi ? (single - 2) * 1.1 + 2 : single) * 100) / 100;
  };
  for (const [material, kg] of [
    ["PLA", 45],
    ["PETG", 50],
  ])
    for (const multicolor of [false, true])
      for (let weightGrams = 1; weightGrams <= 1500; weightGrams += 7)
        for (let printTimeMinutes = 1; printTimeMinutes <= 3000; printTimeMinutes += 11) {
          const exact = exactPrice({ weightGrams, printTimeMinutes, multicolor, material });
          assert.equal(exact, before(weightGrams, printTimeMinutes, multicolor, kg));
          assert.equal(customerPrice({ weightGrams, printTimeMinutes, multicolor, material }), Math.max(1, Math.ceil(exact)));
        }
});
