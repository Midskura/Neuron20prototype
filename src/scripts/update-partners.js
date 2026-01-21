// Temporary script to add partner_type to all existing partners
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/networkPartners.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add partner_type: "international" to all entries that don't have it (except co-loaders)
// Match pattern: services: [...] followed by } or notes
content = content.replace(
  /(services: \[[^\]]+\])(,?\s*notes: "[^"]*")?\s*\n(\s*)\},/g,
  (match, services, notes, indent) => {
    // Don't add if already has partner_type
    if (match.includes('partner_type')) {
      return match;
    }
    
    if (notes) {
      return `${services}${notes},\n${indent}partner_type: "international"\n${indent}},`;
    } else {
      return `${services},\n${indent}partner_type: "international"\n${indent}},`;
    }
  }
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated networkPartners.ts');
