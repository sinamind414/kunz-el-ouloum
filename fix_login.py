with open('src/components/LoginScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { Mail, Lock, LogIn, UserPlus, ShieldCheck, Trophy, Rocket, Sparkles, XCircle } from 'lucide-react';",
    "import { Mail, Lock, LogIn, UserPlus, ShieldCheck, Trophy, XCircle, AlertTriangle } from 'lucide-react';"
)

with open('src/components/LoginScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed lint errors in LoginScreen.")
