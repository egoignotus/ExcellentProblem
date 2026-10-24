#' Render the G-A-F guitar chord progression
#'
#' @return htmltools::tagList
render_guitar_progression <- function() {
  visual_code <- paste(readLines("guitar_progression_visual.js", warn = FALSE), collapse = "\n")

  htmltools::tagList(
    htmltools::tags$div(
      id = "guitar-progression",
      class = "guitar-comparison",
      htmltools::tags$div(
        class = "guitar-chord-controls",
        role = "group",
        `aria-label` = "Choose a root and chord type"
      ),
      htmltools::tags$div(
        class = "guitar-fretboards",
        htmltools::tags$section(
          class = "guitar-fretboard-panel",
          `aria-labelledby` = "progression-classical-guitar-heading",
          htmltools::tags$h4(
            id = "progression-classical-guitar-heading",
            "Classical guitar"
          ),
          htmltools::tags$div(
            class = "guitar-tuning",
            "6 strings · E2–A2–D3–G3–B3–E4"
          ),
          htmltools::tags$svg(
            id = "progression-classical-guitar-fretboard",
            class = "guitar-fretboard",
            role = "img",
            `aria-label` = "Six-string classical guitar fretboard"
          )
        ),
        htmltools::tags$section(
          class = "guitar-fretboard-panel",
          `aria-labelledby` = "progression-five-string-guitar-heading",
          htmltools::tags$h4(
            id = "progression-five-string-guitar-heading",
            "Five-string guitar"
          ),
          htmltools::tags$div(
            class = "guitar-tuning",
            "5 strings · D2–A2–E3–A3–D4"
          ),
          htmltools::tags$svg(
            id = "progression-five-string-guitar-fretboard",
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
        "Move through G–A–F, choose a chord type, then select a played note."
      )
    ),
    htmltools::tags$script(htmltools::HTML(paste0(
      visual_code,
      "\ndocument.addEventListener('DOMContentLoaded', initGuitarProgression);"
    )))
  )
}
