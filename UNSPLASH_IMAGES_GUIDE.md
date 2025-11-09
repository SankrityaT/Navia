# Unsplash Images Guide for Navia Landing Page

## 🎨 Image Selection Criteria

For the CTA mockup section and throughout the landing page, choose images that are:
- **Calming & Soothing**: Soft, muted tones
- **Neurodivergent-Friendly**: Not overwhelming or busy
- **Warm-Organic**: Natural, earthy aesthetics
- **Minimalistic**: Clean, uncluttered compositions

## 📸 Recommended Unsplash Images

### For Dashboard Mockup - "Insight Card" Background

**Search Terms on Unsplash:**
1. "minimal workspace desk"
2. "calm nature soft light"
3. "peaceful morning coffee"
4. "cozy reading nook"
5. "gentle hands plants"
6. "soft natural light window"

**Specific Image Recommendations:**

#### Option 1: Calming Workspace
- **URL**: `https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b`
- **Description**: Minimal desk with plant, soft natural light
- **Why**: Clean, organized, calming workspace aesthetic
- **Photographer**: @jessbailey

#### Option 2: Gentle Nature
- **URL**: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e`
- **Description**: Soft forest path with warm sunlight
- **Why**: Natural, peaceful, grounding imagery
- **Photographer**: @lukechesser

#### Option 3: Cozy Comfort
- **URL**: `https://images.unsplash.com/photo-1513694203232-719a280e022f`
- **Description**: Warm coffee cup with soft bokeh
- **Why**: Comforting, warm, relatable moment
- **Photographer**: @nate_dumlao

#### Option 4: Peaceful Hands
- **URL**: `https://images.unsplash.com/photo-1466692476868-aef1dfb1e735`
- **Description**: Hands holding small plant with soft focus
- **Why**: Gentle, nurturing, growth-oriented
- **Photographer**: @noahbuscher

#### Option 5: Soft Morning Light
- **URL**: `https://images.unsplash.com/photo-1501139083538-0139583c060f`
- **Description**: Minimal bedroom with soft natural light
- **Why**: Calm, safe space aesthetic
- **Photographer**: @samuelzeller

### For Additional Hero/Background Elements

#### Terracotta & Clay Textures
- **Search**: "terracotta pottery texture"
- **Search**: "clay ceramic minimal"
- **URL**: `https://images.unsplash.com/photo-1610701596007-11502861dcfa`
- **Description**: Warm terracotta pottery
- **Photographer**: @oriento

#### Sage & Natural Elements
- **Search**: "sage plant minimal"
- **Search**: "eucalyptus soft light"
- **URL**: `https://images.unsplash.com/photo-1452827073306-6e6e661baf57`
- **Description**: Soft sage green plants
- **Photographer**: @anniespratt

#### Abstract Organic Shapes
- **Search**: "abstract organic shapes beige"
- **Search**: "minimal sand dunes"
- **URL**: `https://images.unsplash.com/photo-1509114397022-ed747cca3f65`
- **Description**: Soft sand dunes, organic curves
- **Photographer**: @pawel_czerwinski

## 🎯 How to Implement

### Using Next.js Image Component

```tsx
import Image from 'next/image';

// In your component
<div className="relative h-32 overflow-hidden">
  <Image
    src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80"
    alt="Calming workspace with natural light"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>
```

### Optimizing Unsplash URLs

Add these parameters to Unsplash URLs:
- `?w=800` - Set width to 800px
- `&q=80` - Quality 80%
- `&fit=crop` - Crop to fit
- `&auto=format` - Auto format (WebP when supported)

**Example:**
```
https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80&fit=crop&auto=format
```

## 🎨 Color Matching Tips

### Overlay Gradients
To ensure images match your palette, add gradient overlays:

```tsx
<div className="relative">
  <Image src="..." alt="..." fill />
  <div className="absolute inset-0 bg-gradient-to-br from-[var(--clay-200)]/40 to-[var(--sage-300)]/40"></div>
</div>
```

### Filters for Cohesion
```css
filter: saturate(0.8) brightness(1.1);
```

## 📋 Image Checklist

Before using an image, ensure:
- ✅ **Soft colors** (no harsh neons or high contrast)
- ✅ **Minimal composition** (not busy or cluttered)
- ✅ **Warm tones** (matches terracotta/sage palette)
- ✅ **High quality** (at least 1200px wide)
- ✅ **Proper attribution** (credit photographer)
- ✅ **Accessible** (good contrast with text overlays)

## 🔍 Unsplash Collections to Browse

### Curated Collections:
1. **"Minimal & Calm"** - Search: minimal calm workspace
2. **"Natural & Organic"** - Search: natural organic textures
3. **"Warm & Cozy"** - Search: warm cozy home
4. **"Neurodivergent-Friendly"** - Search: peaceful simple nature

### Recommended Photographers:
- **@anniespratt** - Soft nature photography
- **@jessbailey** - Minimal workspace aesthetics
- **@samuelzeller** - Clean, calm interiors
- **@oriento** - Warm, organic textures
- **@pawel_czerwinski** - Abstract organic shapes

## 💡 Pro Tips

1. **Consistency**: Use images from the same photographer or collection for visual cohesion
2. **Aspect Ratios**: Maintain consistent ratios (4:5 for mobile, 16:9 for desktop)
3. **Loading**: Use Next.js Image component for automatic optimization
4. **Fallbacks**: Always have gradient fallbacks if images fail to load
5. **Accessibility**: Add descriptive alt text for screen readers

## 🎭 Mood Board

**Overall Vibe:**
- Warm morning light through windows
- Hands gently holding plants or pottery
- Minimal desks with single plant
- Soft fabric textures (linen, cotton)
- Natural wood and clay materials
- Peaceful nature scenes (no dramatic landscapes)
- Cozy reading nooks
- Gentle self-care moments

**Avoid:**
- Busy patterns or textures
- High-contrast images
- Bright neon colors
- Corporate/sterile environments
- Dramatic or intense imagery
- Cluttered spaces
- Cold, harsh lighting

---

## 🚀 Quick Start

1. Visit [Unsplash.com](https://unsplash.com)
2. Search: "minimal workspace natural light"
3. Filter by: Orientation (Landscape), Color (Beige/Brown)
4. Select image with soft, warm tones
5. Copy URL and add optimization parameters
6. Implement with Next.js Image component
7. Add gradient overlay if needed
8. Test on mobile and desktop

**Remember**: The goal is to create a calming, supportive atmosphere that doesn't overwhelm neurodivergent users while maintaining your beautiful warm-organic aesthetic! 🌿✨
