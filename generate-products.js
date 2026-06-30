const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('products-export.json', 'utf8'));
const categories = [...new Set(raw.map(p => p.category))].sort();
const brands = [...new Set(raw.map(p => p.brand))].sort();

function esc(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

function getImage(img) {
  // Use the ORIGINAL image from the export as-is (skip base64 only)
  if (!img || img.startsWith('data:')) {
    return 'https://placehold.co/600x400/1a1a2e/555?text=No+Image';
  }
  // Keep original URL but upgrade bing size
  if (img.includes('tse.mm.bing.net')) {
    return img.replace(/w=240/g, 'w=600').replace(/h=180/g, 'h=400');
  }
  return img;
}

let output = `export type Product = {
  id: string
  sku: string
  name: string
  description: string
  price: number
  brand: string
  category: string
  status: string
  qty: number
  image: string
}

export const CATEGORIES = [
  'All',
${categories.map(c => `  '${c}',`).join('\n')}
]

export const BRANDS = [
  'All',
${brands.map(b => `  '${b.replace(/'/g, "\\'")}',`).join('\n')}
]

export const products: Product[] = [\n`;

raw.forEach((p, i) => {
  const id = `p${String(i + 1).padStart(4, '0')}`;
  const sku = esc(p.sku || '').substring(0, 80);
  const name = esc(p.name || p.sku || '').substring(0, 120);
  const desc = esc(p.description || '').substring(0, 250);
  const price = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
  const brand = esc(p.brand || 'N/A');
  const category = esc(p.category || 'Other');
  const status = esc(p.status || 'Price List');
  const qty = typeof p.qty === 'number' ? p.qty : parseInt(p.qty) || 0;
  const image = esc(getImage(p.image));

  output += `  { id: "${id}", sku: "${sku}", name: "${name}", description: "${desc}", price: ${price.toFixed(2)}, brand: "${brand}", category: "${category}", status: "${status}", qty: ${qty}, image: "${image}" },\n`;
});

output += `]

export function getProductById(id: string) { return products.find((p) => p.id === id) }
export function getProductsByCategory(category: string) { if (category === 'All') return products; return products.filter((p) => p.category === category) }
export function searchProducts(query: string) { const q = query.toLowerCase(); return products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) }
export function getProductsByBrand(brand: string) { if (brand === 'All') return products; return products.filter((p) => p.brand === brand) }
`;

fs.writeFileSync('lib/products-data.ts', output, 'utf8');
console.log('Done: ' + raw.length + ' products with original images restored');
