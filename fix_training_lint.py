import re

with open('src/components/TrainingView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove unused imports
content = content.replace("import { Zap, Layers, Target, BookOpen, Rocket, Lightbulb, ChevronRight, Trophy, Flame, FileText, Lock } from 'lucide-react';", "import { Zap, Layers, Target, BookOpen, Rocket, Lightbulb, ChevronRight, Trophy, Flame, Lock } from 'lucide-react';")

# Remove unused constant
content = re.sub(r'const BEGINNER_ASSIMILATION_STEPS = \[.*?\] as const;\n', '', content)

with open('src/components/TrainingView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed lint errors.")
