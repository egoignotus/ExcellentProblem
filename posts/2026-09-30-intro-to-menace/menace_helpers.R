# Helper functions for MENACE interactive post

#' Create the Move 1 symmetry figure
#'
#' Shows empty board + 3 distinct first moves (corner, edge, center).
#' Corner and edge boards rotate in 90° steps to illustrate symmetry.
#'
#' @return HTML div with canvas elements for the figure
create_move1_figure <- function() {
  bead_row <- function(label, color) {
    htmltools::tags$div(
      style = "display: flex; align-items: center; gap: 8px;",
      htmltools::tags$span(
        style = paste0(
          "width: 42px; text-align: right; font-size: 10px; font-weight: 600; ",
          "color: ", color, ";"
        ),
        label
      ),
      htmltools::tags$div(
        style = "display: grid; grid-template-columns: repeat(8, 12px); gap: 4px;",
        lapply(seq_len(8), function(i) {
          htmltools::tags$span(
            style = paste0(
              "display: block; width: 12px; height: 12px; border-radius: 50%; ",
              "background: ", color, ";"
            )
          )
        })
      )
    )
  }

  htmltools::tags$div(
    id = "fig-move1",
    style = paste0(
      "display: flex; align-items: center; justify-content: center; ",
      "gap: 16px; flex-wrap: wrap; margin: 24px 0; padding: 20px;"
    ),
    # Empty board
    htmltools::tags$div(
      style = "text-align: center;",
      htmltools::tags$canvas(id = "fig-move1-empty", width = "120", height = "120",
        style = "border: 2px solid #420a68; border-radius: 6px; background: white;"),
      htmltools::tags$div(style = "font-size: 11px; color: #888; margin-top: 4px;", "Empty board")
    ),
    # Arrow
    htmltools::tags$div(
      style = "font-size: 28px; color: #932667; font-weight: bold; padding: 0 4px;",
      htmltools::HTML("&#8594;")
    ),
    # Three distinct opening choices
    htmltools::tags$div(
      id = "fig-move1-options",
      style = paste0(
        "display: grid; grid-template-columns: repeat(3, minmax(0, 120px)); ",
        "justify-content: center; gap: 8px; width: min(100%, 376px);"
      ),
      # Corner (rotates)
      htmltools::tags$div(
        style = "text-align: center; min-width: 0;",
        htmltools::tags$canvas(id = "fig-move1-corner", width = "120", height = "120",
          style = "border: 2px solid #420a68; border-radius: 6px; background: white; max-width: 100%;"),
        htmltools::tags$div(style = "font-size: 11px; color: #888; margin-top: 4px;",
          "Corner ", htmltools::tags$span(style = "color:#932667;", "(4 equivalent)"))
      ),
      # Edge (rotates)
      htmltools::tags$div(
        style = "text-align: center; min-width: 0;",
        htmltools::tags$canvas(id = "fig-move1-edge", width = "120", height = "120",
          style = "border: 2px solid #420a68; border-radius: 6px; background: white; max-width: 100%;"),
        htmltools::tags$div(style = "font-size: 11px; color: #888; margin-top: 4px;",
          "Edge ", htmltools::tags$span(style = "color:#932667;", "(4 equivalent)"))
      ),
      # Center (static)
      htmltools::tags$div(
        style = "text-align: center; min-width: 0;",
        htmltools::tags$canvas(id = "fig-move1-center", width = "120", height = "120",
          style = "border: 2px solid #420a68; border-radius: 6px; background: white; max-width: 100%;"),
        htmltools::tags$div(style = "font-size: 11px; color: #888; margin-top: 4px;",
          "Center ", htmltools::tags$span(style = "color:#932667;", "(1 unique)"))
      )
    ),
    # Arrow
    htmltools::tags$div(
      style = paste0(
        "flex-basis: 100%; text-align: center; font-size: 28px; color: #932667; ",
        "font-weight: bold; height: 28px; line-height: 28px;"
      ),
      htmltools::HTML("&#8595;")
    ),
    # First matchbox: 8 beads for each of the 3 distinct choices
    htmltools::tags$div(
      role = "img",
      `aria-label` = "First matchbox with 24 beads: 8 in each of 3 colors",
      style = paste0(
        "min-width: 214px; padding: 12px 14px; border: 2px solid #420a68; ",
        "border-radius: 6px; background: #fffaf2; text-align: center;"
      ),
      htmltools::tags$div(
        style = "display: flex; flex-direction: column; align-items: center; gap: 7px;",
        bead_row("Corner", "#5B1A78"),
        bead_row("Edge", "#E69F00"),
        bead_row("Centre", "#008C83")
      ),
      htmltools::tags$div(
        style = "font-size: 11px; color: #888; margin-top: 8px;",
        "First matchbox ",
        htmltools::tags$span(style = "color:#932667;", "(24 beads)")
      )
    )
  )
}

#' Render the move 1 figure with its JS animation
#'
#' @return htmltools::tagList
render_move1_figure <- function() {
  fig_code <- paste(readLines("fig_move1.js", warn = FALSE), collapse = "\n")
  htmltools::tagList(
    create_move1_figure(),
    htmltools::tags$script(htmltools::HTML(paste0(
      fig_code,
      "\ndocument.addEventListener('DOMContentLoaded', function() { initMove1Figure(); });"
    )))
  )
}

#' Create the Move 2 orbit figure
#'
#' Three boards after 2 moves, empty cells colored by symmetry orbit.
#' Scenario A: X corner + O edge → 7 distinct orbits (no symmetry).
#' Scenario B: X edge + O center → 4 orbits (h-flip symmetry).
#' Scenario C: X corner + O opposite corner → 4 orbits (mirror symmetry).
#'
#' @return HTML div with three canvases
create_move2_figure <- function() {
  board_style <- paste0(
    "border: 2px solid #420a68; border-radius: 6px; background: white;"
  )
  htmltools::tags$div(
    id = "fig-move2",
    style = paste0(
      "display: grid; grid-template-columns: repeat(3, minmax(0, 140px)); ",
      "align-items: start; justify-content: center; gap: 12px; ",
      "margin: 24px 0; padding: 20px 0;"
    ),
    # Scenario A
    htmltools::tags$div(
      style = "text-align: center; min-width: 0;",
      htmltools::tags$canvas(id = "fig-move2-a", width = "140", height = "140",
        style = paste0(board_style, " max-width: 100%;")),
      htmltools::tags$div(style = "font-size: 12px; color: #888; margin-top: 6px;",
        htmltools::tags$b("7"), " distinct moves"),
      htmltools::tags$div(style = "font-size: 11px; color: #aaa;",
        "no symmetry left (#6)")
    ),
    # Scenario B
    htmltools::tags$div(
      style = "text-align: center; min-width: 0;",
      htmltools::tags$canvas(id = "fig-move2-b", width = "140", height = "140",
        style = paste0(board_style, " max-width: 100%;")),
      htmltools::tags$div(style = "font-size: 12px; color: #888; margin-top: 6px;",
        htmltools::tags$b("4"), " distinct moves"),
      htmltools::tags$div(style = "font-size: 11px; color: #aaa;",
        "mirror symmetry (#10)")
    ),
    # Scenario C: collection position #12
    htmltools::tags$div(
      style = "text-align: center; min-width: 0;",
      htmltools::tags$canvas(id = "fig-move2-c", width = "140", height = "140",
        style = paste0(board_style, " max-width: 100%;")),
      htmltools::tags$div(style = "font-size: 12px; color: #888; margin-top: 6px;",
        htmltools::tags$b("4"), " distinct moves"),
      htmltools::tags$div(style = "font-size: 11px; color: #aaa;",
        "mirror symmetry (#12)")
    )
  )
}

#' Render the move 2 orbit figure with its JS
#'
#' @return htmltools::tagList
render_move2_figure <- function() {
  fig_code <- paste(readLines("fig_move2.js", warn = FALSE), collapse = "\n")
  htmltools::tagList(
    create_move2_figure(),
    htmltools::tags$script(htmltools::HTML(paste0(
      fig_code,
      "\ndocument.addEventListener('DOMContentLoaded', function() { initMove2Figure(); });"
    )))
  )
}

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
  primary_btn <- paste0(
    btn_style,
    "padding: 11px 24px; font-size: 16px; background: #932667; color: white;"
  )
  secondary_btn <- paste0(btn_style, "background: #420a68; color: white;")
  danger_btn <- paste0(btn_style, "background: #dd513a; color: white;")
  parameter_input <- function(id, label, value) {
    htmltools::tags$label(
      style = "display: grid; gap: 3px; font-size: 11px; color: #666; min-width: 64px;",
      label,
      htmltools::tags$input(
        id = id, type = "number", min = "0", step = "1", value = value,
        style = paste0(
          "width: 64px; padding: 5px 6px; border: 1px solid #bbb; ",
          "border-radius: 4px; font-size: 13px;"
        )
      )
    )
  }
  
  htmltools::tags$div(
    style = paste0(
      "margin-bottom: 20px; padding: 15px; ",
      "background-color: ", bg, "; border-radius: 8px;"
    ),
    # Button row
    htmltools::tags$div(
      style = paste0(
        "display: flex; align-items: center; gap: 8px; flex-wrap: wrap; ",
        "margin-bottom: 12px;"
      ),
      htmltools::tags$button(id = "menace-btn-new", style = primary_btn, "New Game"),
      htmltools::tags$button(id = "menace-btn-train50", style = secondary_btn, "Train 50"),
      htmltools::tags$button(id = "menace-btn-train200", style = secondary_btn, "Train 200"),
      htmltools::tags$button(id = "menace-btn-train500", style = secondary_btn, "Train 500"),
      htmltools::tags$button(id = "menace-btn-reset", style = danger_btn, "Reset")
    ),
    htmltools::tags$div(
      style = paste0(
        "display: flex; gap: 10px; flex-wrap: wrap; align-items: end; ",
        "margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #ddd;"
      ),
      parameter_input("menace-param-initial", "Initial", 8),
      parameter_input("menace-param-win", "Win +", 3),
      parameter_input("menace-param-draw", "Draw +", 1),
      parameter_input("menace-param-loss", "Loss -", 1),
      parameter_input("menace-param-minimum", "Minimum", 1),
      htmltools::tags$span(
        style = "font-size: 11px; color: #777; padding-bottom: 6px;",
        "Applied when Reset is pressed"
      )
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

#' Create the game board above the matchbox views
#' 
#' @return HTML div with canvas board and matchbox container
create_menace_board <- function() {
  htmltools::tags$div(
    style = "display: flex; flex-direction: column; gap: 24px; align-items: center; margin: 20px 0;",
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
    # Matchbox and probability row
    htmltools::tags$div(
      style = paste0(
        "display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; ",
        "align-items: flex-start; width: 100%;"
      ),
      # Matchbox view
      htmltools::tags$div(
        style = "width: min(100%, 280px); flex: 0 1 280px;",
        htmltools::tags$div(
          style = "text-align: center; font-size: 13px; color: #888; margin-bottom: 6px;",
          "Current Matchbox (bead counts)"
        ),
        htmltools::tags$div(id = "menace-matchbox")
      ),
      # Probability waffle chart
      htmltools::tags$div(
        style = "width: min(100%, 280px); flex: 0 1 280px;",
        htmltools::tags$div(
          style = "text-align: center; font-size: 13px; color: #888; margin-bottom: 6px;",
          "Move Probability (area)"
        ),
        htmltools::tags$div(
          id = "menace-probability",
          style = "width: 100%; aspect-ratio: 1;"
        )
      )
    )
  )
}

#' Create the Move 2 zoomed matchbox view (12 boards)
#'
#' @return HTML div showing all 12 canonical board positions for MENACE's 2nd move
create_menace_move2 <- function() {
  htmltools::tags$div(id = "menace-move2", style = "margin: 24px 0;")
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
    style = "margin: 24px 0;",
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

#' Create the bead reinforcement diagram
#'
#' @return HTML div showing bead updates after each game outcome
create_reinforcement_figure <- function() {
  bead_group <- function(count) {
    htmltools::tags$div(
      style = paste0(
        "display: grid; grid-template-columns: repeat(4, 12px); gap: 4px; ",
        "justify-content: center; align-content: center; min-height: 44px;"
      ),
      lapply(seq_len(count), function(i) {
        htmltools::tags$span(
          style = paste0(
            "display: block; width: 12px; height: 12px; border-radius: 50%; ",
            "background: #5B1A78;"
          )
        )
      })
    )
  }

  bead_box <- function(count, label) {
    htmltools::tags$div(
      style = paste0(
        "width: 88px; min-height: 82px; padding: 9px 6px 7px; ",
        "border: 2px solid #420a68; border-radius: 6px; background: #fffaf2; ",
        "display: flex; flex-direction: column; justify-content: center; align-items: center;"
      ),
      bead_group(count),
      htmltools::tags$span(
        style = "font-size: 11px; color: #777; margin-top: 5px;",
        label
      )
    )
  }

  outcome_branch <- function(outcome, delta, after, accent) {
    htmltools::tags$div(
      style = "display: flex; flex-direction: column; align-items: center; min-width: 0;",
      htmltools::tags$div(
        style = paste0(
          "text-align: center; color: ", accent, "; font-size: 12px; ",
          "font-weight: 700; line-height: 1.15; margin-bottom: 7px;"
        ),
        htmltools::tags$div(style = "font-size: 25px; line-height: 24px;", htmltools::HTML("&#8595;")),
        htmltools::tags$div(outcome),
        htmltools::tags$div(style = "font-size: 11px;", delta)
      ),
      bead_box(after, paste(after, "beads"))
    )
  }

  htmltools::tags$div(
    role = "img",
    `aria-label` = paste0(
      "An initial matchbox with 8 beads branches to 11 beads after a win, ",
      "9 after a draw, and 7 after a loss"
    ),
    style = "max-width: 420px; margin: 24px auto; padding: 0 4px;",
    htmltools::tags$div(
      style = "display: flex; flex-direction: column; align-items: center;",
      bead_box(8, "Initial: 8 beads")
    ),
    htmltools::tags$div(
      style = paste0(
        "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); ",
        "gap: 10px; margin-top: 4px;"
      ),
      outcome_branch("WIN", "+3", 11, "#932667"),
      outcome_branch("DRAW", "+1", 9, "#E69F00"),
      outcome_branch("LOSS", "-1", 7, "#D94F3D")
    )
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

#' Render the static MENACE figures that use canonical board enumeration
#'
#' @param collection_html HTML from create_menace_collection()
#' @return htmltools::tagList
render_menace_static_figures <- function(collection_html) {
  engine_code <- paste(readLines("menace_engine.js", warn = FALSE), collapse = "\n")
  plot_code <- paste(readLines("plot_menace.js", warn = FALSE), collapse = "\n")

  htmltools::tagList(
    htmltools::tags$script(htmltools::HTML(engine_code)),
    collection_html,
    htmltools::tags$script(htmltools::HTML(paste0(
      plot_code,
      "\ndocument.addEventListener('DOMContentLoaded', function() { initMenacePlot(); });"
    )))
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
