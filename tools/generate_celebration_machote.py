#!/usr/bin/env python3
"""Genera machotes PDF de cumpleaños o aniversario para revisión visual."""

from __future__ import annotations

import argparse
import re
from datetime import date, datetime
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


THEMES = {
    "birthday": {
        "background": "#FFF7EF",
        "accent": "#D85C4A",
        "secondary": "#F3B43F",
        "soft": "#FCE6DC",
        "ink": "#19352C",
        "eyebrow": "HOY CELEBRAMOS CONTIGO",
        "title": "¡FELIZ CUMPLEAÑOS!",
        "subtitle": "QUE SEA UN DÍA TAN ESPECIAL COMO TÚ",
        "message": (
            "Que este nuevo año de vida llegue con momentos memorables, aprendizajes "
            "y muchas razones para sonreír. Gracias por compartir tu energía con nuestro distrito."
        ),
    },
    "anniversary": {
        "background": "#F2F7F3",
        "accent": "#006241",
        "secondary": "#B8862B",
        "soft": "#DDEDE5",
        "ink": "#17372D",
        "eyebrow": "UN GRAN RECONOCIMIENTO",
        "title": "CELEBRAMOS TU ANIVERSARIO",
        "message": (
            "Gracias por construir experiencias, acompañar al equipo y dejar tu huella cada día. "
            "Tu compromiso hace más fuerte a nuestro distrito."
        ),
    },
}


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def fit_size(text: str, font: str, preferred: float, minimum: float, max_width: float) -> float:
    size = preferred
    while size > minimum and stringWidth(text, font, size) > max_width:
        size -= 0.5
    return size


def draw_centered(pdf: canvas.Canvas, text: str, x: float, y: float, font: str, size: float, color: str) -> None:
    pdf.setFont(font, size)
    pdf.setFillColor(HexColor(color))
    pdf.drawCentredString(x, y, text)


def wrap_text(text: str, font: str, size: float, max_width: float) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        if not current or stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_rocket(pdf: canvas.Canvas, x: float, y: float) -> None:
    pdf.saveState()
    pdf.translate(x, y)
    pdf.rotate(42)
    pdf.setFillColor(HexColor("#006241"))
    pdf.ellipse(0, 0, 19, 39, fill=1, stroke=0)
    pdf.setFillColor(HexColor("#D4E9E2"))
    pdf.circle(9.5, 25, 4.2, fill=1, stroke=0)
    pdf.setFillColor(HexColor("#D85C4A"))
    pdf.rect(-5, 5, 11, 6, fill=1, stroke=0)
    pdf.setFillColor(HexColor("#F3B43F"))
    pdf.rect(-8, 6.5, 7, 3.5, fill=1, stroke=0)
    pdf.restoreState()


def draw_birthday_mark(pdf: canvas.Canvas, x: float, y: float, theme: dict[str, str]) -> None:
    pdf.setFillColor(HexColor(theme["soft"]))
    pdf.setStrokeColor(HexColor(theme["accent"]))
    pdf.setLineWidth(2)
    pdf.roundRect(x, y, 88, 54, 8, fill=1, stroke=1)
    pdf.setFillColor(HexColor(theme["accent"]))
    pdf.rect(x + 8, y + 22, 72, 9, fill=1, stroke=0)
    for offset in (21, 41, 61):
        pdf.setFillColor(HexColor(theme["secondary"]))
        pdf.rect(x + offset, y + 54, 6, 17, fill=1, stroke=0)
        pdf.setFillColor(HexColor(theme["accent"]))
        pdf.circle(x + offset + 3, y + 75, 3.3, fill=1, stroke=0)


def draw_anniversary_mark(
    pdf: canvas.Canvas, x: float, y: float, theme: dict[str, str], years: int
) -> None:
    pdf.setFillColor(HexColor(theme["soft"]))
    pdf.setStrokeColor(HexColor(theme["secondary"]))
    pdf.setLineWidth(2)
    pdf.circle(x + 44, y + 44, 39, fill=1, stroke=1)
    pdf.setFillColor(HexColor(theme["soft"]))
    pdf.setStrokeColor(HexColor(theme["accent"]))
    pdf.circle(x + 44, y + 44, 28, fill=1, stroke=1)
    draw_centered(pdf, str(years), x + 44, y + 33, "Helvetica-Bold", 30, theme["accent"])
    pdf.setStrokeColor(HexColor(theme["secondary"]))
    pdf.setLineWidth(8)
    pdf.line(x + 19, y + 10, x + 10, y - 8)
    pdf.line(x + 69, y + 10, x + 78, y - 8)


def draw_confetti(pdf: canvas.Canvas, theme: dict[str, str]) -> None:
    colors = (theme["accent"], theme["secondary"], "#006241")
    points = ((34, 510), (66, 548), (111, 520), (750, 82), (792, 119), (731, 505), (788, 476), (45, 102), (104, 70))
    for index, (x, y) in enumerate(points):
        pdf.setFillColor(HexColor(colors[index % len(colors)]), alpha=0.72)
        if index % 2:
            pdf.circle(x, y, 4 + index % 3, fill=1, stroke=0)
        else:
            pdf.saveState()
            pdf.translate(x, y)
            pdf.rotate(index * 13 + 18)
            pdf.rect(0, 0, 5, 18, fill=1, stroke=0)
            pdf.restoreState()


def generate(args: argparse.Namespace) -> Path:
    output = Path(args.output).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    theme = THEMES[args.type]
    event_date = parse_date(args.date)
    years = max(1, event_date.year - parse_date(args.source_date).year) if args.type == "anniversary" else 0
    width, height = landscape(A4)
    pdf = canvas.Canvas(str(output), pagesize=(width, height), pageCompression=1)
    pdf.setTitle(f"{theme['title']} · {args.name}")
    pdf.setAuthor("Distrito Kike · JUNTÉMONOS MÁS")
    pdf.setSubject("Reconocimiento para partners")

    pdf.setFillColor(HexColor(theme["background"]))
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(HexColor(theme["soft"]), alpha=0.9)
    pdf.circle(-30, height + 10, 150, fill=1, stroke=0)
    pdf.circle(width + 10, -15, 170, fill=1, stroke=0)
    draw_confetti(pdf, theme)

    pdf.setFont("Helvetica-Bold", 31)
    pdf.setFillColor(HexColor("#006241"))
    pdf.drawString(54, height - 62, "JUNTÉMONOS")
    pdf.setFont("Helvetica-Oblique", 25)
    pdf.setFillColor(HexColor("#111111"))
    pdf.drawString(286, height - 62, "MÁS")
    pdf.setFont("Helvetica-Bold", 13)
    pdf.setFillColor(HexColor("#006241"))
    pdf.drawString(width - 188, height - 57, "DISTRITO KIKE")
    draw_rocket(pdf, width - 57, height - 73)

    panel_x, panel_y, panel_w, panel_h = 54, 86, width - 108, 410
    pdf.setFillColor(HexColor("#C9D9D1"), alpha=0.42)
    pdf.roundRect(panel_x + 6, panel_y - 7, panel_w, panel_h, 18, fill=1, stroke=0)
    pdf.setFillColor(HexColor("#FFFFFF"))
    pdf.setStrokeColor(HexColor(theme["soft"]))
    pdf.setLineWidth(1.5)
    pdf.roundRect(panel_x, panel_y, panel_w, panel_h, 18, fill=1, stroke=1)
    pdf.setFillColor(HexColor(theme["accent"]))
    pdf.roundRect(panel_x, panel_y, 190, panel_h, 18, fill=1, stroke=0)
    pdf.rect(panel_x + 170, panel_y, 20, panel_h, fill=1, stroke=0)

    mark_x, mark_y = panel_x + 51, panel_y + 230
    if args.type == "birthday":
        draw_birthday_mark(pdf, mark_x, mark_y, theme)
    else:
        draw_anniversary_mark(pdf, mark_x, mark_y, theme, years)

    event_label = event_date.strftime("%d/%m/%Y")
    draw_centered(pdf, theme["eyebrow"], panel_x + 95, panel_y + 188, "Helvetica-Bold", 12, "#FFFFFF")
    draw_centered(pdf, event_label, panel_x + 95, panel_y + 156, "Helvetica", 11, "#FFFFFF")
    pdf.setStrokeColor(HexColor("#FFFFFF"), alpha=0.65)
    pdf.setLineWidth(1)
    pdf.line(panel_x + 35, panel_y + 137, panel_x + 155, panel_y + 137)
    draw_centered(pdf, "DISTRITO KIKE", panel_x + 95, panel_y + 107, "Helvetica-Bold", 12, "#FFFFFF")
    draw_centered(pdf, "JUNTÉMONOS MÁS", panel_x + 95, panel_y + 83, "Helvetica", 10, "#FFFFFF")

    content_x = panel_x + 226
    content_w = panel_w - 258
    pdf.setFont("Helvetica-Bold", 11)
    pdf.setFillColor(HexColor(theme["secondary"]))
    pdf.drawString(content_x, panel_y + 344, theme["eyebrow"])
    title_size = fit_size(theme["title"], "Helvetica-Bold", 29, 21, content_w)
    pdf.setFont("Helvetica-Bold", title_size)
    pdf.setFillColor(HexColor(theme["accent"]))
    pdf.drawString(content_x, panel_y + 303, theme["title"])

    subtitle = theme.get("subtitle") or ("1 AÑO HACIENDO EQUIPO" if years == 1 else f"{years} AÑOS HACIENDO EQUIPO")
    pdf.setFont("Helvetica-Bold", 12.5)
    pdf.setFillColor(HexColor(theme["ink"]))
    pdf.drawString(content_x, panel_y + 271, subtitle)
    name_size = fit_size(args.name, "Helvetica-Bold", 28, 17, content_w)
    pdf.setFont("Helvetica-Bold", name_size)
    pdf.drawString(content_x, panel_y + 218, args.name)
    pdf.setFont("Helvetica", 12)
    pdf.setFillColor(HexColor("#4D655C"))
    pdf.drawString(content_x, panel_y + 190, f"{args.store}  ·  {args.role}")
    pdf.setStrokeColor(HexColor(theme["soft"]))
    pdf.setLineWidth(1.2)
    pdf.line(content_x, panel_y + 170, content_x + content_w, panel_y + 170)

    pdf.setFont("Helvetica", 13)
    pdf.setFillColor(HexColor(theme["ink"]))
    for index, line in enumerate(wrap_text(theme["message"], "Helvetica", 13, content_w)[:4]):
        pdf.drawString(content_x, panel_y + 139 - index * 20, line)
    pdf.setFont("Helvetica-Oblique", 11)
    pdf.setFillColor(HexColor(theme["accent"]))
    pdf.drawString(content_x, panel_y + 44, "Gracias por ser parte de lo que construimos juntos.")
    pdf.setFont("Helvetica-Bold", 11)
    pdf.setFillColor(HexColor("#006241"))
    pdf.drawRightString(width - 54, 40, "#DistritoKike")
    pdf.save()
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--type", choices=sorted(THEMES), required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--store", required=True)
    parser.add_argument("--role", default="Partner")
    parser.add_argument("--date", required=True, help="Fecha de la celebración en AAAA-MM-DD")
    parser.add_argument("--source-date", default="2025-01-01", help="Fecha de ingreso para calcular antigüedad")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    output = generate(args)
    print(f"PDF generado: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
