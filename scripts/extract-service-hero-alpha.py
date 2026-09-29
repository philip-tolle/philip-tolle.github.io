"""Remove the baked neutral checkerboard from the generated service cutouts.

Local image processing explicitly requested by the user on 2026-09-12.
Retain the generated subjects; write new RGBA assets, never alter originals.
"""
from collections import deque
from pathlib import Path
import json

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
GENERATED = Path.home() / '.codex/generated_images/01a0948b-fff2-7e30-836d-b1c45ecbcc03'
OUTPUT = ROOT / 'src/assets/services/heroes'
SOURCES = {
    'management': 'exec-44847ed5-49fb-4f59-bce8-43a89d368961.png',
    'academy': 'exec-9ea341d9-17db-4442-9474-a25e7172bed7.png',
    'operation': 'exec-39616c1f-43de-4c46-b08b-85675ddd9315.png',
}


def extract(name, source):
    rgb = np.array(Image.open(source).convert('RGB'))
    values = rgb.astype(np.int16)
    chroma = values.max(axis=2) - values.min(axis=2)
    light = values.mean(axis=2)
    candidates = (chroma <= 12) & (light >= 85) & (light <= 225)
    height, width = candidates.shape
    # The grey tablet on the Academy table shares the checkerboard's tones.
    # Preserve its original pixels explicitly; this is artwork, not a gap.
    if name == 'academy':
        protected = Image.new('L', (width, height))
        ImageDraw.Draw(protected).polygon(
            [(697, 788), (795, 767), (933, 775), (935, 790), (839, 811), (696, 801)],
            fill=255,
        )
        candidates &= np.array(protected) == 0
    available = candidates.ravel().copy()
    light_flat = light.ravel()
    background = np.zeros(available.shape, dtype=bool)

    # Only remove connected neutral regions that reach the canvas edge or
    # contain both shades of the checkerboard. Interior artwork stays opaque.
    for start in np.flatnonzero(available):
        if not available[start]:
            continue
        queue = deque([int(start)])
        available[start] = False
        region = []
        touches_edge = False
        low, high = 255., 0.
        while queue:
            index = queue.pop()
            region.append(index)
            y, x = divmod(index, width)
            touches_edge |= x == 0 or y == 0 or x == width - 1 or y == height - 1
            level = light_flat[index]
            low, high = min(low, level), max(high, level)
            neighbors = []
            if x: neighbors.append(index - 1)
            if x + 1 < width: neighbors.append(index + 1)
            if y: neighbors.append(index - width)
            if y + 1 < height: neighbors.append(index + width)
            for neighbor in neighbors:
                if available[neighbor]:
                    available[neighbor] = False
                    queue.append(neighbor)
        if touches_edge or (len(region) >= 400 and low < 155 and high > 175):
            background[region] = True

    # Discard tiny isolated checkerboard artefacts, not interior artwork.
    available = ~background
    for start in np.flatnonzero(available):
        if not available[start]:
            continue
        queue = deque([int(start)])
        available[start] = False
        region = []
        while queue:
            index = queue.pop()
            region.append(index)
            y, x = divmod(index, width)
            for neighbor in (index - 1 if x else -1,
                             index + 1 if x + 1 < width else -1,
                             index - width if y else -1,
                             index + width if y + 1 < height else -1):
                if neighbor >= 0 and available[neighbor]:
                    available[neighbor] = False
                    queue.append(neighbor)
        if len(region) < 200:
            background[region] = True

    mask = Image.fromarray((background.reshape(height, width) * 255).astype('uint8'))
    # Remove the one-pixel checkerboard fringe and soften the silhouette.
    matte = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.35))
    alpha = 255 - np.array(matte)
    alpha[alpha < 8] = 0
    alpha[alpha > 247] = 255
    rgba = np.dstack([rgb, alpha]).astype('uint8')
    rgba[alpha == 0, :3] = 0
    result = Image.fromarray(rgba)
    destination = OUTPUT / f'{name}-titel.png'
    result.save(destination, optimize=True)
    return {
        'asset': destination.name,
        'size': result.size,
        'transparent_percent': round(float((alpha == 0).mean() * 100), 1),
        'partial_alpha_pixels': int(((alpha > 0) & (alpha < 255)).sum()),
        'bytes': destination.stat().st_size,
    }


if __name__ == '__main__':
    OUTPUT.mkdir(parents=True, exist_ok=True)
    print(json.dumps([extract(name, GENERATED / filename) for name, filename in SOURCES.items()], indent=2))
