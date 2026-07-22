import { PDFDocument, StandardFonts, degrees, rgb } from '../assets/vendor/pdf-lib.esm.min.js';

const PAGE_SIZE = [841.89, 595.28];

const THEMES = {
  birthday: {
    background: '#FFF7EF',
    panel: '#FFFFFF',
    accent: '#D85C4A',
    secondary: '#F3B43F',
    soft: '#FCE6DC',
    ink: '#19352C',
    eyebrow: 'HOY CELEBRAMOS CONTIGO',
    title: '¡FELIZ CUMPLEAÑOS!',
    message: 'Que este nuevo año de vida llegue con momentos memorables, aprendizajes y muchas razones para sonreír. Gracias por compartir tu energía con nuestro distrito.',
  },
  anniversary: {
    background: '#F2F7F3',
    panel: '#FFFFFF',
    accent: '#006241',
    secondary: '#B8862B',
    soft: '#DDEDE5',
    ink: '#17372D',
    eyebrow: 'UN GRAN RECONOCIMIENTO',
    title: 'CELEBRAMOS TU ANIVERSARIO',
    message: 'Gracias por construir experiencias, acompañar al equipo y dejar tu huella cada día. Tu compromiso hace más fuerte a nuestro distrito.',
  },
};

function color(hex){
  const value = hex.replace('#', '');
  return rgb(
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  );
}

function safeText(value = ''){
  return String(value)
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseLocalDate(value){
  if(value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatLongDate(value){
  const formatted = parseLocalDate(value).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return safeText(formatted.charAt(0).toUpperCase() + formatted.slice(1));
}

function anniversaryYears(source, occurrence){
  const start = parseLocalDate(source);
  const event = parseLocalDate(occurrence);
  return Math.max(1, event.getFullYear() - start.getFullYear());
}

function fitText(font, text, maxWidth, preferredSize, minimumSize = 16){
  let size = preferredSize;
  while(size > minimumSize && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
  return size;
}

function wrappedLines(font, text, size, maxWidth){
  const words = safeText(text).split(' ').filter(Boolean);
  const lines = [];
  let line = '';
  for(const word of words){
    const candidate = line ? `${line} ${word}` : word;
    if(!line || font.widthOfTextAtSize(candidate, size) <= maxWidth){
      line = candidate;
    }else{
      lines.push(line);
      line = word;
    }
  }
  if(line) lines.push(line);
  return lines;
}

function drawCentered(page, text, font, size, y, fill, centerX, maxWidth = null){
  const content = safeText(text);
  const actualSize = maxWidth ? fitText(font, content, maxWidth, size, Math.max(11, size * 0.58)) : size;
  const width = font.widthOfTextAtSize(content, actualSize);
  page.drawText(content, { x: centerX - width / 2, y, size: actualSize, font, color: fill });
  return actualSize;
}

function drawRocket(page, x, y){
  const green = color('#006241');
  const mint = color('#D4E9E2');
  const coral = color('#D85C4A');
  const gold = color('#F3B43F');
  page.drawEllipse({ x: x + 13, y: y + 17, xScale: 9, yScale: 19, rotate: degrees(-42), color: green });
  page.drawEllipse({ x: x + 14, y: y + 21, xScale: 4.2, yScale: 4.2, color: mint });
  page.drawRectangle({ x: x + 1, y: y + 4, width: 11, height: 5, rotate: degrees(43), color: coral });
  page.drawRectangle({ x: x + 5, y: y, width: 8, height: 4, rotate: degrees(43), color: gold });
}

function drawBirthdayMark(page, x, y, theme){
  page.drawRectangle({ x, y, width: 88, height: 54, color: color(theme.soft), borderColor: color(theme.accent), borderWidth: 2 });
  page.drawRectangle({ x: x + 8, y: y + 22, width: 72, height: 9, color: color(theme.accent) });
  page.drawRectangle({ x: x + 21, y: y + 54, width: 6, height: 17, color: color(theme.secondary) });
  page.drawRectangle({ x: x + 41, y: y + 54, width: 6, height: 17, color: color(theme.secondary) });
  page.drawRectangle({ x: x + 61, y: y + 54, width: 6, height: 17, color: color(theme.secondary) });
  [24, 44, 64].forEach(cx => page.drawCircle({ x: x + cx, y: y + 74, size: 3.3, color: color(theme.accent) }));
}

function drawAnniversaryMark(page, x, y, theme, years, bold){
  page.drawCircle({ x: x + 44, y: y + 44, size: 39, color: color(theme.soft), borderColor: color(theme.secondary), borderWidth: 2 });
  page.drawCircle({ x: x + 44, y: y + 44, size: 28, borderColor: color(theme.accent), borderWidth: 2 });
  drawCentered(page, `${years}`, bold, 30, y + 34, color(theme.accent), x + 44, 48);
  page.drawLine({ start: { x: x + 19, y: y + 10 }, end: { x: x + 10, y: y - 8 }, thickness: 8, color: color(theme.secondary) });
  page.drawLine({ start: { x: x + 69, y: y + 10 }, end: { x: x + 78, y: y - 8 }, thickness: 8, color: color(theme.secondary) });
}

function drawConfetti(page, theme){
  const accents = [color(theme.accent), color(theme.secondary), color('#006241')];
  const points = [[34,510],[66,548],[111,520],[750,82],[792,119],[731,505],[788,476],[45,102],[104,70]];
  points.forEach(([x,y], index) => {
    if(index % 2){
      page.drawCircle({ x, y, size: 4 + (index % 3), color: accents[index % accents.length], opacity: 0.72 });
    }else{
      page.drawRectangle({ x, y, width: 5, height: 18, rotate: degrees(index * 13 + 18), color: accents[index % accents.length], opacity: 0.72 });
    }
  });
}

function fileNameFor(person, kind){
  const name = safeText(person.NOMBRE || person.nombre || 'Partner')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
  return `${kind === 'anniversary' ? 'Aniversario' : 'Cumpleanos'}_${name || 'Partner'}.pdf`;
}

export async function buildCelebrationPdf(person){
  const kind = safeText(person.Tipo).toLowerCase().startsWith('anivers') ? 'anniversary' : 'birthday';
  const theme = THEMES[kind];
  const occurrence = person.occurrence || person.FechaEvento || new Date();
  const years = kind === 'anniversary' ? anniversaryYears(person.Fecha, occurrence) : null;
  const name = safeText(person.NOMBRE || person.nombre || 'Partner');
  const store = safeText(person.TIENDA || person.tienda || 'Distrito Kike');
  const role = safeText(person.PUESTO || person.puesto || 'Partner');

  const document = await PDFDocument.create();
  document.setTitle(kind === 'anniversary' ? `Aniversario de ${name}` : `Feliz cumpleaños, ${name}`);
  document.setAuthor('Distrito Kike · JUNTÉMONOS MÁS');
  document.setSubject('Reconocimiento para partners');
  document.setKeywords(['Distrito Kike', 'JUNTÉMONOS MÁS', kind === 'anniversary' ? 'Aniversario' : 'Cumpleaños']);

  const page = document.addPage(PAGE_SIZE);
  const { width, height } = page.getSize();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const italic = await document.embedFont(StandardFonts.HelveticaOblique);

  page.drawRectangle({ x: 0, y: 0, width, height, color: color(theme.background) });
  page.drawCircle({ x: -30, y: height + 10, size: 150, color: color(theme.soft), opacity: 0.9 });
  page.drawCircle({ x: width + 10, y: -15, size: 170, color: color(theme.soft), opacity: 0.8 });
  drawConfetti(page, theme);

  page.drawText('JUNTÉMONOS', { x: 54, y: height - 62, size: 31, font: bold, color: color('#006241') });
  page.drawText('MÁS', { x: 286, y: height - 62, size: 25, font: italic, color: color('#111111') });
  page.drawText('DISTRITO KIKE', { x: width - 188, y: height - 57, size: 13, font: bold, color: color('#006241') });
  drawRocket(page, width - 57, height - 73);

  const panelX = 54;
  const panelY = 86;
  const panelW = width - 108;
  const panelH = 410;
  page.drawRectangle({ x: panelX + 6, y: panelY - 7, width: panelW, height: panelH, color: color('#C9D9D1'), opacity: 0.42 });
  page.drawRectangle({ x: panelX, y: panelY, width: panelW, height: panelH, color: color(theme.panel), borderColor: color(theme.soft), borderWidth: 1.5 });
  page.drawRectangle({ x: panelX, y: panelY, width: 190, height: panelH, color: color(theme.accent) });

  const markX = panelX + 51;
  const markY = panelY + 230;
  if(kind === 'birthday') drawBirthdayMark(page, markX, markY, theme);
  else drawAnniversaryMark(page, markX, markY, theme, years, bold);

  drawCentered(page, theme.eyebrow, bold, 12, panelY + 188, color('#FFFFFF'), panelX + 95, 158);
  drawCentered(page, formatLongDate(occurrence), regular, 11, panelY + 156, color('#FFFFFF'), panelX + 95, 162);
  page.drawLine({ start: { x: panelX + 35, y: panelY + 137 }, end: { x: panelX + 155, y: panelY + 137 }, thickness: 1, color: color('#FFFFFF'), opacity: 0.65 });
  drawCentered(page, 'DISTRITO KIKE', bold, 12, panelY + 107, color('#FFFFFF'), panelX + 95, 158);
  drawCentered(page, 'JUNTÉMONOS MÁS', regular, 10, panelY + 83, color('#FFFFFF'), panelX + 95, 158);

  const contentX = panelX + 226;
  const contentW = panelW - 258;
  page.drawText(theme.eyebrow, { x: contentX, y: panelY + 344, size: 11, font: bold, color: color(theme.secondary) });
  page.drawText(theme.title, { x: contentX, y: panelY + 303, size: fitText(bold, theme.title, contentW, 29, 21), font: bold, color: color(theme.accent) });
  if(kind === 'anniversary'){
    const yearsLabel = years === 1 ? '1 AÑO HACIENDO EQUIPO' : `${years} AÑOS HACIENDO EQUIPO`;
    page.drawText(yearsLabel, { x: contentX, y: panelY + 271, size: 14, font: bold, color: color(theme.ink) });
  }else{
    page.drawText('QUE SEA UN DÍA TAN ESPECIAL COMO TÚ', { x: contentX, y: panelY + 271, size: 12.5, font: bold, color: color(theme.ink) });
  }

  const nameSize = fitText(bold, name, contentW, 28, 17);
  page.drawText(name, { x: contentX, y: panelY + 218, size: nameSize, font: bold, color: color(theme.ink) });
  page.drawText(`${store}  ·  ${role}`, { x: contentX, y: panelY + 190, size: 12, font: regular, color: color('#4D655C') });
  page.drawLine({ start: { x: contentX, y: panelY + 170 }, end: { x: contentX + contentW, y: panelY + 170 }, thickness: 1.2, color: color(theme.soft) });

  const messageLines = wrappedLines(regular, theme.message, 13, contentW);
  messageLines.slice(0, 4).forEach((line, index) => {
    page.drawText(line, { x: contentX, y: panelY + 139 - (index * 20), size: 13, font: regular, color: color(theme.ink) });
  });

  page.drawText('Gracias por ser parte de lo que construimos juntos.', { x: contentX, y: panelY + 44, size: 11, font: italic, color: color(theme.accent) });
  page.drawText('#DistritoKike', { x: width - 135, y: 40, size: 11, font: bold, color: color('#006241') });

  return document.save();
}

export async function generateCelebrationPdf(person){
  const bytes = await buildCelebrationPdf(person);
  const kind = safeText(person.Tipo).toLowerCase().startsWith('anivers') ? 'anniversary' : 'birthday';
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileNameFor(person, kind);
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
