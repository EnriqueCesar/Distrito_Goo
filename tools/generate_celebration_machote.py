#!/usr/bin/env python3
"""Genera machotes cuadrados de cumpleaños y aniversario para Distrito Kike."""

from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


PAGE_SIZE = (612, 612)
GREEN = "#006241"
WARM_GREEN = "#00754A"
DARK_GREEN = "#003B2A"
DEEP_GREEN = "#004C35"
MINT = "#D4E9E2"
CREAM = "#FFF8EE"
INK = "#162F27"
GOLD = "#F2C14E"
ORANGE = "#F26B38"
PINK = "#E98BCB"
BLUE = "#72AFE5"
WHITE = "#FFFFFF"
HASHTAGS = ("#DistritoKike", "#OrgulloCN", "#GreenApronService")
BIRTHDAY_MESSAGE = (
    "Hoy celebramos la alegría de compartir este camino contigo. Gracias por poner el corazón "
    "en cada momento y por hacer especial la experiencia de quienes te rodean. Que este nuevo año "
    "esté lleno de grandes aprendizajes, nuevas oportunidades y muchos motivos para sonreír. "
    "¡Feliz cumpleaños!"
)
ANNIVERSARY_MESSAGE = (
    "Hoy celebramos tu historia y el camino que has construido con nosotros. Gracias por compartir "
    "tu talento, compromiso y corazón en cada experiencia. Tu dedicación deja huella e inspira a "
    "quienes tienen la oportunidad de caminar a tu lado. Que sigamos creando grandes momentos y "
    "celebrando muchos años más juntos. ¡Feliz aniversario!"
)


def fit_size(text: str, font: str, preferred: float, minimum: float, max_width: float) -> float:
    size = preferred
    while size > minimum and stringWidth(text, font, size) > max_width:
        size -= 0.5
    return size


def centered(
    pdf: canvas.Canvas,
    text: str,
    center_x: float,
    y: float,
    font: str,
    size: float,
    color: str,
    max_width: float | None = None,
) -> float:
    actual = fit_size(text, font, size, max(10, size * 0.5), max_width) if max_width else size
    pdf.setFont(font, actual)
    pdf.setFillColor(HexColor(color))
    pdf.drawCentredString(center_x, y, text)
    return actual


def wrap_lines(text: str, font: str, size: float, max_width: float) -> list[str]:
    lines: list[str] = []
    line = ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if not line or stringWidth(candidate, font, size) <= max_width:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def balanced_name_lines(text: str, font: str, size: float, max_width: float) -> list[str]:
    if stringWidth(text, font, size) <= max_width:
        return [text]
    words = text.split()
    choices: list[tuple[float, list[str]]] = []
    for index in range(1, len(words)):
        first = " ".join(words[:index])
        second = " ".join(words[index:])
        widest = max(stringWidth(first, font, size), stringWidth(second, font, size))
        if widest <= max_width:
            choices.append((widest, [first, second]))
    return min(choices, default=(float("inf"), [text]), key=lambda item: item[0])[1]


def draw_centered_name(
    pdf: canvas.Canvas,
    text: str,
    center_x: float,
    center_y: float,
    max_width: float,
    preferred: float,
    minimum: float,
    color: str,
) -> None:
    size = preferred
    lines = balanced_name_lines(text, "Helvetica-Bold", size, max_width)
    if len(lines) == 2:
        size = max(minimum, preferred * 0.88)
        lines = balanced_name_lines(text, "Helvetica-Bold", size, max_width)
    while size > minimum and any(stringWidth(line, "Helvetica-Bold", size) > max_width for line in lines):
        size -= 0.5
        lines = balanced_name_lines(text, "Helvetica-Bold", size, max_width)
    pdf.setFillColor(HexColor(color))
    if len(lines) == 1:
        centered(pdf, lines[0], center_x, center_y - size * 0.34, "Helvetica-Bold", size, color, max_width)
        return
    gap = size * 1.04
    centered(pdf, lines[0], center_x, center_y + gap * 0.16, "Helvetica-Bold", size, color, max_width)
    centered(pdf, lines[1], center_x, center_y - gap * 0.84, "Helvetica-Bold", size, color, max_width)


def draw_text_block(
    pdf: canvas.Canvas,
    text: str,
    x: float,
    top_y: float,
    max_width: float,
    font: str,
    size: float,
    line_height: float,
    color: str,
    max_lines: int = 8,
) -> None:
    pdf.setFont(font, size)
    pdf.setFillColor(HexColor(color))
    for index, line in enumerate(wrap_lines(text, font, size, max_width)[:max_lines]):
        pdf.drawString(x, top_y - index * line_height, line)


def draw_juntemonos(pdf: canvas.Canvas, x: float, y: float, reverse: bool = False, scale: float = 1) -> None:
    primary = WHITE if reverse else GREEN
    accent = CREAM if reverse else "#111111"
    primary_size = 24 * scale
    accent_size = 22 * scale
    pdf.setFillColor(HexColor(primary))
    pdf.setFont("Helvetica-Bold", primary_size)
    pdf.drawString(x, y, "JUNTÉMONOS")
    offset = stringWidth("JUNTÉMONOS", "Helvetica-Bold", primary_size) + 7 * scale
    pdf.setFillColor(HexColor(accent))
    pdf.setFont("Times-BoldItalic", accent_size)
    pdf.drawString(x + offset, y - scale, "más")
    start = x + offset + 2 * scale
    end = start + stringWidth("más", "Times-BoldItalic", accent_size)
    pdf.setStrokeColor(HexColor(primary))
    pdf.setLineWidth(2.2 * scale)
    pdf.setLineCap(1)
    path = pdf.beginPath()
    path.moveTo(start, y - 5 * scale)
    path.curveTo(start + 16 * scale, y - 8 * scale, end - 16 * scale, y - 2 * scale, end, y - 4 * scale)
    pdf.drawPath(path, stroke=1, fill=0)


def draw_spark(pdf: canvas.Canvas, x: float, y: float, radius: float, color: str, width: float = 2) -> None:
    pdf.setStrokeColor(HexColor(color))
    pdf.setLineWidth(width)
    pdf.setLineCap(1)
    pdf.line(x - radius, y, x + radius, y)
    pdf.line(x, y - radius, x, y + radius)
    pdf.line(x - radius * 0.68, y - radius * 0.68, x + radius * 0.68, y + radius * 0.68)
    pdf.line(x - radius * 0.68, y + radius * 0.68, x + radius * 0.68, y - radius * 0.68)


def draw_coffee_bean(pdf: canvas.Canvas, x: float, y: float, width: float, height: float, color: str) -> None:
    pdf.saveState()
    pdf.translate(x, y)
    pdf.rotate(-24)
    pdf.setFillColor(HexColor(color))
    pdf.ellipse(-width / 2, -height / 2, width / 2, height / 2, fill=1, stroke=0)
    path = pdf.beginPath()
    path.moveTo(-width * 0.12, -height * 0.34)
    path.curveTo(width * 0.2, -height * 0.1, -width * 0.2, height * 0.1, width * 0.12, height * 0.34)
    pdf.setStrokeColor(HexColor(CREAM))
    pdf.setLineWidth(max(1.2, width * 0.06))
    pdf.drawPath(path, stroke=1, fill=0)
    pdf.restoreState()


def draw_smile(pdf: canvas.Canvas, x: float, y: float, size: float, color: str) -> None:
    pdf.setStrokeColor(HexColor(color))
    pdf.setLineWidth(2.2)
    pdf.circle(x, y, size, fill=0, stroke=1)
    pdf.setFillColor(HexColor(color))
    pdf.circle(x - size * 0.36, y + size * 0.2, 1.5, fill=1, stroke=0)
    pdf.circle(x + size * 0.36, y + size * 0.2, 1.5, fill=1, stroke=0)
    path = pdf.beginPath()
    path.moveTo(x - size * 0.48, y - size * 0.12)
    path.curveTo(x - size * 0.2, y - size * 0.52, x + size * 0.2, y - size * 0.52, x + size * 0.48, y - size * 0.12)
    pdf.drawPath(path, stroke=1, fill=0)


def draw_cake_cup(pdf: canvas.Canvas, x: float, y: float) -> None:
    pdf.setFillColor(HexColor(WHITE))
    pdf.roundRect(x, y, 74, 58, 13, fill=1, stroke=0)
    pdf.setStrokeColor(HexColor(GREEN))
    pdf.setLineWidth(5)
    pdf.circle(x + 75, y + 29, 16, fill=0, stroke=1)
    pdf.setFillColor(HexColor(PINK))
    pdf.roundRect(x + 8, y + 44, 58, 10, 5, fill=1, stroke=0)
    for offset, candle_color in ((18, ORANGE), (36, BLUE), (54, GOLD)):
        pdf.setFillColor(HexColor(candle_color))
        pdf.roundRect(x + offset, y + 54, 5, 18, 2.5, fill=1, stroke=0)
        pdf.setFillColor(HexColor(candle_color))
        pdf.circle(x + offset + 2.5, y + 77, 3.2, fill=1, stroke=0)
    draw_coffee_bean(pdf, x + 37, y + 25, 14, 22, GREEN)


def draw_hashtags(pdf: canvas.Canvas, center_x: float, y: float, color: str, dot: str) -> None:
    size = 10.0
    widths = [stringWidth(tag, "Helvetica-Bold", size) for tag in HASHTAGS]
    total = sum(widths) + 30
    while total > 520 and size > 8:
        size -= 0.5
        widths = [stringWidth(tag, "Helvetica-Bold", size) for tag in HASHTAGS]
        total = sum(widths) + 30
    x = center_x - total / 2
    pdf.setFont("Helvetica-Bold", size)
    pdf.setFillColor(HexColor(color))
    for index, tag in enumerate(HASHTAGS):
        pdf.drawString(x, y, tag)
        x += widths[index]
        if index < len(HASHTAGS) - 1:
            pdf.setFillColor(HexColor(dot))
            pdf.circle(x + 7.5, y + 3.2, 2, fill=1, stroke=0)
            x += 15
            pdf.setFillColor(HexColor(color))


def draw_birthday(pdf: canvas.Canvas, width: float, height: float, name: str, store: str) -> None:
    pdf.setFillColor(HexColor(GREEN))
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(HexColor(CREAM))
    pdf.roundRect(22, 22, width - 44, height - 44, 27, fill=1, stroke=0)
    pdf.setFillColor(HexColor(MINT), alpha=0.48)
    pdf.circle(42, height - 42, 67, fill=1, stroke=0)
    pdf.setFillColor(HexColor(PINK), alpha=0.20)
    pdf.circle(width - 30, 31, 82, fill=1, stroke=0)
    pdf.setFillAlpha(1)

    draw_juntemonos(pdf, 48, height - 56, reverse=False, scale=0.78)
    pdf.setFont("Helvetica-Bold", 8.2)
    pdf.setFillColor(HexColor(GREEN))
    pdf.drawString(353, height - 49, "CELEBRACIÓN PARTNER · DISTRITO KIKE")
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(49, height - 105, "HOY CELEBRAMOS")
    pdf.setFont("Times-BoldItalic", 31)
    pdf.setFillColor(HexColor(INK))
    pdf.drawString(48, height - 149, "¡TU CUMPLEAÑOS!")
    pdf.setStrokeColor(HexColor(GREEN))
    pdf.setLineWidth(3)
    pdf.setLineCap(1)
    path = pdf.beginPath()
    path.moveTo(50, height - 158)
    path.curveTo(135, height - 168, 250, height - 150, 340, height - 157)
    pdf.drawPath(path, stroke=1, fill=0)
    draw_cake_cup(pdf, 476, height - 151)
    draw_spark(pdf, 445, height - 91, 8, ORANGE, 2)
    draw_spark(pdf, 568, height - 168, 7, BLUE, 2)

    pdf.setFillColor(HexColor(GREEN))
    pdf.roundRect(46, 304, 520, 136, 22, fill=1, stroke=0)
    pdf.setFillColor(HexColor(WHITE), alpha=0.10)
    pdf.circle(68, 421, 38, fill=1, stroke=0)
    pdf.setFillAlpha(1)
    draw_centered_name(pdf, name, width / 2, 390, 472, 37, 24, WHITE)
    pdf.setFillColor(HexColor(MINT))
    pdf.roundRect(164, 313, 284, 24, 12, fill=1, stroke=0)
    centered(pdf, store, width / 2, 320, "Helvetica-Bold", 12, DARK_GREEN, 252)

    pdf.setFillColor(HexColor(WHITE))
    pdf.roundRect(46, 108, 520, 174, 20, fill=1, stroke=0)
    pdf.setFillColor(HexColor(ORANGE))
    pdf.rect(46, 108, 7, 174, fill=1, stroke=0)
    draw_text_block(pdf, BIRTHDAY_MESSAGE, 74, 249, 462, "Helvetica", 12.25, 18.4, INK, 8)
    draw_smile(pdf, 532, 133, 17, GREEN)
    for x, y, radius, accent in ((52, 83, 7, ORANGE), (96, 75, 5, PINK), (520, 84, 6, BLUE), (558, 93, 8, GOLD)):
        draw_spark(pdf, x, y, radius, accent, 1.8)
    draw_hashtags(pdf, width / 2, 55, GREEN, ORANGE)


def draw_years_badge(pdf: canvas.Canvas, center_x: float, center_y: float, years: int | None) -> None:
    pdf.setFillColor(HexColor(DEEP_GREEN))
    pdf.setStrokeColor(HexColor(GOLD))
    pdf.setLineWidth(3)
    pdf.circle(center_x, center_y, 56, fill=1, stroke=1)
    pdf.setStrokeColor(HexColor(MINT), alpha=0.55)
    pdf.setLineWidth(1.2)
    pdf.circle(center_x, center_y, 46, fill=0, stroke=1)
    if years is None:
        centered(pdf, "[NÚMERO]", center_x, center_y + 8, "Helvetica-Bold", 13, GOLD, 84)
        centered(pdf, "DE AÑOS", center_x, center_y - 11, "Helvetica-Bold", 9.5, WHITE, 78)
    else:
        centered(pdf, str(years), center_x, center_y + 1, "Helvetica-Bold", 36, GOLD, 72)
        centered(pdf, "AÑO JUNTOS" if years == 1 else "AÑOS JUNTOS", center_x, center_y - 25, "Helvetica-Bold", 9.5, WHITE, 88)


def draw_anniversary(pdf: canvas.Canvas, width: float, height: float, name: str, store: str, years: int | None) -> None:
    pdf.setFillColor(HexColor(DARK_GREEN))
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    for index, radius in enumerate((96, 145, 196)):
        pdf.setStrokeColor(HexColor(GOLD if index % 2 else MINT), alpha=0.14 if index % 2 else 0.10)
        pdf.setLineWidth(1.7)
        pdf.circle(width - 10, height + 8, radius, fill=0, stroke=1)
    pdf.setStrokeColor(HexColor(MINT), alpha=0.28)
    pdf.setLineWidth(1.1)
    pdf.rect(24, 24, width - 48, height - 48, fill=0, stroke=1)
    pdf.setStrokeAlpha(1)
    draw_coffee_bean(pdf, 49, 515, 26, 42, GOLD)
    draw_coffee_bean(pdf, 568, 72, 22, 35, MINT)

    draw_juntemonos(pdf, 48, height - 56, reverse=True, scale=0.78)
    pdf.setFillColor(HexColor(MINT))
    pdf.setFont("Helvetica-Bold", 8.2)
    pdf.drawString(337, height - 49, "RECONOCIMIENTO PARTNER · DISTRITO KIKE")
    pdf.setFillColor(HexColor(GOLD))
    pdf.setFont("Helvetica-Bold", 12.5)
    pdf.drawString(48, height - 105, "CELEBRAMOS TU HISTORIA")
    pdf.setFillColor(HexColor(WHITE))
    pdf.setFont("Helvetica-Bold", 30)
    pdf.drawString(47, height - 149, "¡FELIZ ANIVERSARIO!")

    pdf.setFillColor(HexColor(CREAM))
    pdf.roundRect(45, 333, 522, 110, 20, fill=1, stroke=0)
    draw_centered_name(pdf, name, width / 2, 400, 474, 36, 23, DARK_GREEN)
    pdf.setFillColor(HexColor(GOLD))
    pdf.roundRect(163, 340, 286, 25, 12.5, fill=1, stroke=0)
    centered(pdf, store, width / 2, 347, "Helvetica-Bold", 12, DARK_GREEN, 254)

    draw_years_badge(pdf, 111, 261, years)
    pdf.setFont("Times-BoldItalic", 22)
    pdf.setFillColor(HexColor(MINT))
    pdf.drawString(188, 282, "Dejar huella")
    pdf.drawString(188, 252, "también es inspirar.")
    pdf.setStrokeColor(HexColor(GOLD))
    pdf.setLineWidth(2.6)
    path = pdf.beginPath()
    path.moveTo(190, 243)
    path.curveTo(265, 235, 380, 249, 455, 243)
    pdf.drawPath(path, stroke=1, fill=0)
    draw_spark(pdf, 525, 270, 12, GOLD, 2.1)
    draw_spark(pdf, 527, 225, 6, MINT, 1.7)

    pdf.setFillColor(HexColor(DEEP_GREEN))
    pdf.roundRect(45, 82, 522, 130, 18, fill=1, stroke=0)
    pdf.setFillColor(HexColor(GOLD))
    pdf.rect(45, 82, 6, 130, fill=1, stroke=0)
    draw_text_block(pdf, ANNIVERSARY_MESSAGE, 69, 185, 468, "Helvetica", 10.6, 15.1, WHITE, 8)
    draw_hashtags(pdf, width / 2, 49, WHITE, GOLD)


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def resolved_years(args: argparse.Namespace) -> int | None:
    if args.years is not None:
        return args.years if args.years >= 1 else None
    source = parse_date(args.source_date)
    event = parse_date(args.date)
    if not source or not event:
        return None
    years = event.year - source.year
    return years if years >= 1 else None


def generate(args: argparse.Namespace) -> Path:
    output = Path(args.output).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    width, height = PAGE_SIZE
    pdf = canvas.Canvas(str(output), pagesize=PAGE_SIZE, pageCompression=1)
    kind_label = "Aniversario" if args.type == "anniversary" else "Cumpleaños"
    pdf.setTitle(f"{kind_label} · {args.name}")
    pdf.setAuthor("Distrito Kike · JUNTÉMONOS MÁS")
    pdf.setSubject("Reconocimiento Partner")
    pdf.setKeywords("Green Apron Service, Orgullo CN, Distrito Kike")
    if args.type == "anniversary":
        draw_anniversary(pdf, width, height, args.name, args.store, resolved_years(args))
    else:
        draw_birthday(pdf, width, height, args.name, args.store)
    pdf.showPage()
    pdf.save()
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--type", choices=("birthday", "anniversary"), required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--store", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--years", type=int, default=None)
    parser.add_argument("--date", default=None, help="Fecha de celebración AAAA-MM-DD")
    parser.add_argument("--source-date", default=None, help="Fecha de ingreso AAAA-MM-DD")
    parser.add_argument("--role", default=None, help=argparse.SUPPRESS)
    args = parser.parse_args()
    print(f"PDF generado: {generate(args)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
