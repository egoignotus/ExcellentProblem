# Helper functions for interactive integral plots

#' Create integration limit controls with dual-range slider
#' 
#' @param id_prefix Prefix for HTML element IDs (e.g., "", "Log", "Exp")
#' @param range_min Minimum value for the range
#' @param range_max Maximum value for the range
#' @param default_lower Default value for lower limit
#' @param default_upper Default value for upper limit
#' @param update_function JavaScript function name to call on input
#' @param bg_color Background color for the control panel
#' @return HTML div with slider controls
create_integral_controls <- function(id_prefix = "", 
                                     range_min = 0, range_max = 10,
                                     default_lower = 0, default_upper = 5,
                                     update_function = "updateIntegralPlot",
                                     bg_color = "#f8f9fa") {
  slider_id <- paste0("rangeSlider", id_prefix)
  
  htmltools::tags$div(
    style = paste0("margin-bottom: 20px; padding: 15px; background-color: ", bg_color, "; border-radius: 8px;"),
    # Range display
    htmltools::tags$div(
      style = "display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;",
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Integration limits:"
      ),
      htmltools::tags$span(
        id = paste0("rangeDisplay", id_prefix),
        style = "font-weight: bold;",
        sprintf("[%.1f, %.1f]", default_lower, default_upper)
      )
    ),
    # Slider container
    htmltools::tags$div(
      id = slider_id,
      style = "margin: 10px 5px 20px 5px;"
    ),
    # Integral value display
    htmltools::tags$div(
      "Integral: ",
      htmltools::tags$strong(id = paste0("integralValue", id_prefix), "0.00"),
      htmltools::tags$span(
        style = "margin-left: 15px;",
        "(",
        htmltools::tags$strong(id = paste0("integralPercent", id_prefix), "0"),
        "% of max)"
      )
    ),
    # Initialize the slider
    htmltools::tags$script(htmltools::HTML(sprintf("
      document.addEventListener('DOMContentLoaded', function() {
        var slider = document.getElementById('%s');
        if (slider && !slider.noUiSlider) {
          noUiSlider.create(slider, {
            start: [%f, %f],
            connect: true,
            range: {'min': %f, 'max': %f},
            step: 0.1,
            tooltips: false
          });
          slider.noUiSlider.on('update', function(values) {
            document.getElementById('rangeDisplay%s').textContent = 
              '[' + parseFloat(values[0]).toFixed(1) + ', ' + parseFloat(values[1]).toFixed(1) + ']';
            if (typeof %s === 'function') %s();
          });
        }
      });
    ", slider_id, default_lower, default_upper, range_min, range_max, 
       id_prefix, update_function, update_function)))
  )
}

#' Create plot containers for function and integral plots
#' 
#' @param id_prefix Prefix for HTML element IDs
#' @return HTML div with two plot containers
create_plot_containers <- function(id_prefix = "") {
  htmltools::tags$div(
    htmltools::tags$div(
      id = paste0("leftPlot", id_prefix),
      style = "width: 100%; height: min(400px, 60vw);"
    )
  )
}

#' Render an interactive plot section (controls + containers + JS)
#'
#' Replaces the old pattern of creating a dummy plot_ly() widget.
#' Plotly.js and noUiSlider must be loaded via the post's YAML header.
#' The shared engine (integral_engine.js) is inlined automatically on
#' the first call.
#'
#' @param js_file Path to the JavaScript file containing the plot logic
#' @param init_function Name of the JS init function to call
#' @param controls_html HTML output from create_integral_controls()
#' @param plot_containers HTML output from create_plot_containers()
#' @return htmltools::tagList ready for rendering
render_interactive_plot <- function(js_file, init_function,
                                    controls_html, plot_containers) {
  js_code <- paste(readLines(js_file, warn = FALSE), collapse = "\n")

  # Inline the shared engine once (first call only)
  engine_tag <- NULL
  if (!isTRUE(.GlobalEnv$.integral_engine_loaded)) {
    engine_code <- paste(readLines("integral_engine.js", warn = FALSE), collapse = "\n")
    engine_tag <- htmltools::tags$script(htmltools::HTML(engine_code))
    .GlobalEnv$.integral_engine_loaded <- TRUE
  }

  htmltools::tagList(
    engine_tag,
    controls_html,
    plot_containers,
    htmltools::tags$script(htmltools::HTML(sprintf(
      "%s\ndocument.addEventListener('DOMContentLoaded', function() { %s(); });",
      js_code, init_function
    )))
  )
}
