const fs = require("fs");

const rawData = fs.readFileSync("data.json", "utf-8");
const parsed = JSON.parse(rawData);
const products = parsed.products;

// Optional: remove deleted items
const filteredProducts = products.filter(p => !p.deleted);

// Save to a new JSON file
fs.writeFileSync("products.json", JSON.stringify(filteredProducts, null, 2));
console.log(`✅ Extracted ${filteredProducts.length} products to products.json`);
