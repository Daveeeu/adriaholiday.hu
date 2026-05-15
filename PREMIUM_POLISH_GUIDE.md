# Premium Polish Guidelines

## Section Spacing
- All major sections: `py-40`
- Container max-width: `max-w-[1500px]`
- Container padding: `px-8 md:px-12 lg:px-20`

## Typography Scale
- Hero titles: `clamp(3rem, 7vw, 5rem)`, weight: 700, letterSpacing: "-0.035em"
- Section titles: `clamp(2rem, 4vw, 3rem)`, weight: 600, letterSpacing: "-0.02em"
- Card titles: `1.375rem` - `1.75rem`, weight: 700, letterSpacing: "-0.025em"
- Body text: `1rem` - `1.0625rem`, weight: 400-500
- Small text: `0.875rem`, weight: 500

## Button Styles
- Primary CTA: `rounded-2xl`, `px-10 py-4`, gradient `from-[#00c389] to-[#16b8ff]`
- Secondary: `rounded-2xl`, `px-8 py-3.5`, border-2
- Hover scale: `1.03`, shadow increase
- Transition: `type: "spring"`, `stiffness: 400`, `damping: 30`

## Card Styles
- Border radius: `rounded-[24px]` to `rounded-[32px]`
- Background: `bg-white/80` to `bg-white/90` with `backdrop-blur-sm`
- Shadows: `shadow-[0_2px_16px_rgba(0,0,0,0.06)]`
- Hover: `shadow-[0_8px_32px_rgba(0,195,128,0.12)]`
- Borders: `border border-gray-100/70` to `border-white/60`

## Color Palette
- Primary gradient: `from-[#00c389] to-[#16b8ff]`
- Secondary gradient: `from-[#16b8ff] to-[#0ea5e9]`
- Tertiary gradient: `from-[#0ea5e9] to-[#00c389]`
- Text: gray-900 (headings), gray-700 (body), gray-600 (supporting)
- Background: white, #f8fafc (subtle sections)

## Animations
- Scroll reveal: `initial: { opacity: 0, y: 30 }`, `animate: { opacity: 1, y: 0 }`
- Duration: `0.6` - `1s`
- Easing: `[0.16, 1, 0.3, 1]` for smooth premium feel
- Delays: Stagger by `0.1` - `0.15s` for lists

## Image Quality
- All images: `w=1200&q=90` minimum
- Hero/featured: `w=1400&q=95`
- Object fit: `cover`
- Aspect ratios maintained with containers

## Icons
- Small: `w-3.5 h-3.5`, `strokeWidth={2}`
- Medium: `w-5 h-5`, `strokeWidth={2}`
- Large: `w-7 h-7`, `strokeWidth={1.5}`
- Consistent color: `text-[#00c389]` or gradient backgrounds

## Hover States
- All interactive: slight `y: -4` to `y: -8`
- Scale: `1.02` to `1.04` (subtle)
- Shadow increase
- Smooth spring transitions
- Duration: 0.3-0.5s

## Mobile Responsive
- Stack cards on mobile
- Reduce padding on small screens
- Typography scales with clamp()
- Touch-friendly sizes (min 44px)
- Simplified animations on mobile

## Glassmorphism
- Background: `white/80` to `white/95`
- Backdrop: `backdrop-blur-xl` to `backdrop-blur-3xl`
- Borders: `white/40` to `white/70`
- Subtle gradient overlays for depth

## Continuous Flow
- Sections blend with subtle gradient backgrounds
- No harsh color changes
- Consistent vertical rhythm
- Smooth transitions between themes
- Unified color story throughout
