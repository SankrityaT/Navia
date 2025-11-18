# iOS App vs Web App - UI Comparison

## 🎯 Goal: PIXEL-PERFECT Match

The iOS app must feel **IDENTICAL** to the web app. Users should NOT feel like "we outsourced some shitty app dev to replicate our web app." Every component, color, spacing, and animation must match EXACTLY.

---

## ✅ Fixed Components (Match Web Exactly)

### 1. **NaviaAvatar** ✅ FIXED
| Aspect | Web | iOS | Status |
|--------|-----|-----|--------|
| Shape | Gradient orb | ~~Circle with "N"~~ → **Gradient orb** | ✅ |
| Gradient | #C97D56 → #8A9B80 → #D89B76 | ✅ Same | ✅ |
| Outer glow | Radial gradient, pulses when speaking | ✅ Same | ✅ |
| Inner highlight | White gradient at 30% 30% | ✅ Same | ✅ |
| Breathing | Subtle scale 1.0 → 1.02 | ✅ Same | ✅ |
| Thinking | Rotates 360° + scale 1.1 | ✅ Same | ✅ |
| Speaking | 3 animated white dots | ✅ Same | ✅ |

**Web ref:** `components/ai/NaviaAvatar.tsx`

### 2. **Chat Bubbles** ✅ FIXED
| Aspect | Web | iOS | Status |
|--------|-----|-----|--------|
| User message | Clay bubble (#C77A4C), white text, right | ✅ Same | ✅ |
| Assistant message | NO bubble, just text, left | ~~Had bubble~~ → **No bubble** | ✅ |
| Max width | 80% | ✅ Same | ✅ |
| Rounding | rounded-2xl (16px) | ✅ Same | ✅ |
| Shadow | Subtle shadow | ✅ Same | ✅ |

**Web ref:** `components/chat/ChatInterface.tsx` (lines 890-920)

---

## ⚠️ Components That Need Review

### 3. **Buttons (NaviaButton)** ⚠️ NEEDS VERIFICATION
| Component | Web Style | iOS Style | Match? |
|-----------|-----------|-----------|--------|
| Primary button | Clay-500 bg, white text, rounded-full | Clay-500 bg, cream text, rounded-lg | ⚠️ Check radius |
| Hover effect | Clay-600, scale-105, shadow-2xl | N/A (touch) | - |
| Secondary | Sage-600 bg, white text | Sage-500 bg, cream text | ⚠️ Check shade |
| Text size | Variable (text-2xl on modals, text-sm on cards) | Fixed .naviaHeadline | ⚠️ |

**Web examples:**
- Wake Navia button: `bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-12 py-6 rounded-full text-2xl font-bold`
- Task breakdown button: `text-[var(--clay-600)] hover:text-[var(--charcoal)] hover:bg-[var(--clay-100)] text-xs md:text-sm font-medium rounded-md px-2 py-1`

**Action needed:** Compare button sizes, corner radius, and exact shades

### 4. **Cards (NaviaCard)** ⚠️ NEEDS VERIFICATION
| Aspect | Web | iOS | Match? |
|--------|-----|-----|--------|
| Background | Sand | Sand | ✅ |
| Corner radius | Varies by component | xl (24px) | ⚠️ |
| Shadow | Subtle | `opacity(0.05), radius: 8` | ⚠️ |
| Padding | Varies | Fixed cardPadding | ⚠️ |

**Web examples:**
- Dashboard bento cards have specific gap-16 spacing
- Some cards have no shadow, others have subtle shadow

**Action needed:** Check exact padding and shadow values per component

### 5. **Navia Modal/Assistant** ❌ NOT CHECKED YET
| Aspect | Web | iOS | Status |
|--------|-----|-----|--------|
| Layout | Fullscreen (fixed inset-0) | ??? | ❓ |
| Background | Cream | ??? | ❓ |
| Close button | Top-right, charcoal bg, large X icon | ??? | ❓ |
| Avatar size | lg (w-40 h-40 = 160px) | ??? | ❓ |
| Title | "Navia" in Fraunces, text-6xl | ??? | ❓ |
| Content layout | Centered, max-w-4xl | ??? | ❓ |

**Web ref:** `components/ai/NaviaAssistant.tsx` + `UniversalNavia.tsx`

**Action needed:** Build full comparison once modal is visible

---

## 🔍 Components Not Yet Compared

### 6. **Dashboard Components**
- [ ] Greeting header ("Good morning, {name}! 💛")
- [ ] Navia avatar placement (centered with 😴 emoji)
- [ ] Tasks section layout
- [ ] Task list items (checkbox, title, breakdown button, delete button)
- [ ] Energy slider
- [ ] Brain dump section
- [ ] Focus mode cards

### 7. **Focus Mode**
- [ ] Inspirational cards ("🌊 Take your time", "💛 You're not alone")
- [ ] Duration presets (15/25/45/60 min buttons)
- [ ] Timer display (circular progress)
- [ ] Add time buttons (+1/+5/+15 min)
- [ ] Immersive fullscreen mode
- [ ] Music player placeholder

### 8. **Typography**
| Element | Web | iOS | Match? |
|---------|-----|-----|--------|
| Display | Fraunces (serif) | SF Rounded | ❌ |
| Body | DM Sans | San Francisco | ❌ |

**Issue:** iOS doesn't support custom web fonts by default. Using system fonts instead.

**Options:**
1. Accept system fonts (better iOS performance)
2. Bundle DM Sans + Fraunces fonts (more work, larger app size)

---

## 🎨 Colors - Verification Needed

### Exact Web Colors (from globals.css):
```css
--clay-500: #C97D56
--clay-600: #B4633F
--sage-500: #8A9B80
--sage-600: #6D7F63
--cream: #FFFBF7
--sand: (not defined in CSS - need to find)
--charcoal: (not defined - need to find)
```

### iOS Colors (from Colors.swift):
```swift
clay500: Color(hex: "C97D56") ✅ Match
clay600: Color(hex: "B4633F") ✅ Match
sage500: Color(hex: "8A9B80") ✅ Match
sage600: Color(hex: "6D7F63") ✅ Match
cream: Color(hex: "FFFBF7") ✅ Match
sand: ??? Need to verify
charcoal: ??? Need to verify
```

**Action needed:** Verify ALL color definitions match web exactly

---

## 📐 Spacing & Layout

### Web Spacing (Tailwind):
- `gap-6` = 24px
- `gap-16` = 64px (dashboard bento grid)
- `p-4` = 16px
- `px-12 py-6` = 48px horizontal, 24px vertical
- `rounded-2xl` = 16px
- `rounded-full` = 9999px

### iOS Spacing (from Spacing.swift):
Need to verify these match web spacing EXACTLY

**Action needed:** Create side-by-side comparison of all spacing values

---

## 🎭 Animations

### Web Animations:
- Framer Motion for all transitions
- Subtle scale on hover (scale-105)
- Fade-in for messages (opacity 0→1, y 10→0)
- Pulse for avatar speaking
- Rotate for avatar thinking

### iOS Animations:
- SwiftUI animations
- Need to verify timing and easing match web

**Action needed:** Record side-by-side video to compare animation feel

---

## ✅ Next Steps (Priority Order)

1. **[HIGH]** Compare dashboard layout with web screenshots
2. **[HIGH]** Verify button styles match exactly (corner radius, sizes)
3. **[HIGH]** Check Navia modal/assistant layout
4. **[HIGH]** Verify ALL color definitions
5. **[MEDIUM]** Compare focus mode components
6. **[MEDIUM]** Check task card styling (checkbox, buttons, spacing)
7. **[MEDIUM]** Verify all spacing values match web
8. **[LOW]** Record animation comparison video
9. **[LOW]** Consider bundling custom fonts (Fraunces + DM Sans)

---

## 🧪 Testing Checklist

To verify UI matches:

- [ ] Take screenshot of web dashboard
- [ ] Take screenshot of iOS dashboard
- [ ] Overlay screenshots to check alignment
- [ ] Compare colors with color picker
- [ ] Check spacing with ruler tool
- [ ] Record both apps side-by-side for animation comparison
- [ ] Test on different screen sizes

---

## 💡 Pro Tip

Use **Figma** or **design overlay tools** to literally overlay web screenshots on top of iOS screenshots. Any pixel difference will be immediately visible.

**Tools:**
- **xScope** (Mac) - Measure pixels, colors, alignment
- **Figma** - Overlay comparison
- **ColorSnapper** - Pick exact colors from screen

---

**Last updated:** After fixing NaviaAvatar and ChatBubbles
**Status:** 2/10+ components verified, ~8+ components need review
