// scripts/gen-phase26-append.mjs — Appends phase26_ch2, phase26_js, and writeFileSync calls
import { writeFileSync, readFileSync } from 'node:fs';
import { buildPage, CSS, JS } from './gen-phases-45-52.mjs';

const CRUMB_U11 = 'المجال الثالث : التكتونية العامة • الوحدة 3 : النشاط التكتوني والبنيات الجيولوجية المرتبطة به';
const OBJ = (h) => `<div>🎯 <strong>الهدف العلمي :</strong> ${h}</div>
                    <div>⏱️ <strong>المدة التقديرية للتعلم الذاتي :</strong> 25 دقيقة</div>`;

// phase26_ch2, phase26_js, and writeFileSync calls would go here
// Actually, we can't import phase26_ch1 etc. because they're not exported.
// Instead, we'll append directly to the gen script.
console.log('This file is a placeholder - use the append script instead');
