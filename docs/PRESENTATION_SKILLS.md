# ClaimGuard Presentation Skill & Tooling Inventory

This inventory documents all local skills, global skills, plugins, and libraries discovered, evaluated, and utilized across the ClaimGuard Master Product Pitch deck creation workflow.

---

## 1. Skill & Tooling Inventory Matrix

| Skill / Tool Name | Category | Source / Location | Version / Engine | Purpose in Pitch Workflow | Primary Subagent / Role | Status |
|---|---|---|---|---|---|---|
| `guizang-ppt-skill` | Presentations & Web Decks | `C:\Users\Surya VM\.gemini\config\skills\guizang-ppt-skill\` | Swiss International (Style B) / WebGL | Architectural layout principles (Swiss 12-col grid, typography contrast ratio 8:1, presenter mode contracts) | Presentation Architect, Visual QA | Reused & adapted |
| `python-pptx` | PPTX Generation | Python Package (`pip install python-pptx`) | 1.0.2 | Programmatic compilation of native, editable `ClaimGuard_Product_Pitch.pptx` with embedded speaker notes | PPTX Engineer | Installed & Active |
| `modern-web-guidance-plugin` | Design Systems & CSS | `C:\Users\Surya VM\.gemini\config\plugins\modern-web-guidance-plugin` | Web Standards 2026 | Color token modeling, fluid clamp scaling, accessible focus states, 40/30/20/10 design formula | Design System Engineer | Active |
| `chrome-devtools-plugin` | Visual QA & Headless Browser | `C:\Users\Surya VM\.gemini\config\plugins\chrome-devtools-plugin` | Chrome DevTools Protocol | Real-time viewport DOM inspection, CSS box model validation, layout bug discovery | Visual QA Engineer | Active |
| `playwright` | Browser Automation & Testing | Node Package (`npx playwright`) | 1.63.0 | Headless end-to-end rendering test, multi-resolution slide bounding box overflow checks | Visual QA Engineer | Active |
| `generate_image` | Image Generation | Native Tool (Google DeepMind) | State-of-the-Art | Generation of 6 high-fidelity contextual product hero images adhering to the ClaimGuard fintech identity | Visual Storyboard Artist | Active |
| `lucide-react` / Lucide CDN | Vector Icons | SVG Icon Set | 0.468+ | Universal icon syntax across slides without emojis or cluttered graphics | UI/UX Designer | Active |

---

## 2. Remote Skill & Capability Discovery Notes

- **PPTX Generation Strategy**: Evaluated multiple options for PowerPoint generation. Rather than generating broken XML or uneditable static images, `python-pptx` was installed into the active Python 3.14 environment. A specialized builder script maps all 15 slides into 16:9 widescreen PowerPoint slides with exact RGB brand colors, native vector shapes, and full speaker notes.
- **HTML Slide Engine**: Leveraged HTML5, Vanilla CSS custom properties, and modular JavaScript to build an ultra-fast, dependency-free interactive presentation. Incorporates responsive scaling (`aspect-ratio: 16 / 9; max-width: min(100vw, 177.78vh)`), live slide index indicators, full keyboard control (`ArrowLeft`, `ArrowRight`, `Space`, `F`, `P`, `Esc`), and a slide-out speaker notes panel.
- **Presenter Mode Contract**: Adapted the speaker note format from `guizang-ppt-skill` to structure every single slide with:
  1. Slide Purpose
  2. Spoken Track ("Say This" in 20–60s)
  3. Simple Explanation (Non-technical audience)
  4. Technical Explanation (Engineering audience)
  5. Why It Matters
  6. Important Caveat & Limitation
  7. Natural Transition
