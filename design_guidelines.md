# File Inventory & Optimization Tool - Design Guidelines

## Design Approach: Design System-Based (Material Design)
**Justification**: This is a utility-focused, information-dense application requiring efficiency and learnability. Material Design provides excellent patterns for data visualization, progressive disclosure, and mobile-first experiences.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light mode: 219 69% 40% (deep blue)
- Dark mode: 219 69% 60% (lighter blue)

**Background & Surface:**
- Light mode backgrounds: 210 20% 98% (very light blue-gray)
- Dark mode backgrounds: 220 15% 8% (very dark blue-gray)
- Surface cards: Light: 0 0% 100%, Dark: 220 15% 12%

**Semantic Colors:**
- Success (savings): 142 71% 45%
- Warning (duplicates): 38 92% 50%
- Error (high costs): 0 84% 60%
- Info (neutral): 217 91% 60%

### B. Typography
**Font Family**: System fonts (SF Pro, Roboto, Segoe UI)
**Scales by Mode:**
- Easy: Base 18px, headers 24-32px
- Standard: Base 16px, headers 20-28px
- Pro: Base 14px, headers 18-24px

### C. Layout System
**Tailwind Spacing Units**: 2, 4, 6, 8, 12, 16
- Consistent spacing: p-4, m-8, gap-6
- Card padding: p-6
- Section spacing: mb-12, mt-16

### D. Component Library

**Navigation:**
- Bottom tab bar (mobile): Map, Duplicates, Costs, Actions
- Minimum touch target: 44x44px
- Active state with primary color background

**Cards & Data Display:**
- Elevated cards with subtle shadows
- Cost tiles with large typography and color-coded backgrounds
- Storage treemap with distinct color segments
- Recommendations as action cards with clear savings indicators

**Forms & Controls:**
- Material Design input fields
- Toggle switches for settings
- Slider controls for Pro mode heuristic weights
- Large, accessible buttons with 44px minimum height

**Charts & Visualizations:**
- Single chart per mobile view
- Text annotations for accessibility
- "View as table" toggle option
- Color-blind safe palette throughout

**Progressive Disclosure:**
- Collapsible filters in Standard mode
- Expandable glossary in Easy mode
- Drawer overlays for detailed views

### E. Mode-Specific Adaptations

**Easy Mode:**
- Larger text and spacing
- Glossary always visible
- "What this means" explanations under charts
- Single prominent CTA button
- High contrast, simplified iconography

**Standard Mode:**
- Balanced information density
- Collapsible filter sections
- Sortable recommendation lists
- Export options (CSV, PDF, Markdown)

**Pro Mode:**
- Dense data tables
- JSON export capabilities
- Configuration overlays
- Raw data views with syntax highlighting

### F. Mobile-First Considerations

**Performance:**
- Lazy-loaded components
- Minimal animations (subtle micro-interactions only)
- Optimized for <180KB initial JS bundle

**Accessibility:**
- WCAG 2.2 AA compliance
- Large text toggle (18-20px minimum)
- High contrast mode support
- Screen reader optimized chart descriptions

**Native Feel:**
- Bottom-aligned primary actions
- Safe area insets respected
- System-appropriate haptic feedback patterns
- Swipe gestures for navigation where appropriate

## Images
No large hero images required. Use:
- Simple iconography for file types and providers
- Small provider logos (Google Drive, Dropbox, etc.)
- Chart visualizations and data representations
- Minimal illustrative icons for empty states

Focus on data visualization over decorative imagery to maintain the utility-focused experience.