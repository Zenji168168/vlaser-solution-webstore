const fs = require('fs');

// Parse the markdown-like product data
// Format: - SKU | SKU Description | Brand: X | Price: $Y | Cost: $Z | Qty: N | Status: S
// Each product from the document will be converted to our Product type

const rawData = fs.readFileSync('stock-products-raw.txt', 'utf8');
const lines = rawData.split('\n').filter(l => l.startsWith('- '));

const products = [];
let id = 1;

for (const line of lines) {
  try {
    const skuMatch = line.match(/^- ([^|]+)\|/);
    const descMatch = line.match(/\| ([^|]+)\| Brand:/);
    const brandMatch = line.match(/Brand: ([^|]+)\|/);
    const priceMatch = line.match(/Price: \$([0-9.]+)/);
    const qtyMatch = line.match(/Qty: ([0-9]+)/);
    const statusMatch = line.match(/Status: ([^$\n]+)/);
    
    if (skuMatch && brandMatch && priceMatch) {
      const sku = skuMatch[1].trim();
      const desc = descMatch ? descMatch[1].trim() : sku;
      const brand = brandMatch[1].trim();
      const price = parseFloat(priceMatch[1]);
      const qty = qtyMatch ? parseInt(qtyMatch[1]) : 0;
      const status = statusMatch ? statusMatch[1].trim() : 'Price List';
      
      products.push({ sku, desc, brand, price, qty, status });
      id++;
    }
  } catch(e) {}
}

console.log(`Parsed ${products.length} products`);
