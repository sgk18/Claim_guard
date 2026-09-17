# CLAIMGUARD — Design System & Visual Architecture

## 1. Brand Palette Specification
ClaimGuard strictly enforces a calibrated 5-color palette:

| Token | Hex | Role & Usage |
|---|---|---|
| **ORANGE** | `#F97316` | Primary action color, active indicators, focus rings, brand badges |
| **PEACH** | `#FDBA74` | Subtle highlights, active container backgrounds, muted warm tags |
| **NAVY** | `#0F172A` | Primary typography, headers, dark mode surfaces, high-contrast borders |
| **SLATE** | `#334155` | Secondary text, structured card borders, table dividers, secondary buttons |
| **OFF-WHITE** | `#F8FAFC` | Primary light canvas, container backgrounds, document preview canvas |

---

## 2. Design Composition (40 / 30 / 20 / 10 Formula)

1. **40% Minimalism & Contemporary Structure**:
   - Clean spacing scale (multiples of 4px).
   - Structured typography using `Inter` with controlled sizing (`10px`, `11px`, `12px`, `14px`, `16px`).
   - Generous breathing room without cluttered decoration.
2. **30% Brutalism**:
   - Distinct, crisp borders (`border-slate-300`, `border-slate-800`, `border-2`).
   - High visual weight and deliberate contrast between foreground and background.
   - Assertive, well-defined rectangular buttons and tables.
3. **20% Glassmorphism**:
   - Translucent top bars with backdrop blur (`backdrop-blur-md bg-slate-900/90`).
   - Floating contextual drawers and overlay inspection cards.
4. **10% Claymorphism**:
   - Subtle tactile elevation on primary buttons and modal containers (`shadow-tactile`, `shadow-clay`).
   - Tactile depth on interactive cards without looking like cartoon toys.

---

## 3. Strict No-Decoration Compliance
The codebase strictly complies with the **No-Decoration Rule**:
- **Zero Emojis**: All emoji glyphs are prohibited from UI text and buttons. All status cues use Lucide SVG icons.
- **Zero Fake Aesthetics**: No blinking LEDs, no green AI glow, no simulated CLI or terminal command prompts.
- **Tone**: Credible financial operations platform for enterprise compliance.
