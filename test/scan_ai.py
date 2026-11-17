import os, re

here = os.path.dirname(__file__)
for name in ("calendrier-test.ai", "calendrier-test-baked.ai"):
    raw = open(os.path.join(here, name), "rb").read()
    print(name)
    print("   /ExtGState :", raw.count(b"/ExtGState"))
    print("   /Shading   :", raw.count(b"/Shading"))
    print("   clips (W n):", len(re.findall(rb"re W n", raw)))
    print("   /DCTDecode :", raw.count(b"/DCTDecode"))
    print("   gs operator:", len(re.findall(rb"/GS\d+ gs", raw)))
    print("   arc (invalid):", len(re.findall(rb"arc", raw)))
