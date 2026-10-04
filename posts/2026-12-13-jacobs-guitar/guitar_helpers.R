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
