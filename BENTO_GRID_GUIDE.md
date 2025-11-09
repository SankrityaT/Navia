# Bento Grid Layout - Solution Section

## 🍱 Asymmetric Bento Grid Design

### Layout Structure (12-column grid)

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  MASKING ASSESSMENT TOOL                    │  ENVIRONMENTAL │
│  (7 cols × 2 rows)                          │  MAPPING       │
│  - Large feature card                       │  (5 cols × 1)  │
│  - Gradient: clay-100 → clay-200            │                │
│  - Brain icon                               ├────────────────┤
│  - 3 bullet points                          │  ENERGY        │
│                                             │  MANAGEMENT    │
│                                             │  (5 cols × 1)  │
├─────────────────────────────────────────────┼────────────────┤
│  PROGRESS TRACKING    │  DAILY SUPPORT      │  PERSONALIZED  │
│  (4 cols × 1)         │  (8 cols × 1)       │  RECOMMENDATIONS│
│                       │                     │  (4 cols × 2)  │
│                       │                     │                │
│                       │                     │                │
└───────────────────────┴─────────────────────┴────────────────┘
```

## Color Palette Per Card

### Masking Assessment (Large)
- **Background**: `from-[var(--clay-100)] via-[var(--sand)] to-[var(--clay-200)]`
- **Border**: `border-[var(--clay-300)]/40`
- **Icon**: Clay gradient (400 → 600)
- **Accent**: Sage-600 bullet points

### Environmental Mapping (Medium)
- **Background**: `from-[var(--sage-400)]/20 via-[var(--sand)] to-[var(--sage-500)]/30`
- **Border**: `border-[var(--sage-500)]/30`
- **Icon**: Sage gradient (500 → moss-600)

### Energy Management (Medium)
- **Background**: `from-[var(--clay-200)]/40 via-[var(--sand)] to-[var(--clay-300)]/50`
- **Border**: `border-[var(--clay-300)]/40`
- **Icon**: Clay gradient (500 → 700)

### Personalized Recommendations (Tall)
- **Background**: `from-[var(--clay-300)]/30 via-[var(--sand)] to-[var(--clay-400)]/40`
- **Border**: `border-[var(--clay-300)]/40`
- **Icon**: Clay gradient (400 → 600)
- **Accent**: Clay-500 bullet points

### Progress Tracking (Medium)
- **Background**: `from-[var(--sage-400)]/30 via-[var(--sand)] to-[var(--sage-500)]/40`
- **Border**: `border-[var(--sage-500)]/30`
- **Icon**: Sage gradient (500 → moss-600)

### Daily Support (Wide)
- **Background**: `from-[var(--clay-100)] via-[var(--sand)] to-[var(--clay-200)]/60`
- **Border**: `border-[var(--clay-300)]/40`
- **Icon**: Clay gradient (400 → 600)

## Grid Specifications

### Desktop (md: breakpoint)
```css
grid-cols-12
auto-rows-[minmax(200px,auto)]
gap-6
```

### Mobile
```css
grid-cols-1
```

### Card Sizes
- **Large**: `md:col-span-7 md:row-span-2` (Masking Assessment)
- **Tall**: `md:col-span-4 md:row-span-2` (Personalized Recommendations)
- **Wide**: `md:col-span-8 md:row-span-1` (Daily Support)
- **Medium**: `md:col-span-5 md:row-span-1` (Environmental, Energy)
- **Small**: `md:col-span-4 md:row-span-1` (Progress)

## Visual Hierarchy

### 1. Primary Focus (Largest)
- **Masking Assessment Tool**
- 7 columns × 2 rows
- Most detailed content
- 3 feature bullets

### 2. Secondary Focus (Tall)
- **Personalized Recommendations**
- 4 columns × 2 rows
- Vertical emphasis
- 3 small bullets

### 3. Supporting Features (Medium)
- **Environmental Mapping**: 5×1
- **Energy Management**: 5×1
- **Progress Tracking**: 4×1

### 4. Full-Width Message (Wide)
- **Daily Support**: 8×1
- Horizontal emphasis
- Empathetic message

## Hover Effects

All cards have consistent hover behavior:
```css
hover:-translate-y-1
hover:shadow-2xl
hover:border-opacity-increase
transition-all duration-500
```

### Icon Hover
```css
group-hover:scale-110
transition-transform duration-500
```

## Responsive Behavior

### Desktop (md+)
- 12-column asymmetric grid
- Cards span multiple columns/rows
- Visual interest through variety

### Tablet
- Adapts to smaller screens
- Maintains proportions

### Mobile
- Single column
- Cards stack vertically
- Full width

## Color Strategy

### Warm Terracotta (Clay)
- Primary feature cards
- Main CTAs
- Dominant presence

### Cool Sage/Moss
- Accent cards
- Balance warm tones
- Natural, calming

### Neutral Sand/Cream
- Background base
- Unifying element
- Breathing room

## Atmospheric Effects

### Blur Layers
```css
/* Top right */
w-[500px] h-[500px] 
bg-[var(--sage-400)] 
blur-[120px] opacity-20

/* Bottom left */
w-[400px] h-[400px]
bg-[var(--clay-200)]
blur-[100px] opacity-25
```

### Card Blur Accents
```css
/* Inside large cards */
w-48 h-48
bg-[var(--clay-300)]
blur-[80px] opacity-30
```

## Typography Hierarchy

### Section Title
- **Size**: 4xl → 6xl (responsive)
- **Font**: Fraunces serif
- **Weight**: Bold
- **Accent**: Italic light for subtitle

### Card Titles
- **Large card**: 3xl → 4xl
- **Other cards**: 2xl
- **Font**: Fraunces serif
- **Weight**: Bold

### Body Text
- **Size**: lg (large card), base (others)
- **Font**: DM Sans
- **Color**: charcoal/70

### Bullets
- **Size**: base (large), sm (tall)
- **Dots**: 2px or 1.5px circles
- **Color**: Sage-600 or Clay-500

## Icons

### Sizes
- **Large card**: 8×8 (w-16 h-16 container)
- **Other cards**: 7×7 (w-14 h-14 container)

### Style
- **Stroke**: 2.5px weight
- **Color**: Cream (on gradient backgrounds)
- **Container**: Rounded-2xl with gradient

### Icon Choices
- **Brain**: Masking assessment (cognitive)
- **MapPin**: Environmental mapping (location)
- **Zap**: Energy management (power)
- **Lightbulb**: Recommendations (ideas)
- **TrendingUp**: Progress tracking (growth)
- **Heart**: Daily support (care)

## Spacing

### Card Padding
- **Large**: p-10 md:p-12
- **Others**: p-8

### Grid Gap
- **All**: gap-6

### Internal Spacing
- **Icon to title**: mb-5 or mb-6
- **Title to description**: mb-4
- **Description to bullets**: mb-6

## Border Strategy

### Thickness
- **All cards**: 2px solid

### Opacity
- **Default**: /30 or /40
- **Hover**: /50 or /60

### Colors
- **Clay cards**: border-[var(--clay-300)]
- **Sage cards**: border-[var(--sage-500)]

## Shadow Hierarchy

### Default
- **Large card**: shadow-lg (implied by gradient)
- **Icons**: shadow-lg

### Hover
- **All cards**: shadow-2xl
- Increases depth perception

## Performance Notes

- CSS Grid for layout (no JavaScript)
- GPU-accelerated transforms
- Optimized blur effects
- Smooth 500ms transitions

## Accessibility

- ✅ Semantic HTML structure
- ✅ Sufficient color contrast
- ✅ Keyboard navigable
- ✅ Screen reader friendly
- ✅ Responsive text sizes

---

**Result**: A visually dynamic, asymmetric bento grid that creates visual interest while maintaining the warm, organic aesthetic and neurodivergent-friendly accessibility.
