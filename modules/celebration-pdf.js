import { PDFDocument, StandardFonts, degrees, rgb } from '../assets/vendor/pdf-lib.esm.min.js';

const PAGE_SIZE = [612, 612];
const PALETTE = {
  green: '#006241',
  warmGreen: '#00754A',
  darkGreen: '#003B2A',
  deepGreen: '#004C35',
  mint: '#D4E9E2',
  paleMint: '#EEF6F2',
  cream: '#FFF8EE',
  ink: '#162F27',
  gold: '#F2C14E',
  orange: '#F26B38',
  pink: '#E98BCB',
  blue: '#72AFE5',
  white: '#FFFFFF',
};
const HASHTAGS = ['#DistritoKike', '#OrgulloCN', '#GreenApronService'];
const BIRTHDAY_MESSAGE = 'Hoy celebramos la alegría de compartir este camino contigo. Gracias por poner el corazón en cada momento y por hacer especial la experiencia de quienes te rodean. Que este nuevo año esté lleno de grandes aprendizajes, nuevas oportunidades y muchos motivos para sonreír. ¡Feliz cumpleaños!';
const ANNIVERSARY_MESSAGE = 'Hoy celebramos tu historia y el camino que has construido con nosotros. Gracias por compartir tu talento, compromiso y corazón en cada experiencia. Tu dedicación deja huella e inspira a quienes tienen la oportunidad de caminar a tu lado. Que sigamos creando grandes momentos y celebrando muchos años más juntos. ¡Feliz aniversario!';

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
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function anniversaryYears(sourceValue, occurrenceValue){
  const source = parseLocalDate(sourceValue);
  const occurrence = parseLocalDate(occurrenceValue);
  if(!source || !occurrence) return null;
  const years = occurrence.getFullYear() - source.getFullYear();
  return years >= 1 ? years : null;
}

function fitText(font, text, maxWidth, preferredSize, minimumSize = 12){
  let size = preferredSize;
  while(size > minimumSize && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
  return size;
}

function wrapLines(font, text, size, maxWidth){
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

function balancedNameLines(font, text, size, maxWidth){
  const content = safeText(text);
  if(font.widthOfTextAtSize(content, size) <= maxWidth) return [content];
  const words = content.split(' ');
  let best = null;
  for(let index = 1; index < words.length; index += 1){
    const first = words.slice(0, index).join(' ');
    const second = words.slice(index).join(' ');
    const widest = Math.max(font.widthOfTextAtSize(first, size), font.widthOfTextAtSize(second, size));
    if(widest <= maxWidth && (!best || widest < best.widest)) best = {lines:[first, second], widest};
  }
  return best ? best.lines : [content];
}

function drawCentered(page, text, font, size, y, fill, centerX, maxWidth = null){
  const content = safeText(text);
  const actual = maxWidth ? fitText(font, content, maxWidth, size, Math.max(10, size * 0.5)) : size;
  const width = font.widthOfTextAtSize(content, actual);
  page.drawText(content, {x:centerX - width / 2, y, size:actual, font, color:fill});
  return actual;
}

function drawCenteredName(page, text, font, centerX, centerY, maxWidth, preferredSize, minimumSize, fill){
  let size = preferredSize;
  let lines = balancedNameLines(font, text, size, maxWidth);
  if(lines.length === 2){
    size = Math.max(minimumSize, preferredSize * .88);
    lines = balancedNameLines(font, text, size, maxWidth);
  }
  while(size > minimumSize && lines.some(line => font.widthOfTextAtSize(line, size) > maxWidth)){
    size -= 0.5;
    lines = balancedNameLines(font, text, size, maxWidth);
  }
  if(lines.length === 1){
    drawCentered(page, lines[0], font, size, centerY - size * 0.34, fill, centerX, maxWidth);
  }else{
    const lineGap = size * 1.04;
    drawCentered(page, lines[0], font, size, centerY + lineGap * 0.16, fill, centerX, maxWidth);
    drawCentered(page, lines[1], font, size, centerY - lineGap * 0.84, fill, centerX, maxWidth);
  }
}

function drawTextBlock(page, text, font, size, x, topY, maxWidth, lineHeight, fill, maxLines = 8){
  const lines = wrapLines(font, text, size, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => page.drawText(line, {
    x,
    y:topY - index * lineHeight,
    size,
    font,
    color:fill,
  }));
  return lines.length;
}

function drawRoundedRect(page, x, y, width, height, radius, fill, opacity = 1){
  const r = Math.min(radius, width / 2, height / 2);
  page.drawRectangle({x:x + r, y, width:width - 2 * r, height, color:fill, opacity});
  page.drawRectangle({x, y:y + r, width, height:height - 2 * r, color:fill, opacity});
  page.drawCircle({x:x + r, y:y + r, size:r, color:fill, opacity});
  page.drawCircle({x:x + width - r, y:y + r, size:r, color:fill, opacity});
  page.drawCircle({x:x + r, y:y + height - r, size:r, color:fill, opacity});
  page.drawCircle({x:x + width - r, y:y + height - r, size:r, color:fill, opacity});
}

function drawJuntemonos(page, x, y, fonts, reverse = false, scale = 1){
  const primary = reverse ? color(PALETTE.white) : color(PALETTE.green);
  const accent = reverse ? color(PALETTE.cream) : color('#111111');
  const primarySize = 24 * scale;
  const accentSize = 22 * scale;
  page.drawText('JUNTÉMONOS', {x, y, size:primarySize, font:fonts.bold, color:primary});
  const offset = fonts.bold.widthOfTextAtSize('JUNTÉMONOS', primarySize) + 7 * scale;
  page.drawText('más', {x:x + offset, y:y - scale, size:accentSize, font:fonts.script, color:accent});
  const underlineStart = x + offset + 2 * scale;
  const underlineEnd = underlineStart + fonts.script.widthOfTextAtSize('más', accentSize);
  page.drawLine({start:{x:underlineStart,y:y - 5 * scale},end:{x:(underlineStart + underlineEnd) / 2,y:y - 7 * scale},thickness:2.2 * scale,color:primary});
  page.drawLine({start:{x:(underlineStart + underlineEnd) / 2,y:y - 7 * scale},end:{x:underlineEnd,y:y - 4 * scale},thickness:2.2 * scale,color:primary});
}

function drawSpark(page, x, y, radius, stroke, thickness = 2){
  const segments = [
    [[x-radius,y],[x+radius,y]], [[x,y-radius],[x,y+radius]],
    [[x-radius*.68,y-radius*.68],[x+radius*.68,y+radius*.68]],
    [[x-radius*.68,y+radius*.68],[x+radius*.68,y-radius*.68]],
  ];
  segments.forEach(([start,end]) => page.drawLine({start:{x:start[0],y:start[1]},end:{x:end[0],y:end[1]},thickness,color:stroke}));
}

function drawCoffeeBean(page, x, y, width, height, fill, seam){
  page.drawEllipse({x,y,xScale:width / 2,yScale:height / 2,rotate:degrees(-24),color:fill});
  page.drawLine({start:{x:x-width*.12,y:y-height*.34},end:{x:x+width*.12,y:y+height*.34},thickness:Math.max(1.2,width*.06),color:seam});
}

function drawSmile(page, x, y, size, stroke){
  page.drawCircle({x,y,size,borderColor:stroke,borderWidth:2.2});
  page.drawCircle({x:x-size*.36,y:y+size*.2,size:1.5,color:stroke});
  page.drawCircle({x:x+size*.36,y:y+size*.2,size:1.5,color:stroke});
  page.drawLine({start:{x:x-size*.48,y:y-size*.12},end:{x:x-size*.22,y:y-size*.39},thickness:2,color:stroke});
  page.drawLine({start:{x:x-size*.22,y:y-size*.39},end:{x:x+size*.22,y:y-size*.39},thickness:2,color:stroke});
  page.drawLine({start:{x:x+size*.22,y:y-size*.39},end:{x:x+size*.48,y:y-size*.12},thickness:2,color:stroke});
}

function drawCakeCup(page, x, y){
  const p = PALETTE;
  drawRoundedRect(page,x,y,74,58,13,color(p.white));
  page.drawCircle({x:x+75,y:y+29,size:16,borderColor:color(p.green),borderWidth:5});
  drawRoundedRect(page,x+8,y+44,58,10,5,color(p.pink));
  [[18,p.orange],[36,p.blue],[54,p.gold]].forEach(([offset,candleColor])=>{
    drawRoundedRect(page,x+offset,y+54,5,18,2.5,color(candleColor));
    page.drawCircle({x:x+offset+2.5,y:y+77,size:3.2,color:color(candleColor)});
  });
  drawCoffeeBean(page,x+37,y+25,14,22,color(p.green),color(p.white));
}

function drawHashtags(page, centerX, y, fonts, fill, dot){
  let size = 10;
  let widths = HASHTAGS.map(tag => fonts.bold.widthOfTextAtSize(tag, size));
  let total = widths.reduce((sum,item) => sum + item,0) + 30;
  while(total > 520 && size > 8){
    size -= .5;
    widths = HASHTAGS.map(tag => fonts.bold.widthOfTextAtSize(tag,size));
    total = widths.reduce((sum,item) => sum + item,0) + 30;
  }
  let x = centerX - total / 2;
  HASHTAGS.forEach((tag,index)=>{
    page.drawText(tag,{x,y,size,font:fonts.bold,color:fill});
    x += widths[index];
    if(index < HASHTAGS.length - 1){
      page.drawCircle({x:x+7.5,y:y+3.2,size:2,color:dot});
      x += 15;
    }
  });
}

function drawBirthday(page, width, height, name, store, fonts){
  const p = PALETTE;
  page.drawRectangle({x:0,y:0,width,height,color:color(p.green)});
  drawRoundedRect(page,22,22,width-44,height-44,27,color(p.cream));
  page.drawCircle({x:42,y:height-42,size:67,color:color(p.mint),opacity:.48});
  page.drawCircle({x:width-30,y:31,size:82,color:color(p.pink),opacity:.20});

  drawJuntemonos(page,48,height-56,fonts,false,.78);
  page.drawText('CELEBRACIÓN PARTNER · DISTRITO KIKE',{x:353,y:height-49,size:8.2,font:fonts.bold,color:color(p.green)});

  page.drawText('HOY CELEBRAMOS',{x:49,y:height-105,size:13,font:fonts.bold,color:color(p.green)});
  page.drawText('¡TU CUMPLEAÑOS!',{x:48,y:height-149,size:31,font:fonts.script,color:color(p.ink)});
  page.drawLine({start:{x:50,y:height-158},end:{x:185,y:height-163},thickness:3,color:color(p.green)});
  page.drawLine({start:{x:185,y:height-163},end:{x:340,y:height-157},thickness:3,color:color(p.green)});
  drawCakeCup(page,476,height-151);
  drawSpark(page,445,height-91,8,color(p.orange),2);
  drawSpark(page,568,height-168,7,color(p.blue),2);

  drawRoundedRect(page,46,304,520,136,22,color(p.green));
  page.drawCircle({x:68,y:421,size:38,color:color(p.white),opacity:.10});
  drawCenteredName(page,name,fonts.bold,width/2,390,472,37,24,color(p.white));
  drawRoundedRect(page,164,313,284,24,12,color(p.mint));
  drawCentered(page,store,fonts.bold,12,320,color(p.darkGreen),width/2,252);

  drawRoundedRect(page,46,108,520,174,20,color(p.white));
  page.drawRectangle({x:46,y:108,width:7,height:174,color:color(p.orange)});
  drawTextBlock(page,BIRTHDAY_MESSAGE,fonts.regular,12.25,74,249,462,18.4,color(p.ink),8);
  drawSmile(page,532,133,17,color(p.green));

  [[52,83,7,p.orange],[96,75,5,p.pink],[520,84,6,p.blue],[558,93,8,p.gold]].forEach(([x,y,radius,c])=>drawSpark(page,x,y,radius,color(c),1.8));
  drawHashtags(page,width/2,55,fonts,color(p.green),color(p.orange));
}

function drawYearsBadge(page, centerX, centerY, years, fonts){
  const p = PALETTE;
  page.drawCircle({x:centerX,y:centerY,size:56,color:color(p.deepGreen),borderColor:color(p.gold),borderWidth:3});
  page.drawCircle({x:centerX,y:centerY,size:46,borderColor:color(p.mint),borderWidth:1.2,borderOpacity:.55});
  if(years === null){
    drawCentered(page,'[NÚMERO]',fonts.bold,13,centerY+8,color(p.gold),centerX,84);
    drawCentered(page,'DE AÑOS',fonts.bold,9.5,centerY-11,color(p.white),centerX,78);
  }else{
    drawCentered(page,String(years),fonts.bold,36,centerY+1,color(p.gold),centerX,72);
    drawCentered(page,years === 1 ? 'AÑO JUNTOS' : 'AÑOS JUNTOS',fonts.bold,9.5,centerY-25,color(p.white),centerX,88);
  }
}

function drawAnniversary(page, width, height, name, store, years, fonts){
  const p = PALETTE;
  page.drawRectangle({x:0,y:0,width,height,color:color(p.darkGreen)});
  [96,145,196].forEach((radius,index)=>page.drawCircle({
    x:width-10,
    y:height+8,
    size:radius,
    borderColor:color(index % 2 ? p.gold : p.mint),
    borderWidth:1.7,
    borderOpacity:index % 2 ? .14 : .10,
  }));
  page.drawRectangle({x:24,y:24,width:width-48,height:height-48,borderColor:color(p.mint),borderWidth:1.1,borderOpacity:.28});
  drawCoffeeBean(page,49,515,26,42,color(p.gold),color(p.cream));
  drawCoffeeBean(page,568,72,22,35,color(p.mint),color(p.cream));

  drawJuntemonos(page,48,height-56,fonts,true,.78);
  page.drawText('RECONOCIMIENTO PARTNER · DISTRITO KIKE',{x:337,y:height-49,size:8.2,font:fonts.bold,color:color(p.mint)});
  page.drawText('CELEBRAMOS TU HISTORIA',{x:48,y:height-105,size:12.5,font:fonts.bold,color:color(p.gold)});
  page.drawText('¡FELIZ ANIVERSARIO!',{x:47,y:height-149,size:30,font:fonts.bold,color:color(p.white)});

  drawRoundedRect(page,45,333,522,110,20,color(p.cream));
  drawCenteredName(page,name,fonts.bold,width/2,400,474,36,23,color(p.darkGreen));
  drawRoundedRect(page,163,340,286,25,12.5,color(p.gold));
  drawCentered(page,store,fonts.bold,12,347,color(p.darkGreen),width/2,254);

  drawYearsBadge(page,111,261,years,fonts);
  page.drawText('Dejar huella',{x:188,y:282,size:22,font:fonts.script,color:color(p.mint)});
  page.drawText('también es inspirar.',{x:188,y:252,size:22,font:fonts.script,color:color(p.mint)});
  page.drawLine({start:{x:190,y:243},end:{x:343,y:238},thickness:2.6,color:color(p.gold)});
  page.drawLine({start:{x:343,y:238},end:{x:455,y:243},thickness:2.6,color:color(p.gold)});
  drawSpark(page,525,270,12,color(p.gold),2.1);
  drawSpark(page,527,225,6,color(p.mint),1.7);

  drawRoundedRect(page,45,82,522,130,18,color(p.deepGreen));
  page.drawRectangle({x:45,y:82,width:6,height:130,color:color(p.gold)});
  drawTextBlock(page,ANNIVERSARY_MESSAGE,fonts.regular,10.6,69,185,468,15.1,color(p.white),8);
  drawHashtags(page,width/2,49,fonts,color(p.white),color(p.gold));
}

function fileNameFor(person, kind){
  const name = safeText(person.NOMBRE || person.nombre || 'Partner')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
  return `${kind === 'anniversary' ? 'Aniversario' : 'Cumpleanos'}_${name || 'Partner'}.pdf`;
}

export async function buildCelebrationPdf(person){
  const kind = safeText(person.Tipo).toLowerCase().startsWith('anivers') ? 'anniversary' : 'birthday';
  const name = safeText(person.NOMBRE || person.nombre || '[NOMBRE COMPLETO]');
  const store = safeText(person.TIENDA || person.tienda || '[NOMBRE DE LA TIENDA]');
  const occurrence = person.occurrence || person.FechaEvento || new Date();
  const years = kind === 'anniversary' ? anniversaryYears(person.Fecha, occurrence) : null;
  const document = await PDFDocument.create();
  document.setTitle(`${kind === 'anniversary' ? 'Aniversario' : 'Cumpleaños'} · ${name}`);
  document.setAuthor('Distrito Kike · JUNTÉMONOS MÁS');
  document.setSubject('Reconocimiento Partner');
  document.setKeywords(['Green Apron Service','Orgullo CN','Distrito Kike']);

  const page = document.addPage(PAGE_SIZE);
  const {width,height}=page.getSize();
  const fonts={
    regular:await document.embedFont(StandardFonts.Helvetica),
    bold:await document.embedFont(StandardFonts.HelveticaBold),
    script:await document.embedFont(StandardFonts.TimesRomanBoldItalic),
  };
  if(kind === 'anniversary') drawAnniversary(page,width,height,name,store,years,fonts);
  else drawBirthday(page,width,height,name,store,fonts);
  return document.save();
}

export async function generateCelebrationPdf(person){
  const bytes=await buildCelebrationPdf(person);
  const kind=safeText(person.Tipo).toLowerCase().startsWith('anivers')?'anniversary':'birthday';
  const blob=new Blob([bytes],{type:'application/pdf'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download=fileNameFor(person,kind);
  link.hidden=true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
