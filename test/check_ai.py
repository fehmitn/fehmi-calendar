import fitz, sys, os

path = os.path.join(os.path.dirname(__file__), "calendrier-test.ai")
doc = fitz.open(path)
print("Pages :", doc.page_count)
print("PDF valide, métadonnées :", doc.metadata.get("title"))

for i in (0, 1):
    page = doc[i]
    # XObjects images de la page
    imgs = page.get_images(full=True)
    print(f"\nPage {i+1} : {len(imgs)} image(s) XObject")
    for x in imgs:
        print("   xref", x[0], "nom", x[7], f"{x[2]}x{x[3]}")
    # rendu PNG
    pix = page.get_pixmap(dpi=96)
    out = os.path.join(os.path.dirname(__file__), f"render-p{i+1}.png")
    pix.save(out)
    print("   rendu ->", out, pix.width, "x", pix.height)
doc.close()
