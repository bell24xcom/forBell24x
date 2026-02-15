import { writeFile } from 'fs/promises';
import { Parser as Json2csvParser } from 'json2csv';
import PDFDocument from 'pdfkit';

export async function generateCSVReport(data: any[], fields: string[], filePath: string): Promise<string> {
  const parser = new Json2csvParser({ fields });
  const csv = parser.parse(data);
  await writeFile(filePath, csv);
  return filePath;
}

export async function generatePDFReport(data: any[], filePath: string): Promise<string> {
  const doc = new PDFDocument();
  const stream = doc.pipe(require('fs').createWriteStream(filePath));
  doc.fontSize(14).text('Project Report', { align: 'center' });
  doc.moveDown();
  data.forEach((item, idx) => {
    doc.fontSize(10).text(`${idx + 1}. ${JSON.stringify(item)}`);
  });
  doc.end();
  await new Promise((resolve) => stream.on('finish', resolve));
  return filePath;
}
