with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# The inserted entries end with `}]}]  \n  },` where there should be `}]}  \n  },`
content = content.replace('}]}]\n  },', '}]}\n  },')
content = content.replace('}]}]  \n  },', '}]}\n  },')

with open('C:/Users/zakaria/Documents/application kunz el ouloum finale/src/lessonData.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed extra closing brackets')
