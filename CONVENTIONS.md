# Blog Conventions — Excellent Problem

> This file is a reference for creating or editing
> posts. Follow these rules to keep the blog aesthetic, informative, and
> coloristically consistent.

---

## 1. Project Structure

```
ExcellentProblem/
├── _quarto.yml              # Site-wide Quarto config
├── assets/
│   ├── inferno-palette.html  # JS global palette  (included in every page via _quarto.yml)
│   └── inferno_palette.R     # R  global palette  (sourced per-post)
├── posts/
│   ├── _metadata.yml         # Shared post metadata (freeze: auto, share buttons)
│   └── YYYY-MM-DD-slug/
│       ├── index.qmd         # Post content
│       ├── plot_helpers.R    # R helpers for HTML controls (when applicable)
│       ├── integral_engine.js # Shared JS engine (when post has multiple similar plots)
│       ├── plot_*.js         # Per-plot config wrappers for the shared engine
│       ├── libs.html         # Per-post CDN deps (e.g., Plotly, noUiSlider)
│       └── ...               # Data files, images, etc.
├── styles.css                # Global CSS overrides
└── share-buttons.html        # Included after every post body
```

## 2. Color System — Viridis Inferno

All data visualizations use the **viridis inferno** palette. Colors are
centralized in two mirrored files — one for JavaScript, one for R. **Never
hardcode hex color values in post files.** Always reference the global palette.

### Role-based color assignments (consistent across every plot)

| Role            | Variable (R)          | Variable (JS)         | Hex / Value                        | Used for                        |
|-----------------|-----------------------|-----------------------|------------------------------------|---------------------------------|
| Trace A (line)  | `INFERNO$lineA`       | `R.lineA`             | `#932667`                          | Primary line / function curve   |
| Trace A (fill)  | `INFERNO$fillA`       | `R.fillA`             | `rgba(147, 38, 103, 0.25)`        | Shaded area under curve         |
| Trace A (border)| `INFERNO$fillBorderA` | `R.fillBorderA`       | `rgba(147, 38, 103, 0.70)`        | Border of shaded area           |
| Trace B (line)  | `INFERNO$lineB`       | `R.lineB`             | `#dd513a`                          | Second line / bar chart         |
| Trace B (fill)  | `INFERNO$fillB`       | `R.fillB`             | `rgba(221, 81, 58, 0.50)`        | Bar fill                        |
| Marker lower    | `INFERNO$markerLower` | `R.markerLower`       | `#fca50a`                          | Lower-limit data point          |
| Marker upper    | `INFERNO$markerUpper` | `R.markerUpper`       | `#420a68`                          | Upper-limit data point          |
| Annotation      | `INFERNO$annotation`  | `R.annotation`        | `#2c3e50` (Flatly navbar navy)    | Dashed ref lines, text labels   |
| Panel bg        | `INFERNO$panelBg`     | `R.panelBg`           | `rgba(147, 38, 103, 0.04)`       | Control panel background        |
| Button          | `INFERNO$buttonBg`    | —                     | `#932667`                          | Interactive buttons              |
| Continuous      | `INFERNO$colorscale`  | `INFERNO.colorscale`  | Full inferno 0→1                   | Heatmaps, colorbars, gradients  |

### How to use

**In R chunks:**
```r
source("../../assets/inferno_palette.R")
# then use:
line = list(color = INFERNO$lineA, width = 2)
```

**In JavaScript files:**
```js
var R = window.INFERNO.roles;
// then use:
line: { color: R.lineA, width: 2 }
```

## 3. Interactive Controls

- **Sliders** (continuous ranges): Use `noUiSlider` via `create_integral_controls()` from a local `plot_helpers.R`. The slider track is styled globally in `inferno-palette.html` (solid `#932667`).
- **Typed inputs** (discrete values like years): Use standard `<input type="number">` with an "Update Plot" button. Style the panel background with `INFERNO$panelBg` and button with `INFERNO$buttonBg`.
- **Panel background**: Always `rgba(147, 38, 103, 0.04)` with `border-radius: 8px`.

## 4. Code Organization Rules

1. **No inline HTML in `.qmd` files.** All HTML controls must be generated via R helper functions in a `plot_helpers.R` file within the post directory.
2. **No inline JavaScript in `.qmd` files.** All JS logic lives in external `plot_*.js` files, inlined at render time via `render_interactive_plot()` in `plot_helpers.R`.
3. **No hardcoded colors.** R plots reference `INFERNO$...`, JS plots reference `window.INFERNO.roles.*`.
4. **One `plot_helpers.R` per post** (when interactive controls are needed). Contains functions that generate HTML controls. Shared patterns (like the noUiSlider setup) should follow the same structure.
5. **Data files** (CSV, etc.) live alongside the post's `index.qmd`.
6. **Shared JS engine pattern.** When a post has multiple interactive plots with the same boilerplate (traces, layouts, Plotly calls), extract the repeated logic into a single engine file (e.g., `integral_engine.js`) that exposes one factory function accepting a config object. Each plot then becomes a thin ~17-line config wrapper in its own `plot_*.js` file. The engine is inlined once via `render_interactive_plot()`, which tracks whether it has already been loaded using `.GlobalEnv$.integral_engine_loaded`. This avoids duplicating hundreds of lines across plot files.
7. **Per-post CDN dependencies.** Heavy libraries used only by a specific post (e.g., Plotly.js, noUiSlider) should be loaded once via a `libs.html` file in the post directory, referenced with `include-in-header: libs.html` in the post YAML. Do **not** load them in `_quarto.yml` (site-wide) or re-include them per widget.

## 5. Quarto / Rendering Notes

- `freeze: auto` caches R output based on `.qmd` file changes. It does **not** detect changes in `source()`-ed `.R` files or external `.js` files. After editing helpers or JS, **delete the freeze cache** for that post before re-rendering:
  ```
  Remove-Item -Recurse -Force _freeze/posts/<post-slug>
  Remove-Item -Recurse -Force .quarto/_freeze/posts/<post-slug>
  ```
- The site renders to `docs/` (configured in `_quarto.yml`).
- Theme is **Flatly** (`#2c3e50` navbar). Body background is soft cream `#fffef8`.

## 6. Post Frontmatter Template

```yaml
---
title: "Post Title"
author: "Aleksandra"
date: "YYYY-MM-DD"
categories: [tag1, tag2]
image: "thumb.png"
description: "One-liner summary."
title-block-banner: true
---
```

## 7. Plotly Defaults

All Plotly charts should use:
```
plot_bgcolor = "white"
paper_bgcolor = "white"
legend orientation = "h", centered below plot
```
Grids are off by default (`showgrid = FALSE`) unless the plot specifically benefits from them.
