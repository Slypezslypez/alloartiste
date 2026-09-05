import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

// Petites briques communes pour générer des PDF "maison" (fiche technique, contrat) sans dépendance
// système (pdf-lib est du JS pur, compatible avec les fonctions serverless de Vercel).

const GOLD = rgb(0.72, 0.55, 0.15);
const INK = rgb(0.1, 0.09, 0.08);
const MUTED = rgb(0.45, 0.43, 0.4);
const PAGE_WIDTH = 595.28; // A4 portrait, en points
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;

export type PdfCursor = {
  doc: PDFDocument;
  page: PDFPage;
  fontRegular: PDFFont;
  fontBold: PDFFont;
  y: number;
};

export async function createBrandedPdf(title: string): Promise<PdfCursor> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;

  page.drawText("ALLOARTISTE", { x: MARGIN, y, size: 12, font: fontBold, color: GOLD });
  y -= 28;
  page.drawText(title, { x: MARGIN, y, size: 20, font: fontBold, color: INK });
  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: rgb(0.85, 0.82, 0.75)
  });
  y -= 26;

  return { doc, page, fontRegular, fontBold, y };
}

// Découpe un texte en lignes qui tiennent dans maxWidth, puis les dessine les unes sous les autres.
// Retourne le curseur y après le bloc de texte.
export function drawWrappedText(
  cursor: PdfCursor,
  text: string,
  opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; maxWidth?: number; lineGap?: number } = {}
): PdfCursor {
  const size = opts.size ?? 11;
  const font = opts.bold ? cursor.fontBold : cursor.fontRegular;
  const color = opts.color ?? INK;
  const maxWidth = opts.maxWidth ?? PAGE_WIDTH - MARGIN * 2;
  const lineGap = opts.lineGap ?? size * 1.4;

  const paragraphs = (text || "").split("\n");
  let y = cursor.y;
  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ").filter(Boolean);
    if (words.length === 0) {
      y -= lineGap;
      continue;
    }
    let line = "";
    for (const word of words) {
      const attempt = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(attempt, size);
      if (width > maxWidth && line) {
        if (y < MARGIN) {
          cursor.page = cursor.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          y = PAGE_HEIGHT - MARGIN;
        }
        cursor.page.drawText(line, { x: MARGIN, y, size, font, color });
        y -= lineGap;
        line = word;
      } else {
        line = attempt;
      }
    }
    if (line) {
      if (y < MARGIN) {
        cursor.page = cursor.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
      cursor.page.drawText(line, { x: MARGIN, y, size, font, color });
      y -= lineGap;
    }
  }
  cursor.y = y;
  return cursor;
}

export function drawFieldLine(cursor: PdfCursor, label: string, value: string): PdfCursor {
  if (cursor.y < MARGIN) {
    cursor.page = cursor.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursor.y = PAGE_HEIGHT - MARGIN;
  }
  cursor.page.drawText(label.toUpperCase(), { x: MARGIN, y: cursor.y, size: 9, font: cursor.fontBold, color: MUTED });
  cursor.y -= 15;
  drawWrappedText(cursor, value || "—", { size: 12 });
  cursor.y -= 10;
  return cursor;
}

export async function finishPdf(cursor: PdfCursor): Promise<Uint8Array> {
  return cursor.doc.save();
}
