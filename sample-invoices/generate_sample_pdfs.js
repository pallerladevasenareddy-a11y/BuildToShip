import fs from 'fs';
import path from 'path';

function createMinimalPdf(title, textLines) {
  const content = [
    '%PDF-1.4',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    'endobj',
    '3 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >>',
    'endobj',
    '4 0 obj',
    `<< /Length 120 >>`,
    'stream',
    'BT',
    '/F1 12 Tf',
    '50 750 Td',
    `(${title}) Tj`,
    'ET',
    'endstream',
    'endobj',
    'xref',
    '0 5',
    '0000000000 65535 f ',
    '0000000010 00000 n ',
    '0000000060 00000 n ',
    '0000000117 00000 n ',
    '0000000204 00000 n ',
    'trailer',
    '<< /Size 5 /Root 1 0 R >>',
    'startxref',
    '376',
    '%%EOF'
  ].join('\n');

  return Buffer.from(content);
}

const dir = path.resolve('sample-invoices');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, 'sample_a_clean.pdf'), createMinimalPdf('Apex Cloud Solutions - Invoice INV-2026-9042'));
fs.writeFileSync(path.join(dir, 'sample_b_duplicate.pdf'), createMinimalPdf('Apex Cloud Solutions - Duplicate Invoice INV-2026-1042'));
fs.writeFileSync(path.join(dir, 'sample_c_arithmetic_mismatch.pdf'), createMinimalPdf('Quantum Logistics - Mismatch Invoice QL-2026-8819'));

console.log('Sample PDF invoices generated successfully in sample-invoices/');
