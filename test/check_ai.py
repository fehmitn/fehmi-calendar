import fitz, sys, os

here = os.path.dirname(__file__)
for name in ("calendrier-test.ai", "calendrier-test-baked.ai"):
    path = os.path.join(here, name)
    if not os.path.exists(path):
        print("absent :", name); continue
    doc = fitz.open(path)
    print("\n=====", name, "— Pages :", doc.page_count)
    for i in (0, 1):
        page = doc[i]
        imgs = page.get_images(full=True)
        print(f"Page {i+1} : {len(imgs)} image(s) XObject")
        for x in imgs:
            print("   xref", x[0], "nom", x[7], f"{x[2]}x{x[3]}")
        pix = page.get_pixmap(dpi=96)
        out = os.path.join(here, f"render-{name.replace('.ai','')}-p{i+1}.png")
        pix.save(out)
        print("   rendu ->", out, pix.width, "x", pix.height)
    doc.close()
