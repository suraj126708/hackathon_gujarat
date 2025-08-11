# QuickCourt Design System Documentation

## 🎨 Green & Blue Sports Color Scheme

A comprehensive design system built specifically for sports platforms, emphasizing green as the primary color and blue as the secondary color. This system provides a unified, cohesive experience across all components with proper accessibility and smooth animations.

## 📋 Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Component Classes](#component-classes)
4. [Animations](#animations)
5. [Usage Examples](#usage-examples)
6. [Accessibility](#accessibility)
7. [Dark Mode](#dark-mode)

## 🎨 Color System

### Primary Colors (Green Spectrum)

- `--color-primary-50` to `--color-primary-950`: Complete green spectrum
- **Main Primary**: `--color-primary-500` (#22c55e)
- **Primary Hover**: `--color-primary-600` (#16a34a)

### Secondary Colors (Blue Spectrum)

- `--color-secondary-50` to `--color-secondary-950`: Complete blue spectrum
- **Main Secondary**: `--color-secondary-500` (#3b82f6)
- **Secondary Hover**: `--color-secondary-600` (#2563eb)

### Accent Colors

- **Orange**: `--color-accent-orange-500` (#f97316) - For warnings and highlights
- **Purple**: `--color-accent-purple-500` (#a855f7) - For special features

### Semantic Colors

```css
--color-success: var(--color-primary-500);
--color-warning: var(--color-accent-orange-500);
--color-error: #ef4444;
--color-info: var(--color-secondary-500);
```

### Gradients

```css
--gradient-primary: linear-gradient(
  135deg,
  var(--color-primary-500) 0%,
  var(--color-primary-600) 100%
);
--gradient-secondary: linear-gradient(
  135deg,
  var(--color-secondary-500) 0%,
  var(--color-secondary-600) 100%
);
--gradient-primary-to-secondary: linear-gradient(
  135deg,
  var(--color-primary-500) 0%,
  var(--color-secondary-500) 100%
);
--gradient-hero: linear-gradient(
  135deg,
  var(--color-primary-600) 0%,
  var(--color-secondary-600) 50%,
  var(--color-accent-purple-600) 100%
);
```

## 📝 Typography

### Font System

- **Primary Font**: Inter, Segoe UI, system fonts
- **Font Sizes**: `--font-size-xs` (12px) to `--font-size-7xl` (72px)
- **Responsive**: Automatically scales down on mobile devices

### Usage

```css
/* Headings automatically use the font system */
h1 {
  font-size: var(--font-size-5xl);
  font-weight: 800;
}
h2 {
  font-size: var(--font-size-4xl);
  font-weight: 700;
}

/* Text colors */
.text-primary {
  color: var(--color-primary-600);
}
.text-secondary {
  color: var(--color-secondary-600);
}
.text-muted {
  color: var(--color-text-muted);
}
```

## 🧩 Component Classes

### Buttons

#### Primary Sports Button

```html
<button class="btn-sports-primary">
  🚀 Book Now
  <svg><!-- icon --></svg>
</button>
```

#### Button Variants

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>
```

### Cards

#### Enhanced Venue Card

```html
<div class="venue-card-enhanced">
  <div class="venue-image-enhanced">
    <img src="..." alt="..." />
    <div class="venue-rating-badge-enhanced">⭐ 4.8</div>
  </div>
  <div class="venue-info-enhanced">
    <div class="venue-header-enhanced">
      <h3>Venue Name</h3>
    </div>
    <div class="venue-location-enhanced">
      <span class="location-icon-enhanced">📍</span>
      Location
    </div>
    <div class="venue-price-enhanced">
      <span class="price-value">₹500</span>
      <span class="per-hour">/hour</span>
    </div>
    <div class="venue-tags-enhanced">
      <span class="venue-badge-enhanced sport">Sport</span>
      <span class="venue-badge-enhanced type">Type</span>
    </div>
    <button class="venue-details-btn-enhanced">View Details</button>
  </div>
</div>
```

#### Standard Card

```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Navigation

#### Enhanced Navbar

```html
<nav class="navbar-enhanced">
  <div class="container flex-between">
    <a href="#" class="navbar-brand-enhanced">QuickCourt</a>
    <div class="navbar-nav-enhanced">
      <a href="#" class="nav-link-enhanced active">Home</a>
      <a href="#" class="nav-link-enhanced">Venues</a>
    </div>
  </div>
</nav>
```

### Forms

```html
<div>
  <label class="form-label" for="input">Label</label>
  <input
    type="text"
    id="input"
    class="form-input focus-ring"
    placeholder="Placeholder"
  />
</div>
```

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-secondary">Secondary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

## ✨ Animations

### Sports-Themed Animations

```html
<!-- Floating animation -->
<div class="animate-float">Content</div>

<!-- Pulse effects with colors -->
<div class="animate-pulse-green">Green pulse</div>
<div class="animate-pulse-blue">Blue pulse</div>

<!-- Glow effects -->
<div class="animate-glow-primary">Primary glow</div>
<div class="animate-glow-secondary">Secondary glow</div>

<!-- Entrance animations -->
<div class="animate-fade-in-up">Fade in up</div>
<div class="animate-slide-in-right">Slide in right</div>
```

### Loading States

```html
<!-- Spinner -->
<div class="loading-enhanced">
  <div class="loading-spinner-enhanced"></div>
  <span>Loading...</span>
</div>

<!-- Dots -->
<div class="loading-enhanced">
  <div class="loading-dots-enhanced">
    <div class="loading-dot-enhanced"></div>
    <div class="loading-dot-enhanced"></div>
    <div class="loading-dot-enhanced"></div>
  </div>
  <span>Processing</span>
</div>

<!-- Button loading state -->
<button class="btn btn-primary loading">Loading...</button>
```

## ♿ Accessibility

### Focus Management

- All interactive elements have proper focus states
- Use `.focus-ring` class for custom focus indicators
- Screen reader support with `.sr-only` class

### Color Contrast

- All color combinations meet WCAG 2.1 AA standards
- High contrast mode support included
- Text remains readable in both light and dark modes

### Reduced Motion

- Respects `prefers-reduced-motion: reduce`
- Animations are automatically disabled for users who prefer reduced motion

## 🌙 Dark Mode

### Automatic Support

The system automatically responds to system dark mode preferences:

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles applied automatically */
}
```

### Manual Toggle

Add the `.dark-theme` class to the body for manual dark mode:

```javascript
// Toggle dark theme
document.body.classList.toggle("dark-theme");
```

## 🚀 Usage Examples

### 1. Hero Section

```html
<section class="hero-enhanced">
  <div class="hero-content-enhanced">
    <h1 class="hero-title-enhanced">
      Your Platform <span class="gradient-text">Name</span>
    </h1>
    <p class="hero-subtitle-enhanced">Description text</p>
    <div class="hero-cta-enhanced">
      <button class="btn-sports-primary">Primary Action</button>
      <button class="btn-sports-secondary">Secondary Action</button>
    </div>
  </div>
</section>
```

### 2. Feature Cards

```html
<div class="demo-grid">
  <div class="feature-card-enhanced">
    <div class="feature-icon-enhanced">📍</div>
    <h3 class="feature-title-enhanced">Feature Title</h3>
    <p class="feature-description-enhanced">Feature description</p>
  </div>
  <!-- More feature cards -->
</div>
```

### 3. Sports Grid

```html
<div class="sports-grid-enhanced">
  <div class="sport-card-enhanced">
    <img src="..." alt="Sport" class="sport-image-enhanced" />
    <div class="sport-overlay-enhanced">
      <div class="sport-icon-enhanced">🏸</div>
      <div class="sport-name-enhanced">Badminton</div>
    </div>
  </div>
  <!-- More sport cards -->
</div>
```

## 📱 Responsive Design

The system is fully responsive and includes:

- Mobile-first approach
- Automatic font scaling on smaller screens
- Responsive spacing adjustments
- Touch-friendly interactive elements

## 🎯 Best Practices

1. **Consistency**: Always use CSS custom properties instead of hardcoded colors
2. **Accessibility**: Test with screen readers and keyboard navigation
3. **Performance**: Use animations sparingly and respect motion preferences
4. **Maintenance**: Keep the color system centralized in the root variables

## 🛠️ Implementation

1. Import the stylesheets in your main CSS file:

```css
@import "./styles/global-theme.css";
@import "./styles/components.css";
```

2. Use the provided classes and variables throughout your components

3. Test in both light and dark modes

4. Verify accessibility with tools like axe or Lighthouse

## 📚 File Structure

```
src/
  styles/
    global-theme.css      # Core color system and variables
    components.css        # Enhanced component styles
  components/
    VenueCard.css        # Updated venue card styles
```

This design system provides a complete foundation for building a cohesive, accessible, and visually appealing sports platform with consistent green and blue theming throughout.
