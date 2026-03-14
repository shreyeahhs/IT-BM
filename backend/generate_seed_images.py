"""Generate deterministic seed cover PNG images.

This script creates 10 colorful PNG book covers used by the seed command.
Run from backend/: python generate_seed_images.py
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

WIDTH = 360
HEIGHT = 540
TOTAL_COVERS = 10

# Background gradient pairs (top -> bottom)
GRADIENTS: list[tuple[tuple[int, int, int], tuple[int, int, int]]] = [
    ((20, 66, 115), (72, 120, 183)),
    ((139, 39, 77), (220, 99, 122)),
    ((17, 94, 89), (72, 156, 132)),
    ((92, 54, 129), (161, 95, 194)),
    ((108, 74, 35), (201, 146, 85)),
    ((25, 95, 147), (63, 167, 214)),
    ((65, 55, 113), (122, 112, 194)),
    ((117, 37, 80), (187, 95, 136)),
    ((44, 96, 67), (118, 180, 127)),
    ((80, 51, 40), (173, 104, 83)),
]

ACCENT_COLORS: list[tuple[int, int, int]] = [
    (244, 211, 94),
    (189, 239, 201),
    (251, 227, 186),
    (219, 200, 252),
    (248, 198, 171),
    (198, 235, 250),
    (250, 212, 228),
    (217, 242, 224),
    (255, 236, 179),
    (218, 226, 255),
]


def _chunk(chunk_type: bytes, data: bytes) -> bytes:
    """Build one PNG chunk with CRC."""
    crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)


def _to_png_bytes(rgb_rows: list[bytes], width: int, height: int) -> bytes:
    """Encode raw RGB rows into a valid PNG (no external libraries)."""
    signature = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)

    # Each row starts with filter type 0 (None)
    raw = bytearray()
    for row in rgb_rows:
        raw.append(0)
        raw.extend(row)

    compressed = zlib.compress(bytes(raw), level=9)
    return signature + _chunk(b"IHDR", ihdr) + _chunk(b"IDAT", compressed) + _chunk(b"IEND", b"")


def _lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def _build_cover(index: int, width: int, height: int) -> bytes:
    """Create one cover image with gradient + simple geometric accents."""
    top, bottom = GRADIENTS[index]
    accent = ACCENT_COLORS[index]

    rows: list[bytes] = []
    for y in range(height):
        t = y / max(1, height - 1)
        r = _lerp(top[0], bottom[0], t)
        g = _lerp(top[1], bottom[1], t)
        b = _lerp(top[2], bottom[2], t)

        row = bytearray()
        for x in range(width):
            pr, pg, pb = r, g, b

            # Diagonal stripe pattern for texture.
            if ((x + y + (index * 21)) // 24) % 2 == 0:
                pr = min(255, pr + 8)
                pg = min(255, pg + 8)
                pb = min(255, pb + 8)

            # Accent bar near top.
            if 56 <= y <= 114 and 34 <= x <= width - 34:
                pr = _lerp(pr, accent[0], 0.72)
                pg = _lerp(pg, accent[1], 0.72)
                pb = _lerp(pb, accent[2], 0.72)

            # Central title block placeholder.
            if 185 <= y <= 355 and 34 <= x <= width - 34:
                pr = _lerp(pr, 248, 0.88)
                pg = _lerp(pg, 248, 0.88)
                pb = _lerp(pb, 248, 0.88)

                # Subtle horizontal bands inside placeholder.
                if (y - 185) % 20 < 3:
                    pr = _lerp(pr, accent[0], 0.18)
                    pg = _lerp(pg, accent[1], 0.18)
                    pb = _lerp(pb, accent[2], 0.18)

            # Bottom badge shape.
            bx1 = width // 2 - 80
            bx2 = width // 2 + 80
            if 410 <= y <= 472 and bx1 <= x <= bx2:
                pr = _lerp(pr, 20, 0.35)
                pg = _lerp(pg, 20, 0.35)
                pb = _lerp(pb, 20, 0.35)

            row.extend((pr, pg, pb))

        rows.append(bytes(row))

    return _to_png_bytes(rows, width, height)


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    output_dir = base_dir / "seed_data" / "covers"
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Generating {TOTAL_COVERS} images in: {output_dir}")
    for i in range(TOTAL_COVERS):
        output_file = output_dir / f"cover_{i + 1:02d}.png"
        png_bytes = _build_cover(i, WIDTH, HEIGHT)
        output_file.write_bytes(png_bytes)
        print(f"  wrote {output_file.name}")

    print("Done.")


if __name__ == "__main__":
    main()
