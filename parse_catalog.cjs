const fs = require('fs');
const path = require('path');

const filePath = 'src/data/lista_produtos_tact_airsoft.txt';
const fileContent = fs.readFileSync(filePath, 'utf8');

const subcategoryMap = {
  'BBs e munições': [782, 781, 818, 783, 882, 858, 878, 879, 880, 881, 859, 885, 861, 883, 863, 884, 864, 876, 865, 874, 866, 873, 867, 877, 642, 643, 644, 645, 690, 797],
  'BBs Tracer': [886, 860, 887, 862, 822],
  'Bolsas e cases': [811, 812, 743, 821, 672, 606, 678, 746, 810, 809],
  'Vestuário e proteção': [803, 802, 815, 816, 814, 607, 617, 616, 625, 638, 641, 639, 619, 608, 650, 651],
  'Baterias e carregadores': [587, 598, 791, 614, 615, 630, 756, 824, 757, 819, 660, 661, 792, 676, 793, 760],
  'Motores e peças': [804, 805, 806],
  'Iluminação e outros': [798, 800, 801, 799]
};

const getSubcategory = (code) => {
  const numCode = parseInt(code, 10);
  for (const [subcat, codes] of Object.entries(subcategoryMap)) {
    if (codes.includes(numCode)) {
      return subcat;
    }
  }
  return 'Outros';
};

const lines = fileContent.split('\n');
const products = [];

lines.forEach(line => {
  const cleanLine = line.trim();
  if (!cleanLine) return;
  
  // Format: Page | Code | Description | Price BRL | Price Numeric | Category | Needs Revision | Reason
  const parts = cleanLine.split('|').map(p => p.trim());
  if (parts.length < 5) return;
  
  const page = parseInt(parts[0], 10);
  if (isNaN(page)) return; // Header or invalid line
  
  const code = parts[1];
  const description = parts[2];
  const priceBrl = parts[3];
  const priceNumeric = parseFloat(parts[4]);
  const category = parts[5] || 'Airsoft';
  const needsRevisionStr = parts[6] || 'NÃO';
  const revisionReason = parts[7] || '';
  
  const needsRevision = needsRevisionStr.toUpperCase() === 'SIM' || description.endsWith('..') || description.endsWith('...');
  
  const subcategory = getSubcategory(code);
  
  products.push({
    id: `prod_${code}`,
    code,
    description,
    price: priceNumeric,
    category,
    subcategory,
    page,
    needsRevision,
    revisionReason: needsRevision ? (revisionReason || 'Descrição abreviada no catálogo de origem') : '',
    priceHistory: [
      { price: priceNumeric, date: '2026-05-27T12:00:00Z' }
    ],
    createdAt: '2026-05-27T12:00:00Z'
  });
});

console.log('Parsed products count:', products.length);
fs.writeFileSync('src/data/parsed_products.json', JSON.stringify(products, null, 2), 'utf8');
console.log('Saved to src/data/parsed_products.json');
