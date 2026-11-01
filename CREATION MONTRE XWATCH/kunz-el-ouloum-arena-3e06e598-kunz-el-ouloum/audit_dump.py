import io, re

src = io.open('src/lessonData.ts', encoding='utf-8').read()

keys = re.findall(r'"([^"]+)":\s*\{', src)
titles = re.findall(r'titleAr:\s*`([^`]+)`', src)
objs = re.findall(r'objectives:\s*\[(.*?)\]', src, re.S)

print("NB_LESSONS:", len(keys))
out = []
out.append("NB_LESSONS: %d" % len(keys))
for i, (k, t) in enumerate(zip(keys, titles)):
    line = "===== %s || %s" % (k, t)
    print(line); out.append(line)
    o = objs[i] if i < len(objs) else ''
    oo = re.findall(r'`([^`]+)`', o)
    for x in oo:
        line2 = "   OBJ: " + x[:160]
        print(line2); out.append(line2)

io.open('audit_passive_dump.txt', 'w', encoding='utf-8').write("\n".join(out))
print("OK dump written")
