# Helper functions for probability interactive visuals

source("../../assets/inferno_palette.R")

#' Create slider controls for the independent-events widget
#'
#' @param instance  String ID suffix, e.g. "indep"
#' @param default_pA Default P(A) value (0–1)
#' @param default_pB Default P(B) value (0–1)
#' @return htmltools tagList with two range sliders and readouts
create_independent_controls <- function(instance,
                                        default_pA = 0.50,
                                        default_pB = 0.40) {
  panel_bg <- INFERNO$panelBg

  make_slider_row <- function(label, id, default_val) {
    htmltools::tags$div(
      style = "display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;",
      htmltools::tags$label(
        style = "font-weight: bold; min-width: 42px;",
        paste0(label, ":")
      ),
      htmltools::tags$input(
        type  = "range",
        id    = id,
        min   = 0,
        max   = 1,
        step  = 0.01,
        value = default_val,
        style = "flex: 1; accent-color: #932667;"
      ),
      htmltools::tags$span(
        id    = paste0(id, "-val"),
        style = paste0("font-weight: bold; min-width: 40px; color: ", INFERNO$lineA, ";"),
        format(default_val, nsmall = 2)
      )
    )
  }

  htmltools::tags$div(
    style = paste0(
      "margin-bottom: 20px; padding: 15px; ",
      "background-color: ", panel_bg, "; border-radius: 8px;"
    ),
    make_slider_row("P(\U0001F6B2)", paste0("sliderPA-", instance), default_pA),
    make_slider_row("P(\U0001F998)", paste0("sliderPB-", instance), default_pB)
  )
}

#' Create canvas container for the independent-events widget
#'
#' @param instance  String ID suffix (must match controls)
#' @return htmltools tag with a responsive canvas
create_independent_container <- function(instance) {
  htmltools::tags$div(
    style = "padding: 8px 0;",
    htmltools::tags$canvas(
      id    = paste0("indep-canvas-", instance),
      style = "width: 100%; display: block;"
    )
  )
}

#' Inline engine JS (once) and wire up an independent-events instance
#'
#' @param js_file        Path to independent_events.js
#' @param instance       String ID suffix
#' @param controls_html  Output of create_independent_controls()
#' @param container_html Output of create_independent_container()
#' @return htmltools tagList
render_independent_plot <- function(js_file, instance, controls_html, container_html) {
  engine_tag <- NULL
  if (!isTRUE(.GlobalEnv$.indep_events_engine_loaded)) {
    js_code    <- paste(readLines(js_file, warn = FALSE), collapse = "\n")
    engine_tag <- htmltools::tags$script(htmltools::HTML(js_code))
    .GlobalEnv$.indep_events_engine_loaded <- TRUE
  }

  init_script <- sprintf(
    'document.addEventListener("DOMContentLoaded", function () {
  window.IndependentEvents.create({
    canvasId:  "indep-canvas-%s",
    sliderXId: "sliderPA-%s",
    sliderYId: "sliderPB-%s",
    labelXId:  "sliderPA-%s-val",
    labelYId:  "sliderPB-%s-val"
  });
});',
    instance, instance, instance, instance, instance
  )

  htmltools::tagList(
    engine_tag,
    controls_html,
    container_html,
    htmltools::tags$script(htmltools::HTML(init_script))
  )
}

# ── Dependent events ─────────────────────────────────────────────────────────

#' Create slider controls for the dependent-events widget (total probability)
#'
#' @param instance         String ID suffix, e.g. "dep"
#' @param default_pSick    Default P(sick) value (0–1)
#' @param default_pPosSick Default P(positive|sick) value (0–1)
#' @param default_pPosH    Default P(positive|healthy) value (0–1)
#' @return htmltools tagList
create_dependent_controls <- function(instance,
                                      default_pSick    = 0.10,
                                      default_pPosSick = 0.90,
                                      default_pPosH    = 0.10) {
  panel_bg <- INFERNO$panelBg

  make_slider_row <- function(label, id, default_val, color = INFERNO$lineA) {
    htmltools::tags$div(
      style = "display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;",
      htmltools::tags$label(
        style = "font-weight: bold; min-width: 110px;",
        paste0(label, ":")
      ),
      htmltools::tags$input(
        type  = "range",
        id    = id,
        min   = 0,
        max   = 1,
        step  = 0.01,
        value = default_val,
        style = "flex: 1; accent-color: #932667;"
      ),
      htmltools::tags$span(
        id    = paste0(id, "-val"),
        style = paste0("font-weight: bold; min-width: 40px; color: ", color, ";"),
        format(default_val, nsmall = 2)
      )
    )
  }

  # Compute initial total probability
  pPos_init <- default_pPosSick * default_pSick + default_pPosH * (1 - default_pSick)
  pct_init  <- round(pPos_init * 100, 1)

  htmltools::tags$div(
    style = paste0(
      "margin-bottom: 20px; padding: 15px; ",
      "background-color: ", panel_bg, "; border-radius: 8px;"
    ),
    make_slider_row("P(Hugly)",       paste0("sliderSick-", instance),    default_pSick,    "#bb3754"),
    make_slider_row("P(+|Hugly)",     paste0("sliderPosSick-", instance), default_pPosSick, "#bb3754"),
    make_slider_row("P(+|healthy)",   paste0("sliderPosH-", instance),    default_pPosH,    "#dd513a"),
    # Total probability bar (read-only)
    htmltools::tags$div(
      style = "margin-top: 12px;",
      htmltools::tags$label(
        style = "font-weight: bold; display: block; margin-bottom: 4px;",
        "P(positive) total:"
      ),
      htmltools::tags$div(
        style = "position: relative; height: 22px; background: rgba(221, 81, 58, 0.15); border: 1px solid rgba(221, 81, 58, 0.4); border-radius: 4px; overflow: hidden;",
        htmltools::tags$div(
          id    = paste0("barTotal-", instance),
          style = paste0(
            "height: 100%; background: linear-gradient(90deg, #bb3754, #dd513a); ",
            "width: ", pct_init, "%; transition: width 0.15s;"
          )
        )
      ),
      htmltools::tags$span(
        id    = paste0("labelTotal-", instance),
        style = "font-weight: bold; font-size: 13px; color: #dd513a; display: block; margin-top: 4px;",
        paste0("P(+) = ", format(pPos_init, digits = 4))
      )
    )
  )
}

#' Create canvas container for the dependent-events widget
#'
#' @param instance  String ID suffix
#' @return htmltools tag
create_dependent_container <- function(instance) {
  htmltools::tags$div(
    style = "padding: 8px 0;",
    htmltools::tags$canvas(
      id    = paste0("dep-canvas-", instance),
      style = "width: 100%; display: block;"
    )
  )
}

#' Inline engine JS and wire up a dependent-events instance
#'
#' @param js_file        Path to dependent_events.js
#' @param instance       String ID suffix
#' @param controls_html  Output of create_dependent_controls()
#' @param container_html Output of create_dependent_container()
#' @return htmltools tagList
render_dependent_plot <- function(js_file, instance, controls_html, container_html) {
  engine_tag <- NULL
  if (!isTRUE(.GlobalEnv$.dep_events_engine_loaded)) {
    js_code    <- paste(readLines(js_file, warn = FALSE), collapse = "\n")
    engine_tag <- htmltools::tags$script(htmltools::HTML(js_code))
    .GlobalEnv$.dep_events_engine_loaded <- TRUE
  }

  init_script <- sprintf(
    'document.addEventListener("DOMContentLoaded", function () {
  window.DependentEvents.create({
    canvasId:          "dep-canvas-%s",
    sliderSickId:      "sliderSick-%s",
    sliderPosSickId:   "sliderPosSick-%s",
    sliderPosHealthyId:"sliderPosH-%s",
    labelSickId:       "sliderSick-%s-val",
    labelPosSickId:    "sliderPosSick-%s-val",
    labelPosHealthyId: "sliderPosH-%s-val",
    barTotalId:        "barTotal-%s",
    labelTotalId:      "labelTotal-%s"
  });
});',
    instance, instance, instance, instance, instance, instance, instance, instance, instance
  )

  htmltools::tagList(
    engine_tag,
    controls_html,
    container_html,
    htmltools::tags$script(htmltools::HTML(init_script))
  )
}

# ── Bayes visual (P(sick|positive) bar) ──────────────────────────────────────

#' Create canvas container for the Bayes bar visual
#'
#' @param instance  String ID suffix
#' @return htmltools tag
create_bayes_container <- function(instance) {
  htmltools::tags$div(
    style = "padding: 8px 0;",
    htmltools::tags$canvas(
      id    = paste0("bayes-canvas-", instance),
      style = "width: 100%; display: block;"
    )
  )
}

#' Inline bayes_visual.js and wire it to the same sliders as the dependent plot
#'
#' @param js_file        Path to bayes_visual.js
#' @param dep_instance   Instance suffix of the dependent-events sliders it reads from
#' @param instance       String ID suffix for this canvas
#' @param container_html Output of create_bayes_container()
#' @return htmltools tagList
render_bayes_plot <- function(js_file, dep_instance, instance, container_html) {
  js_code    <- paste(readLines(js_file, warn = FALSE), collapse = "\n")
  engine_tag <- htmltools::tags$script(htmltools::HTML(js_code))

  init_script <- sprintf(
    'document.addEventListener("DOMContentLoaded", function () {
  window.BayesVisual.create({
    canvasId:          "bayes-canvas-%s",
    sliderSickId:      "sliderSick-%s",
    sliderPosSickId:   "sliderPosSick-%s",
    sliderPosHealthyId:"sliderPosH-%s"
  });
});',
    instance, dep_instance, dep_instance, dep_instance
  )

  htmltools::tagList(
    engine_tag,
    container_html,
    htmltools::tags$script(htmltools::HTML(init_script))
  )
}
