# print-pricing

The price of a 3D print from the slicer's weight and time. It is the one calculator behind [3dbruckner.de](https://3dbruckner.de) and its [portfolio](https://github.com/3D-Bruckner/portfolio), so a price can't differ between them.

```js
import { customerPrice, exactPrice, priceParts } from "print-pricing";

const print = { weightGrams: 50, printTimeMinutes: 120, multicolor: false, material: "PLA", addOns: [{ pricePerPiece: 0.25, quantity: 4 }] };

exactPrice(print); // 7.25, for quotes and invoices
customerPrice(print); // 8, rounded up to whole euros
priceParts(print); // { material: 2.25, time: 2, multicolor: 0, addOns: 1, fee: 2 }
```

- **The formula:** filament + time + multi-colour surcharge on those two + add-ons + order fee.
- **Rounding:** customers see whole euros, rounded up. Quotes and invoices keep the exact amount.
- **Rates:** `RATES` holds the selling rates. Every function takes other rates as its last argument.

It has no dependencies and runs in a browser and on a server. Install it from a release tag:

```sh
npm install https://github.com/3D-Bruckner/print-pricing/archive/refs/tags/v0.1.0.tar.gz
```

Tests: `npm test`. Formatting: `npm run format`. A release is a tag `vX.Y.Z` on `main` that matches `package.json`.

Apache-2.0.
