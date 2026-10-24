render_static_guitar_chords <- function() {
  source("../../assets/inferno_palette.R", local = TRUE)

  instruments <- list(
    list(name = "Standard six-string", tuning = c(40, 45, 50, 55, 59, 64),
         shapes = list(D = c(-1, -1, 0, 2, 3, 2), E = c(0, 2, 2, 1, 0, 0))),
    list(name = "Jacob's five-string", tuning = c(38, 45, 52, 57, 62),
         shapes = list(D = c(0, 0, 2, 0, 0), E = c(2, 2, 4, 2, 2)))
  )
  chords <- list(
    D = list(root = 2, label = "D major", tones = "D - F# - A"),
    E = list(root = 4, label = "E major", tones = "E - G# - B")
  )
  note_names <- c("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
  degree_colors <- c(INFERNO$lineA, INFERNO$lineB, INFERNO$markerUpper)
  pitch_name <- function(midi) {
    paste0(note_names[midi %% 12 + 1], midi %/% 12 - 1)
  }
  svg_node <- function(name, ..., .children = list()) {
    htmltools::tag(name, c(list(...), .children))
  }
  text <- function(x, y, label, ...) {
    svg_node("text", x = x, y = y, `text-anchor` = "middle", ...,
             .children = list(label))
  }

  diagram <- function(instrument, key) {
    chord <- chords[[key]]
    frets <- instrument$shapes[[key]]
    sounded <- frets >= 0
    pitches <- instrument$tuning[sounded] + frets[sounded]
    stopifnot(
      length(frets) == length(instrument$tuning),
      setequal((pitches - chord$root) %% 12, c(0, 4, 7)),
      pitches[1] %% 12 == chord$root
    )
    x <- seq(52, 268, length.out = length(frets))
    nut_y <- 64
    fret_height <- 43
    label <- paste(chord$label, "on", instrument$name)
    description <- paste(
      paste0(pitch_name(instrument$tuning), ": ",
             ifelse(sounded, paste0("fret ", frets, ", ",
                                    pitch_name(instrument$tuning + pmax(frets, 0))),
                    "muted")),
      collapse = "; "
    )
    elements <- list(
      svg_node("title", .children = list(label)),
      svg_node("desc", .children = list(description))
    )
    for (fret in 0:4) {
      y <- nut_y + fret * fret_height
      elements <- c(elements, list(
        svg_node("line", x1 = x[1], x2 = tail(x, 1), y1 = y, y2 = y,
                 stroke = INFERNO$annotation, `stroke-width` = if (fret == 0) 5 else 1)
      ))
      if (fret > 0) {
        elements <- c(elements, list(
          text(25, y - fret_height / 2 + 5, fret, `font-size` = 13)
        ))
      }
    }
    for (i in seq_along(frets)) {
      elements <- c(elements, list(
        svg_node("line", x1 = x[i], x2 = x[i], y1 = nut_y,
                 y2 = nut_y + 4 * fret_height,
                 stroke = INFERNO$annotation, `stroke-width` = 2 - (i - 1) * 0.2),
        text(x[i], 280, if (sounded[i]) pitch_name(instrument$tuning[i] + frets[i]) else "-",
             `font-size` = 15, `font-weight` = "600"),
        text(x[i], 304, pitch_name(instrument$tuning[i]), `font-size` = 12)
      ))
      if (frets[i] <= 0) {
        elements <- c(elements, list(
          text(x[i], 46, if (frets[i] == 0) "O" else "X", `font-size` = 18,
               `font-weight` = "600")
        ))
      } else {
        interval <- (instrument$tuning[i] + frets[i] - chord$root) %% 12
        y <- nut_y + (frets[i] - 0.5) * fret_height
        elements <- c(elements, list(
          svg_node("circle", cx = x[i], cy = y, r = 15,
                   fill = degree_colors[match(interval, c(0, 4, 7))]),
          text(x[i], y + 4, note_names[(instrument$tuning[i] + frets[i]) %% 12 + 1],
               fill = "white", `font-size` = 12, `font-weight` = "700")
        ))
      }
    }
    htmltools::tags$section(
      class = "guitar-static-panel",
      htmltools::tags$h4(chord$label),
      htmltools::tags$p(class = "guitar-static-instrument", instrument$name),
      htmltools::tags$p(class = "guitar-static-tones", chord$tones),
      svg_node("svg", xmlns = "http://www.w3.org/2000/svg", viewBox = "0 0 320 320",
               role = "img", `aria-label` = paste(label, description, sep = ". "),
               fill = INFERNO$annotation, `font-family` = "sans-serif",
               .children = elements),
      htmltools::tags$p(class = "guitar-static-frets",
                       paste("Frets (low to high):",
                             paste(ifelse(frets < 0, "X", frets), collapse = " - ")))
    )
  }

  htmltools::tagList(
    htmltools::tags$style(htmltools::HTML(sprintf("
      .guitar-static-grid {
        display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem; margin: 1rem 0;
      }
      .guitar-static-panel {
        min-width: 0; padding: 1rem 0.5rem; border: 1px solid %s;
        border-radius: 8px; background: %s; text-align: center; color: %s;
      }
      .guitar-static-panel h4 { margin: 0; font-size: 1.3rem; }
      .guitar-static-panel p { margin: 0.3rem 0 0; }
      .guitar-static-instrument { font-weight: 600; font-size: 0.9rem; }
      .guitar-static-tones, .guitar-static-frets { font-size: 0.8rem; }
      .guitar-static-panel svg { display: block; width: 100%%; height: auto; }
      .guitar-static-guide { text-align: center; font-size: 0.8rem; }
      @media (max-width: 560px) {
        .guitar-static-grid { grid-template-columns: 1fr; }
      }
    ", INFERNO$fillBorderA, INFERNO$panelBg, INFERNO$annotation))),
    htmltools::tags$div(
      class = "guitar-static-grid",
      lapply(names(chords), function(key) {
        lapply(instruments, function(instrument) diagram(instrument, key))
      })
    ),
    htmltools::tags$p(class = "guitar-static-guide",
                     "Below each neck: sounding pitches, then open-string tuning. Numbers at left are frets.")
  )
}

#' Render the linked guitar fretboards
#'
#' @return htmltools::tagList
render_guitar_comparison <- function() {
  visual_code <- paste(readLines("guitar_visual.js", warn = FALSE), collapse = "\n")

  htmltools::tagList(
    htmltools::tags$style(htmltools::HTML("
      .guitar-comparison {
        margin: 1.5rem 0;
        padding: 1rem;
        border-radius: 8px;
      }
      .guitar-chord-controls {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.4rem;
        margin-bottom: 1rem;
      }
      .guitar-mode-controls {
        display: flex;
        justify-content: center;
        gap: 0.4rem;
        margin-bottom: 0.75rem;
      }
      .guitar-control-group {
        display: flex;
        flex-basis: 100%;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
      }
      .guitar-control-label {
        min-width: 3.2rem;
        font-size: 0.78rem;
        font-weight: 700;
        text-align: right;
        text-transform: uppercase;
      }
      .guitar-mode-button,
      .guitar-chord-button {
        min-width: 2.7rem;
        padding: 0.35rem 0.6rem;
        border: 1px solid;
        border-radius: 999px;
        background: transparent;
        font: inherit;
        cursor: pointer;
      }
      .guitar-mode-button {
        padding-right: 1rem;
        padding-left: 1rem;
        font-weight: 700;
      }
      .guitar-mode-button:hover,
      .guitar-mode-button:focus-visible,
      .guitar-mode-button[aria-pressed='true'],
      .guitar-chord-button:hover,
      .guitar-chord-button:focus-visible,
      .guitar-chord-button[aria-pressed='true'] {
        color: white !important;
        outline: none;
      }
      .guitar-fretboards {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .guitar-fretboard-panel {
        min-width: 0;
        padding: 0.75rem;
        border: 1px solid;
        border-radius: 8px;
        background: white;
      }
      .guitar-fretboard-panel h4 {
        margin: 0 0 0.1rem;
        font-size: 1rem;
        text-align: center;
      }
      .guitar-tuning {
        margin-bottom: 0.45rem;
        font-size: 1rem;
        font-weight: 600;
        text-align: center;
      }
      .guitar-fretboard {
        display: block;
        width: 100%;
        height: auto;
      }
      .guitar-note {
        cursor: pointer;
      }
      .guitar-note:focus {
        outline: none;
      }
      .guitar-note:focus .guitar-note-ring {
        stroke-width: 4;
      }
      .guitar-comparison-status {
        min-height: 1.5rem;
        margin: 0.8rem 0 0;
        font-size: 0.85rem;
        text-align: center;
      }
      .guitar-comparison-hint {
        margin: 0.2rem 0 0;
        font-size: 0.72rem;
        text-align: center;
      }
      @media (min-width: 900px) {
        .guitar-fretboards {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 480px) {
        .guitar-comparison {
          padding: 0.65rem;
        }
        .guitar-fretboard-panel {
          padding: 0.4rem;
        }
      }
    ")),
    htmltools::tags$div(
      id = "guitar-comparison",
      class = "guitar-comparison",
      htmltools::tags$div(
        class = "guitar-mode-controls",
        role = "group",
        `aria-label` = "Choose chord collection"
      ),
      htmltools::tags$div(
        class = "guitar-chord-controls",
        role = "group",
        `aria-label` = "Choose a chord"
      ),
      htmltools::tags$div(
        class = "guitar-fretboards",
        htmltools::tags$section(
          class = "guitar-fretboard-panel",
          `aria-labelledby` = "classical-guitar-heading",
          htmltools::tags$h4(id = "classical-guitar-heading", "Classical guitar"),
          htmltools::tags$div(class = "guitar-tuning", "6 strings · E2–A2–D3–G3–B3–E4"),
          htmltools::tags$svg(
            id = "classical-guitar-fretboard",
            class = "guitar-fretboard",
            role = "img",
            `aria-label` = "Six-string classical guitar fretboard"
          )
        ),
        htmltools::tags$section(
          class = "guitar-fretboard-panel",
          `aria-labelledby` = "five-string-guitar-heading",
          htmltools::tags$h4(id = "five-string-guitar-heading", "Five-string guitar"),
          htmltools::tags$div(class = "guitar-tuning", "5 strings · D2–A2–E3–A3–D4"),
          htmltools::tags$svg(
            id = "five-string-guitar-fretboard",
            class = "guitar-fretboard",
            role = "img",
            `aria-label` = "Five-string guitar fretboard"
          )
        )
      ),
      htmltools::tags$p(
        class = "guitar-comparison-status",
        `aria-live` = "polite"
      ),
      htmltools::tags$p(
        class = "guitar-comparison-hint",
        "Choose a chord, then select a played note to find the same pitch on both necks."
      )
    ),
    htmltools::tags$script(htmltools::HTML(paste0(
      visual_code,
      "\ndocument.addEventListener('DOMContentLoaded', initGuitarComparison);"
    )))
  )
}
