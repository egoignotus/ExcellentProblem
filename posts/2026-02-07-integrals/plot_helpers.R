# Helper functions for interactive integral plots

#' Create integration limit controls
#' 
#' @param id_prefix Prefix for HTML element IDs (e.g., "", "Log", "Exp")
#' @param lower_min Minimum value for lower limit slider
#' @param lower_max Maximum value for lower limit slider
#' @param lower_default Default value for lower limit
#' @param upper_min Minimum value for upper limit slider
#' @param upper_max Maximum value for upper limit slider
#' @param upper_default Default value for upper limit
#' @param update_function JavaScript function name to call on input
#' @param bg_color Background color for the control panel
#' @return HTML div with slider controls
create_integral_controls <- function(id_prefix = "", 
                                     lower_min = 0, lower_max = 10, lower_default = 0,
                                     upper_min = 0, upper_max = 10, upper_default = 5,
                                     update_function = "updateIntegralPlot",
                                     bg_color = "#f8f9fa") {
  htmltools::tags$div(
    style = paste0("margin-bottom: 20px; padding: 15px; background-color: ", bg_color, "; border-radius: 8px;"),
    # Lower limit row
    htmltools::tags$div(
      style = "display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px;",
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Lower limit:"
      ),
      htmltools::tags$input(
        type = "range",
        id = paste0("tSlider", id_prefix, "Lower"),
        min = lower_min,
        max = lower_max,
        step = 0.1,
        value = lower_default,
        oninput = paste0(update_function, "()"),
        style = "width: 120px; max-width: 30vw;"
      ),
      htmltools::tags$span(
        id = paste0("tValue", id_prefix, "Lower"),
        style = "font-weight: bold; min-width: 30px;",
        sprintf("%.1f", lower_default)
      )
    ),
    # Upper limit row
    htmltools::tags$div(
      style = "display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px;",
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Upper limit:"
      ),
      htmltools::tags$input(
        type = "range",
        id = paste0("tSlider", id_prefix, "Upper"),
        min = upper_min,
        max = upper_max,
        step = 0.1,
        value = upper_default,
        oninput = paste0(update_function, "()"),
        style = "width: 120px; max-width: 30vw;"
      ),
      htmltools::tags$span(
        id = paste0("tValue", id_prefix, "Upper"),
        style = "font-weight: bold; min-width: 30px;",
        sprintf("%.1f", upper_default)
      )
    ),
    # Integral value display
    htmltools::tags$div(
      "Integral: ",
      htmltools::tags$strong(id = paste0("integralValue", id_prefix), "0.00")
    )
  )
}

#' Create plot containers for function and integral plots
#' 
#' @param id_prefix Prefix for HTML element IDs
#' @return HTML div with two plot containers
create_plot_containers <- function(id_prefix = "") {
  htmltools::tags$div(
    style = "display: flex; gap: 10px; flex-wrap: wrap;",
    htmltools::tags$div(
      id = paste0("leftPlot", id_prefix),
      style = "flex: 1 1 45%; min-width: 250px; height: min(350px, 50vw);"
    ),
    htmltools::tags$div(
      id = paste0("rightPlot", id_prefix),
      style = "flex: 1 1 45%; min-width: 250px; height: min(350px, 50vw);"
    )
  )
}
