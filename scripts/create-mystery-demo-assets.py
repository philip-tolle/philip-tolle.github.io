"""Create public demo assets and a local A5 booklet preview from the approved PDF.

Usage: python scripts/create-mystery-demo-assets.py --source PATH --output PATH
Only the fictional customer report is copied into public/. Booklet artwork stays local.
"""
from pathlib import Path
import argparse
import shutil
import sys
import json
import hashlib
from html import escape

from PIL import Image, ImageDraw
import pypdfium2 as pdfium
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfdoc import PDFString
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts/vendor'))
from qrcodegen import QrCode

parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
parser.add_argument('--fonts',type=Path,required=True)
args=parser.parse_args()
URL='https://www.next-course.de/mystery-check-demo/'
PUBLIC=ROOT/'public/demo/mystery-check'
PUBLIC.mkdir(parents=True,exist_ok=True)
args.output.mkdir(parents=True,exist_ok=True)
dest=PUBLIC/'nextcourse-mystery-check-demo.pdf'
shutil.copy2(args.source,dest)
document=pdfium.PdfDocument(str(dest))
assert len(document)==18
for i in range(len(document)):
    page=document[i]
    im=page.render(scale=2).to_pil().convert('RGB')
    im.save(PUBLIC/f'seite-{i+1:02}.webp','WEBP',quality=86,method=6)
    if i==0:
        im.thumbnail((620,880))
        im.save(PUBLIC/'cover.webp','WEBP',quality=88,method=6)

qr=QrCode.encode_text(URL,QrCode.Ecc.QUARTILE)
border=4
size=qr.get_size()+border*2
path=' '.join(f'M{x+border},{y+border}h1v1h-1z' for y in range(qr.get_size()) for x in range(qr.get_size()) if qr.get_module(x,y))
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="42mm" height="42mm" role="img" aria-label="QR-Code zur Mystery-Check-Demo von NextCourse" shape-rendering="crispEdges"><title>NextCourse Mystery Check - Demo-Auswertung</title><desc>{escape(URL)}</desc><rect width="{size}" height="{size}" fill="#fff"/><path d="{path}" fill="#122A2F"/></svg>'''
(args.output/'NextCourse-Mystery-Check-QR.svg').write_text(svg,encoding='utf-8')
px=24
qr_image=Image.new('RGB',(size*px,size*px),'white')
draw=ImageDraw.Draw(qr_image)
for y in range(qr.get_size()):
    for x in range(qr.get_size()):
        if qr.get_module(x,y):
            draw.rectangle(((x+border)*px,(y+border)*px,(x+border+1)*px-1,(y+border+1)*px-1),fill='#122A2F')
qr_image.save(args.output/'NextCourse-Mystery-Check-QR.png',dpi=(600,600))

# A5 layout. QR modules are vector rectangles with an intact four-module quiet zone.
for name,file in [('Body','Body.ttf'),('Bold','Bold.ttf'),('Display','Display.ttf'),('Heavy','Heavy.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(args.fonts/file)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
W,H=419.528,595.276
M=36
c=canvas.Canvas(str(args.output/'NextCourse-Mystery-Check-Booklet-Vorschau.pdf'),pagesize=(W,H),pageCompression=1)
c.setTitle('Mystery Check | Vorschau einer Info-Booklet-Seite | NextCourse')
c.setAuthor('NextCourse | Philip Tolle')
c._doc.Catalog.Lang=PDFString('de-DE')
def text(s,x,y,font='Body',size=10,color='#2B2D2F'):
    c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,H-y,s)
def para(s,x,y,w,font='Body',size=10,leading=15,color='#2B2D2F'):
    p=Paragraph(s,ParagraphStyle('p',fontName=font,fontSize=size,leading=leading,textColor=HexColor(color)))
    _,height=p.wrap(w,500);p.drawOn(c,x,H-y-height);return height
text('NextCourse',M,37,'Display',13,'#122A2F')
text('MANAGEMENT',W-116,35,'Body',7.4,'#62696A')
c.setStrokeColor(HexColor('#DADDDD'));c.setLineWidth(.5);c.line(M,H-49,W-M,H-49)
c.setStrokeColor(HexColor('#FF6B4A'));c.setLineWidth(1.2);c.line(M,H-80,M+18,H-80)
text('DER BLICK VON AUSSEN',M+28,83,'Bold',7.3,'#122A2F')
para('Mystery<br/>Check.',M,108,W-2*M,'Heavy',39,43,'#122A2F')
para('Wie kommt Ihr Betrieb<br/>wirklich an?',M,213,W-2*M,'Display',20,26,'#122A2F')
para('Wir erleben Ihr Hotel oder Restaurant anonym wie ein Gast. Sie erfahren, was überzeugt, wo Reibung entsteht und welche Schritte Sie zuerst angehen sollten.',M,281,W-2*M,size=10.1,leading=15.5)
para('<b>Konkrete Beobachtungen.</b> Eine klare Übersicht.<br/>5-10 priorisierte Maßnahmen für Ihren Betrieb.',M,347,W-2*M,size=10,leading=15.5)
c.setStrokeColor(HexColor('#DADDDD'));c.setLineWidth(.5);c.line(M,H-403,W-M,H-403)
qr_size=112
unit=qr_size/size
qx,qtop=M-4,426
for y in range(qr.get_size()):
    for x in range(qr.get_size()):
        if qr.get_module(x,y):
            c.setFillColor(HexColor('#122A2F'))
            c.rect(qx+(x+border)*unit,H-qtop-(y+border+1)*unit,unit,unit,fill=1,stroke=0)
c.linkURL(URL,(qx,H-qtop-qr_size,qx+qr_size,H-qtop),relative=0,thickness=0)
tx=M+131
para('So kann Ihre<br/>Auswertung aussehen.',tx,437,W-M-tx,'Display',13,18,'#122A2F')
para('QR-Code scannen und durch<br/>die Demo blättern.<br/><br/>18 Seiten · Fiktives Beispiel<br/>Ohne Anmeldung.',tx,483,W-M-tx,size=8.5,leading=12)
text('next-course.de/mystery-check-demo/',M,571,'Body',8,'#62696A')
c.linkURL(URL,(M,16,W-M,34),relative=0,thickness=0)
c.showPage();c.save()

manifest={'target_url':URL,'qr_modules':qr.get_size(),'quiet_zone_modules':border,'svg_print_size_mm':42,'status':'Local preview prepared; production publication must be verified before printing.','source_sha256':hashlib.sha256(args.source.read_bytes()).hexdigest(),'public_pdf_sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'pages':18}
(args.output/'QR-und-Veroeffentlichung.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'pages':18,'qr_target':URL,'qr_modules':qr.get_size(),'booklet':str(args.output/'NextCourse-Mystery-Check-Booklet-Vorschau.pdf'),'public_assets_kb':round(sum(f.stat().st_size for f in PUBLIC.iterdir())/1024)},ensure_ascii=False))
