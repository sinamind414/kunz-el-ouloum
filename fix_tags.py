with open('src/components/LessonsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to make sure the fragment opening in `{!selectedDomain && !showSvt && (<> ...` 
# is properly closed with `</>)` before `{/* LEVEL 1b`

old_part = """          </section>

          {/* LEVEL 1b — Concepts SVT library */}
      {!selectedDomain && showSvt && ("""

new_part = """          </section>
        </>
      )}

      {/* LEVEL 1b — Concepts SVT library */}
      {!selectedDomain && showSvt && ("""

content = content.replace(old_part, new_part)

with open('src/components/LessonsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
