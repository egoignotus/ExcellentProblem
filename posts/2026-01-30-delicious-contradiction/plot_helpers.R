# Helper functions for interactive plots

#' Create year range controls for interactive plots
#' 
#' @param default_start Default start year
#' @param default_end Default end year
#' @param min_year Minimum allowed year
#' @param max_year Maximum allowed year
#' @return HTML div with year input controls
create_year_controls <- function(default_start, default_end, min_year, max_year) {
  htmltools::tags$div(
    style = "margin-bottom: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;",
    htmltools::tags$label(
      "Start Year: ",
      htmltools::tags$input(
        type = "number",
        id = "startYear",
        value = default_start,
        min = min_year,
        max = max_year,
        style = "padding: 5px; margin: 0 10px; width: 80px;"
      )
    ),
    htmltools::tags$label(
      "End Year: ",
      htmltools::tags$input(
        type = "number",
        id = "endYear",
        value = default_end,
        min = min_year,
        max = max_year,
        style = "padding: 5px; margin: 0 10px; width: 80px;"
      )
    ),
    htmltools::tags$button(
      "Update Plot",
      onclick = "updatePlot()",
      style = "padding: 5px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;"
    )
  )
}
