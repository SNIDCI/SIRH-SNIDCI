import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PayslipLine } from "@/lib/types";

const INK = rgb(0x16 / 255, 0x20 / 255, 0x2b / 255);
const ACCENT = rgb(0x27 / 255, 0x4a / 255, 0x3e / 255);
const SLATE = rgb(0x5b / 255, 0x6b / 255, 0x6a / 255);
const ACCENT_SOFT = rgb(0xe4 / 255, 0xee / 255, 0xe8 / 255);
const HEADER_BG = rgb(0xf4 / 255, 0xf6 / 255, 0xf4 / 255);
const LINE_COLOR = rgb(0xdd / 255, 0xe3 / 255, 0xe0 / 255);

function formatAmount(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " F";
}

export async function buildPayslipPdf({
  companyName,
  periodLabel,
  employeeName,
  employeeRole,
  lines,
  netSalary,
}: {
  companyName: string;
  periodLabel: string;
  employeeName: string;
  employeeRole: string;
  lines: PayslipLine[];
  netSalary: number;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 40;
  let y = height - 50;

  page.drawText(companyName, { x: marginX, y, size: 18, font: bold, color: INK });
  y -= 18;
  page.drawText(`Bulletin de paie - ${periodLabel}`, { x: marginX, y, size: 10, font, color: SLATE });
  y -= 10;
  page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 2, color: ACCENT });
  y -= 30;

  page.drawText("EMPLOYÉ", { x: marginX, y, size: 8, font: bold, color: SLATE });
  page.drawText("PÉRIODE", { x: marginX + 280, y, size: 8, font: bold, color: SLATE });
  y -= 14;
  page.drawText(employeeName, { x: marginX, y, size: 11, font, color: INK });
  page.drawText(periodLabel, { x: marginX + 280, y, size: 11, font, color: INK });
  y -= 16;
  page.drawText("POSTE", { x: marginX, y, size: 8, font: bold, color: SLATE });
  page.drawText("DATE D'ÉMISSION", { x: marginX + 280, y, size: 8, font: bold, color: SLATE });
  y -= 14;
  page.drawText(employeeRole || "—", { x: marginX, y, size: 11, font, color: INK });
  page.drawText(new Date().toLocaleDateString("fr-FR"), { x: marginX + 280, y, size: 11, font, color: INK });
  y -= 26;

  page.drawRectangle({ x: marginX, y: y - 4, width: width - marginX * 2, height: 20, color: HEADER_BG });
  page.drawText("LIBELLÉ", { x: marginX + 8, y: y + 2, size: 9, font: bold, color: SLATE });
  page.drawText("MONTANT", { x: width - marginX - 70, y: y + 2, size: 9, font: bold, color: SLATE });
  y -= 24;

  for (const line of lines) {
    page.drawText(line.label, { x: marginX + 8, y, size: 10, font, color: INK });
    const amountText = formatAmount(line.amount);
    const amountWidth = font.widthOfTextAtSize(amountText, 10);
    page.drawText(amountText, { x: width - marginX - 8 - amountWidth, y, size: 10, font, color: INK });
    y -= 6;
    page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 0.5, color: LINE_COLOR });
    y -= 16;
  }

  y -= 10;
  page.drawRectangle({ x: marginX, y: y - 6, width: width - marginX * 2, height: 30, color: ACCENT_SOFT });
  page.drawText("Net à payer", { x: marginX + 8, y: y + 4, size: 12, font: bold, color: ACCENT });
  const netText = formatAmount(netSalary);
  const netWidth = bold.widthOfTextAtSize(netText, 14);
  page.drawText(netText, { x: width - marginX - 8 - netWidth, y: y + 2, size: 14, font: bold, color: ACCENT });

  y -= 50;
  page.drawText(
    "Document genere automatiquement a partir des donnees saisies par le service RH - conservez ce bulletin.",
    { x: marginX, y, size: 8, font, color: SLATE }
  );

  return pdfDoc.save();
}
