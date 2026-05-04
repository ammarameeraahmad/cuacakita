---
name: Village Elder Aesthetic
colors:
  surface: '#f7f9ff'
  surface-dim: '#d7dae0'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f9'
  surface-container: '#ebeef4'
  surface-container-high: '#e6e8ee'
  surface-container-highest: '#e0e2e8'
  on-surface: '#181c20'
  on-surface-variant: '#404850'
  inverse-surface: '#2d3135'
  inverse-on-surface: '#eef1f6'
  outline: '#707881'
  outline-variant: '#bfc7d1'
  surface-tint: '#006399'
  primary: '#005d90'
  on-primary: '#ffffff'
  primary-container: '#0077b6'
  on-primary-container: '#f3f7ff'
  inverse-primary: '#94ccff'
  secondary: '#006e26'
  on-secondary: '#ffffff'
  secondary-container: '#6fff83'
  on-secondary-container: '#007529'
  tertiary: '#864a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a95f00'
  on-tertiary-container: '#fff6f1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#94ccff'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#004b74'
  secondary-fixed: '#6fff83'
  secondary-fixed-dim: '#4fe16a'
  on-secondary-fixed: '#002106'
  on-secondary-fixed-variant: '#00531a'
  tertiary-fixed: '#ffdcc0'
  tertiary-fixed-dim: '#ffb877'
  on-tertiary-fixed: '#2e1600'
  on-tertiary-fixed-variant: '#6c3a00'
  background: '#f7f9ff'
  on-background: '#181c20'
  surface-variant: '#e0e2e8'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 30px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 20px
---

## Brand & Style

This design system is built on the persona of a "Wise Village Elder"—someone who is dependable, clear, and deeply connected to the land. The brand personality avoids all "techy" jargon and sleek corporate aesthetics in favor of a **Tactile and High-Contrast** style. It prioritizes legibility and physical metaphors to bridge the gap for users with low digital literacy.

The emotional response should be one of "safe guidance." By using soft cream backgrounds instead of stark white or cold dark modes, the UI feels like sun-drenched paper or a community gathering space. The interface is intentionally "chunky" and friendly, using large touch targets and familiar cultural motifs to ensure the user feels empowered rather than intimidated.

## Colors

The palette is rooted in the Indonesian landscape: the deep blue of the sky and the lush green of the paddy fields. 

- **Primary (Sky Blue):** Used for essential navigation and weather-related highlights.
- **Secondary (Fresh Green):** Represents growth and safety; used for "good" planting conditions.
- **Warning/Danger:** Used sparingly for extreme weather alerts, utilizing warm amber and coral to ensure visibility without causing undue panic.
- **Background (Soft Cream):** Reduces glare and provides a warm, organic base that feels more traditional and less "electronic" than pure white or gray.
- **Contrast:** Text colors are kept dark (Deep Navy) against light backgrounds to exceed WCAG AA standards for outdoor readability.

## Typography

The design system utilizes **Plus Jakarta Sans** for its friendly, rounded terminals and high legibility. 

- **Scale:** All font sizes are intentionally oversized. The minimum body size is 18px to accommodate older users or those viewing screens in direct sunlight.
- **Weight:** Medium and Bold weights are used almost exclusively. Thin or Light weights are prohibited as they disappear under harsh glare.
- **Line Height:** Generous leading (line height) is applied to prevent the "wall of text" effect, making Bahasa Indonesia instructions easier to parse.

## Layout & Spacing

This design system uses a **Fluid Grid** model optimized for single-column mobile views, which is the primary device for the target audience.

- **Rhythm:** An 8px base grid ensures consistent alignment. 
- **Margins:** Large 20px side margins prevent interactive elements from being too close to the screen edges where thumb-reach or screen protectors might interfere.
- **Touch Targets:** A minimum height of 56px is required for all interactive rows and buttons to ensure ease of use for labor-worn hands.
- **Whitespace:** Elements are spaced liberally to clearly separate different "thoughts" or weather metrics.

## Elevation & Depth

To maintain a friendly and approachable feel, this design system avoids complex 3D effects. Depth is communicated through **Ambient Shadows**.

- **Cards:** Use a very soft, diffused shadow (0px offset, 12px blur, 5% opacity of the Primary color) to make cards appear as if they are gently floating on the cream background.
- **Layering:** Only two levels of depth are permitted: the background and the card/button level. This simplicity prevents users from getting "lost" in a stack of windows.
- **Interaction:** When pressed, buttons should lose their shadow and "sink" into the page, providing clear tactile feedback that the action was successful.

## Shapes

The shape language is defined by **High Roundedness**. Sharp corners are perceived as "aggressive" or "technical," so every corner is softened.

- **Cards:** 16px (rounded-lg) radius to create a container that feels safe and organic.
- **Buttons:** Pill-shaped (fully rounded) to maximize the "button-ness" of the element, making it obvious that it is meant to be pressed.
- **Input Fields:** Softly rounded corners (8px) to match the card aesthetic while maintaining enough structure to look like a form.

## Components

**Buttons**
Buttons are high-contrast, pill-shaped, and always include an icon + text label. The Primary button uses Sky Blue with White text. The Secondary button (for less frequent actions) uses a thick Blue border with Blue text.

**Status Cards**
Weather data is housed in cards with large emojis (e.g., ☀️, 🌧️) on the left. Data is presented in a "Headline + Label" format (e.g., "30°C" above "Suhu Panas").

**Selection Chips**
Large, rounded rectangles used for selecting crops (Padi, Jagung, Cabai). These must feature a flat illustration of the crop to aid users with limited literacy.

**Lists**
Lists should be separated by clear gutters rather than thin lines. Each list item is its own "mini-card" to make the clickable area obvious.

**Progress Indicators (Rain Chance)**
Instead of abstract percentages alone, use a "Water Bucket" or "Rain Gauge" visual that fills up with the Secondary Green color.

**Iconography & Illustrations**
Icons are thick-stroked and friendly. Use flat illustrations of Indonesian farmers wearing 'Caping' (conical hats) and local landmarks to build trust and cultural relevance. Simple Bahasa Indonesia labels must accompany every icon.