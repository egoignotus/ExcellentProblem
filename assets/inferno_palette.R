# =============================================================
# Viridis Inferno Palette — R Color System
# Mirror of assets/inferno-palette.html (JS side)
# Source this file in any R chunk: source("../../assets/inferno_palette.R")
# =============================================================

INFERNO <- list(
  # 11 discrete stops sampled from viridis inferno (0.0 -> 1.0)
  palette = c(
    "#000004", "#1b0c41", "#420a68", "#6a176e", "#932667",
    "#bb3754", "#dd513a", "#f37819", "#fca50a", "#f6d746", "#fcffa4"
  ),

  # Role-based colors — identical across every plot
  lineA       = "#932667",                          # first trace / function curve
  fillA       = "rgba(147, 38, 103, 0.25)",         # shaded area under curve
  fillBorderA = "rgba(147, 38, 103, 0.70)",         # border of shaded area
  lineB       = "#dd513a",                          # second trace / bar
  fillB       = "rgba(221, 81, 58, 0.50)",          # bar fill
  markerLower = "#fca50a",                          # lower-limit marker (amber)
  markerUpper = "#420a68",                          # upper-limit marker (deep purple)
  annotation  = "#2c3e50",                          # flatly banner — dashed lines, labels
  panelBg     = "rgba(147, 38, 103, 0.04)",         # control-panel background tint
  buttonBg    = "#932667",                          # interactive button background

  # Plotly-compatible colorscale for continuous variables
  colorscale = list(
    c(0.0, "#000004"), c(0.1, "#1b0c41"), c(0.2, "#420a68"),
    c(0.3, "#6a176e"), c(0.4, "#932667"), c(0.5, "#bb3754"),
    c(0.6, "#dd513a"), c(0.7, "#f37819"), c(0.8, "#fca50a"),
    c(0.9, "#f6d746"), c(1.0, "#fcffa4")
  )
)

# Utility: get hex color at position t in [0, 1]
inferno_at <- function(t) {
  idx <- round(pmax(0, pmin(1, t)) * (length(INFERNO$palette) - 1)) + 1
  INFERNO$palette[idx]
}

# Utility: hex to rgba string
inferno_rgba <- function(hex, alpha = 1) {
  rgb <- col2rgb(hex)
  sprintf("rgba(%d, %d, %d, %s)", rgb[1], rgb[2], rgb[3], alpha)
}
