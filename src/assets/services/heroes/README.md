# Titelmotive der Leistungsbereiche

Die originalen dunklen Motive liegen eine Ebene höher und bleiben auf der Startseite erhalten. Diese Ableitungen sind für die Titelbereiche von Management, Academy und Operation gedacht.

## Stand

Fertig integriert in die Titelbereiche von Management, Academy und Operation über `src/components/ServiceHero.astro`. Die Startseite verwendet weiterhin die unveränderten ursprünglichen Motive.

Die eingebaute Bildfunktion (Imagegen, kein CLI/API-Fallback) hat die Szenen isoliert gezeichnet, jedoch ein graues Schachbrett als RGB-Bildhintergrund ausgegeben. Nach ausdrücklicher Zustimmung des Nutzers („Ja, lokal freistellen“) wurden die Hintergründe lokal mit Pillow und NumPy entfernt. `scripts/extract-service-hero-alpha.py` dokumentiert die Alpha-Extraktion, die Bereinigung kleiner Hintergrundreste und den Schutz des grauen Academy-Tablets. Die generierten Zwischenstände bleiben unverändert erhalten.

Die folgenden fertigen PNG-Dateien haben echte RGBA-Transparenz, jeweils 1448 × 1086 Pixel. Astro liefert responsive WebP-Dateien mit erhaltenem Alphakanal in 480, 720, 1000 und 1400 Pixel Breite:

- [Management-Titelmotiv](management-titel.png)
- [Academy-Titelmotiv](academy-titel.png)
- [Operation-Titelmotiv](operation-titel.png)

Bildzuordnung: Abläufe und Zuständigkeiten → Management; Schulung und Team → Academy; Aufgabenübergabe und Backoffice → Operation. Desktop: Text links, Motiv rechts frei auf dem dunkelgrünen Wellenhintergrund. Mobil: Text und Motiv untereinander.

## Prompts und Zuordnung

### management

Quelle: `management-ablaeufe-dunkel.png`.
Generierter Zwischenstand: `exec-44847ed5-49fb-4f59-bce8-43a89d368961.png` unter dem Codex-Verzeichnis `generated_images/01a0948b-fff2-7e30-836d-b1c45ecbcc03/`.
Zieldatei: `management-titel.png`.

Use case: background-extraction. Asset type: transparent PNG hero illustration for a German hospitality services website. Edit target: the attached existing NextCourse illustration. Create ONE professional background-free cutout of this same illustration. Preserve the woman explaining the process board, her white blouse and dark apron, her face, hair, hands, stylus and tablet, and the entire warm-white process board with all of its hospitality workflow icons. Preserve their composition and relative positions. Remove the green room wall, wave lines, plants, pendant lamp, room shadows, the large foreground marble reception counter, laptop, bell, books and pen cup. The final isolated group consists of the woman and her process board. Give the woman's lower apron a clean natural contour at hip level rather than a hard rectangular canvas crop. Invariants: preserve the existing warm editorial illustration style, the recognizable people, their poses, original warm-white/dark-green/coral palette and all retained objects. Do not redesign the characters, do not switch to photography or 3D, do not add people, logos or text. Composition: single group centered in a landscape 4:3 canvas, fully visible with a small genuine transparent margin around all outer edges, no border, no frame. Background: REAL FULL ALPHA TRANSPARENCY, not white, not green, no checkerboard painted into pixels, no solid rectangular backdrop or gradient. Transparent gaps between separate objects and silhouettes too. Clean anti-aliased edges that will be composited on dark forest green #122A2F. Deliver the isolated illustration only.

### academy

Quelle: `academy-team-dunkel.png`.
Generierter Zwischenstand: `exec-9ea341d9-17db-4442-9474-a25e7172bed7.png` unter dem Codex-Verzeichnis `generated_images/01a0948b-fff2-7e30-836d-b1c45ecbcc03/`.
Zieldatei: `academy-titel.png`.

Use case: background-extraction. Asset type: transparent PNG hero illustration for a German hospitality services website. Edit target: the attached existing NextCourse illustration. Create ONE professional background-free cutout of this same illustration. Preserve the teacher, all three seated hospitality team members, their faces, hair, white shirts and dark workwear, tablets, gestures, the complete warm-white training board with its learning icons, and the tabletop and chairs needed to make the training group a coherent isolated scene. Remove the green room wall, wave lines, plants, pendant lamp, beverage cart and background room shadows. Isolate the group of people, board and a compact tabletop; remove the oversized vertical marble fascia across the bottom. Close the outer contours of chairs and clothing naturally so the group is a freestanding vignette without a hard rectangular crop. Invariants: preserve the existing warm editorial illustration style, the recognizable people, their poses, original warm-white/dark-green/coral palette and all retained objects. Do not redesign the characters, do not switch to photography or 3D, do not add people, logos or text. Composition: single group centered in a landscape 4:3 canvas, fully visible with a small genuine transparent margin around all outer edges, no border, no frame. Background: REAL FULL ALPHA TRANSPARENCY, not white, not green, no checkerboard painted into pixels, no solid rectangular backdrop or gradient. Transparent gaps between separate objects and silhouettes too. Clean anti-aliased edges that will be composited on dark forest green #122A2F. Deliver the isolated illustration only.

### operation

Quelle: `operation-entlastung-dunkel.png`.
Generierter Zwischenstand: `exec-39616c1f-43de-4c46-b08b-85675ddd9315.png` unter dem Codex-Verzeichnis `generated_images/01a0948b-fff2-7e30-836d-b1c45ecbcc03/`.
Zieldatei: `operation-titel.png`.

Use case: background-extraction. Asset type: transparent PNG hero illustration for a German hospitality services website. Edit target: the attached existing NextCourse illustration. Create ONE professional background-free cutout of this same illustration. Preserve both women handing over tasks, their faces, hair, clothing and hand gestures, the laptop, floating task cards and hand-drawn handover arrow, plus the file shelf on the right with its four completed task folders. Keep a compact desktop under the laptop as part of the isolated work scene. Remove the green room wall, wave lines, plants, pendant lamp, room shadows and the large foreground marble reception counter. Preserve only the two women, handover cards, laptop/compact desk and task shelf as a coherent freestanding vignette with clean complete contours; no full-width marble wall at the bottom. Invariants: preserve the existing warm editorial illustration style, the recognizable people, their poses, original warm-white/dark-green/coral palette and all retained objects. Do not redesign the characters, do not switch to photography or 3D, do not add people, logos or text. Composition: single group centered in a landscape 4:3 canvas, fully visible with a small genuine transparent margin around all outer edges, no border, no frame. Background: REAL FULL ALPHA TRANSPARENCY, not white, not green, no checkerboard painted into pixels, no solid rectangular backdrop or gradient. Transparent gaps between separate objects and silhouettes too. Clean anti-aliased edges that will be composited on dark forest green #122A2F. Deliver the isolated illustration only.
