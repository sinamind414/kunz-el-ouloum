// Fix script: reconstruct gen-phases-45-52.mjs
const fs = require('fs');
const s = fs.readFileSync('scripts/gen-phases-45-52.mjs', 'utf8');

// The original SVG52 ends with: </svg>`;
const svgClose = '                    </svg>`;';
const svgEnd = s.indexOf(svgClose);
console.log('SVG52 close found at:', svgEnd);

if (svgEnd === -1) {
  console.error('Could not find SVG52 close');
  process.exit(1);
}

// Original content is everything up to and including the SVG52 close
const original = s.substring(0, svgEnd + svgClose.length);
console.log('Original length:', original.length);
console.log('Original ends with:', JSON.stringify(original.substring(original.length - 30)));

// Verify this ends with the SVG52 template literal close
fs.writeFileSync('scripts/gen-phases-45-52.mjs', original, 'utf8');
console.log('Restored original to gen-phases-45-52.mjs');
console.log('New file length:', fs.readFileSync('scripts/gen-phases-45-52.mjs', 'utf8').length);
