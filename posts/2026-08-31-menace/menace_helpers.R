# Helper functions for MENACE interactive post

#' Create the MENACE control panel with buttons
#' 
#' @return HTML div with game controls
create_menace_controls <- function() {
  bg <- "rgba(147, 38, 103, 0.04)"
  btn_style <- paste0(
    "padding: 8px 16px; border: none; border-radius: 6px; ",
    "cursor: pointer; font-size: 14px; font-weight: 600; ",
    "transition: opacity 0.2s;"
  )
  primary_btn <- paste0(btn_style, "background: #932667; color: white;")
  secondary_btn <- paste0(btn_style, "background: #420a68; color: white;")
  danger_btn <- paste0(btn_style, "background: #dd513a; color: white;")
  
  htmltools::tags$div(
    style = paste0(
      "margin-bottom: 20px; padding: 15px; ",
      "background-color: ", bg, "; border-radius: 8px;"
    ),
    # Button row
    htmltools::tags$div(
      style = "display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;",
      htmltools::tags$button(id = "menace-btn-new", style = primary_btn, "New Game"),
      htmltools::tags$button(id = "menace-btn-train50", style = secondary_btn, "Train 50"),
      htmltools::tags$button(id = "menace-btn-train200", style = secondary_btn, "Train 200"),
      htmltools::tags$button(id = "menace-btn-train500", style = secondary_btn, "Train 500"),
      htmltools::tags$button(id = "menace-btn-reset", style = danger_btn, "Reset")
    ),
    # Status line
    htmltools::tags$div(
      id = "menace-status",
      style = "font-weight: bold; margin-bottom: 8px; min-height: 1.5em;"
    ),
    # Stats line
    htmltools::tags$div(
      id = "menace-stats",
      style = "font-size: 13px; color: #666;"
    )
  )
}

#' Create the game board + matchbox side-by-side layout
#' 
#' @return HTML div with canvas board and matchbox container
create_menace_board <- function() {
  htmltools::tags$div(
    style = "display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; margin: 20px 0;",
    # Board (canvas)
    htmltools::tags$div(
      style = "flex-shrink: 0;",
      htmltools::tags$div(
        style = "text-align: center; font-size: 13px; color: #888; margin-bottom: 6px;",
        "Game Board"
      ),
      htmltools::tags$canvas(
        id = "menace-board",
        style = paste0(
          "width: 240px; height: 240px; ",
          "border: 2px solid #420a68; border-radius: 8px; ",
          "background: white;"
        )
      )
    ),
    # Matchbox view
    htmltools::tags$div(
      style = "min-width: 200px; flex: 0 1 280px;",
      htmltools::tags$div(
        style = "text-align: center; font-size: 13px; color: #888; margin-bottom: 6px;",
        "Current Matchbox (bead counts)"
      ),
      htmltools::tags$div(id = "menace-matchbox")
    )
  )
}

#' Create the Move 2 zoomed matchbox view (5 boards)
#'
#' @return HTML div showing all 5 canonical board positions for MENACE's 2nd move
create_menace_move2 <- function() {
  htmltools::tags$div(
    style = paste0(
      "margin: 24px 0; padding: 20px; ",
      "background: linear-gradient(to bottom, #fafafa, #f0f0f0); ",
      "border-radius: 12px; border: 1px solid #e0e0e0;"
    ),
    htmltools::tags$div(
      style = paste0(
        "text-align: center; font-size: 14px; color: #555; ",
        "margin-bottom: 14px; font-weight: 600;"
      ),
      "Move 2 \u2014 MENACE\u2019s 5 Matchboxes"
    ),
    htmltools::tags$div(
      style = "text-align: center; font-size: 12px; color: #888; margin-bottom: 16px;",
      "All distinct board positions (up to symmetry) when it\u2019s MENACE\u2019s 2nd turn. ",
      "Board has 1\u00d7\u2715 and 1\u00d7\u25cb."
    ),
    htmltools::tags$div(id = "menace-move2")
  )
}

#' Create the Move 3 zoomed matchbox view (12 boards)
#'
#' @return HTML div showing all 12 canonical board positions for MENACE's 3rd move
create_menace_move3 <- function() {
  htmltools::tags$div(
    style = paste0(
      "margin: 24px 0; padding: 20px; ",
      "background: linear-gradient(to bottom, #fafafa, #f0f0f0); ",
      "border-radius: 12px; border: 1px solid #e0e0e0;"
    ),
    htmltools::tags$div(
      style = paste0(
        "text-align: center; font-size: 14px; color: #555; ",
        "margin-bottom: 14px; font-weight: 600;"
      ),
      "Move 3 \u2014 MENACE\u2019s 12 Matchboxes"
    ),
    htmltools::tags$div(
      style = "text-align: center; font-size: 12px; color: #888; margin-bottom: 16px;",
      "All distinct board positions (up to symmetry) when it\u2019s MENACE\u2019s 3rd turn. ",
      "Board has 2\u00d7\u2715 and 2\u00d7\u25cb."
    ),
    htmltools::tags$div(id = "menace-move3")
  )
}

#' Create the matchbox collection display (Wikipedia-style visual)
#'
#' @return HTML div container for the matchbox collection
create_menace_collection <- function() {
  htmltools::tags$div(
    style = paste0(
      "margin: 24px 0; padding: 20px; ",
      "background: linear-gradient(to bottom, #fafafa, #f0f0f0); ",
      "border-radius: 12px; border: 1px solid #e0e0e0;"
    ),
    htmltools::tags$div(
      style = paste0(
        "text-align: center; font-size: 14px; color: #555; ",
        "margin-bottom: 14px; font-weight: 600;"
      ),
      "MENACE\u2019s Matchbox Collection"
    ),
    htmltools::tags$div(id = "menace-collection")
  )
}

#' Create the learning curve plot container
#' 
#' @return HTML div for Plotly chart
create_menace_curve <- function() {
  htmltools::tags$div(
    htmltools::tags$div(
      id = "menace-curve",
      style = "width: 100%; height: min(350px, 55vw);"
    )
  )
}

#' Render the full MENACE interactive section
#'
#' Inlines the engine + plot JS and wires up DOMContentLoaded.
#'
#' @param controls_html    HTML from create_menace_controls()
#' @param board_html       HTML from create_menace_board()
#' @param curve_html       HTML from create_menace_curve()
#' @param collection_html  HTML from create_menace_collection()
#' @return htmltools::tagList
render_menace_plot <- function(controls_html, board_html, curve_html,
                               collection_html = NULL,
                               move2_html = NULL) {
  engine_code <- paste(readLines("menace_engine.js", warn = FALSE), collapse = "\n")
  plot_code   <- paste(readLines("plot_menace.js", warn = FALSE), collapse = "\n")
  
  htmltools::tagList(
    htmltools::tags$script(htmltools::HTML(engine_code)),
    if (!is.null(move2_html)) move2_html,
    if (!is.null(collection_html)) collection_html,
    controls_html,
    board_html,
    curve_html,
    htmltools::tags$script(htmltools::HTML(paste0(
      plot_code,
      "\ndocument.addEventListener('DOMContentLoaded', function() { initMenacePlot(); });"
    )))
  )
}
