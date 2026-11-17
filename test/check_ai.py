"""Validation des .ai générés par test/harness-ai.mjs.

PDFium = moteur de Chrome/Edge (et de nombreux visionneurs) : c'est LA référence.
MuPDF/PyMuPDF est trop tolérant (il acceptait des fichiers sans en-tête %PDF,
refusés par PDFium) — ne pas s'y fier seul.

Prérequis : python -m pip install pypdfium2
"""
import os
import pypdfium2 as pdfium

here = os.path.dirname(__file__)
for name in ("calendrier-test.ai", "calendrier-test-baked.ai", "calendrier-test-flate.ai"):
    path = os.path.join(here, name)
    if not os.path.exists(path):
        print("absent :", name)
        continue
    try:
        doc = pdfium.PdfDocument(path)
        page = doc[0]
        img = page.render(scale=1.5).to_pil()
        out = os.path.join(here, "pdfium-" + name.replace(".ai", "") + "-p1.png")
        img.save(out)
        # un pixel du centre doit être non blanc si une photo est dessinée
        centre = img.getpixel((img.width // 2, img.height // 2))
        print(f"{name}: OK, {len(doc)} pages, centre={centre[:3]} -> {os.path.basename(out)}")
        # régression : un mois sans férié ne doit afficher AUCUN message
        text = "\n".join(
            doc[i].get_textpage().get_text_range() for i in range(len(doc))
        )
        n = text.count("Aucun jour")
        print("   message « Aucun jour férié » :", n, "->", "OK" if n == 0 else "ECHEC")
        doc.close()
    except Exception as e:
        print(f"{name}: ECHEC -> {e}")
