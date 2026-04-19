# Helper functions for tail-end interactive grid

source("../../assets/inferno_palette.R")

# ── Event option definitions ─────────────────────────────────────────────────
# Keys must match the EVENTS catalogue in tail_end.js.
.TAIL_END_EVENTS <- list(
  annual = list(
    list(key = "birthday",  label = "Birthday \U0001F382"),
    list(key = "summer",    label = "Summer \u2600\uFE0F"),
    list(key = "christmas", label = "Christmas \U0001F384"),
    list(key = "dentistcheckup", label = "Dentist check-up \U0001F9B7")
  ),
  highfreq = list(
    list(key = "meetingfriends", label = "Meeting friend \U0001F469", default_per_year = 4),
    list(key = "readingbooks", label = "Reading book \U0001F4D6", default_per_year = 6),
    list(key = "fullmoon", label = "Full moon \U0001F315", default_per_year = 12),
    list(key = "enjoyablemeal", label = "Enjoyable meal \U0001F35B", default_per_year = 26)
  ),
  rare = list(
    list(key = "elections",         label = "Election \U0001F5F3", default_years = 5),
    list(key = "passportexchange",  label = "Passport exchange \U0001F6C2", default_years = 10),
    list(key = "stockmarketcrash",  label = "Stock market crash \U0001F4C9", default_years = 12),
    list(key = "isotopicexchange",  label = "Isotopic exchange \u269B", default_years = 7)
  ),
  cutoff = list(
    list(key = "mortgagepayment", label = "Mortgage-free year \U0001F3E0"),
    list(key = "childbirthdays",  label = "Child's birthday \U0001F476"),
    list(key = "elections",       label = "Election (18+) \U0001F5F3")
  ),
  rightcutoff = list(
    list(key = "yearswithparents", label = "Year with parents \U0001F468\u200D\U0001F469\u200D\U0001F467"),
    list(key = "yearswithspouse",  label = "Year with spouse \U0001F49E"),
    list(key = "yearswithmentors", label = "Year with mentors \U0001F393")
  )
)

#' Create controls for a tail-end widget instance
#'
#' @param instance        String ID suffix, e.g. "annual" or "rare"
#' @param default_age     Default current age
#' @param default_lifespan Default assumed lifespan
#' @param event_group     Which event group to show: "annual", "rare", or "cutoff"
#' @param default_event   Default selected event key for the dropdown
#' @param include_cutoff  Whether to show third input for eligibility age
#' @param default_cutoff_age Default cut-off age (start counting from this age)
#' @param include_frequency Whether to show 'events per year' numeric input
#' @param default_events_per_year Default events-per-year value
#' @param include_frequency_years Whether to show 'every x years' numeric input
#' @param default_frequency_years Default every-x-years value
#' @return htmltools tagList with number inputs, event selector, and Update button
create_tail_end_controls <- function(instance,
                                     default_age      = 37,
                                     default_lifespan = 90,
                                     event_group      = "annual",
                                     default_event    = NULL,
                                     include_cutoff   = FALSE,
                                     default_cutoff_age = 18,
                                     include_frequency = FALSE,
                                     default_events_per_year = 1,
                                     include_frequency_years = FALSE,
                                     default_frequency_years = 5) {
  panel_bg  <- INFERNO$panelBg
  btn_color <- INFERNO$buttonBg
  events    <- .TAIL_END_EVENTS[[event_group]]

  options_html <- lapply(events, function(ev) {
    htmltools::tags$option(
      value = ev$key,
      `data-default-frequency` = if (!is.null(ev$default_per_year)) ev$default_per_year else if (!is.null(ev$default_years)) ev$default_years else NULL,
      selected = if (!is.null(default_event) && ev$key == default_event) "selected" else NULL,
      ev$label
    )
  })

  htmltools::tags$div(
    style = paste0(
      "margin-bottom: 20px; padding: 15px; ",
      "background-color: ", panel_bg, "; border-radius: 8px;"
    ),
    htmltools::tags$div(
      style = "display: flex; gap: 24px; flex-wrap: wrap; align-items: center; margin-bottom: 12px;",
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Current age:",
        htmltools::tags$input(
          type  = "number",
          id    = paste0("tailAge-", instance),
          value = default_age,
          min   = 0,
          max   = 120,
          step  = 1,
          inputmode = "numeric",
          pattern = "[0-9]*",
          style = "padding: 4px 6px; margin-left: 8px; width: 68px;"
        )
      ),
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Assumed lifespan:",
        htmltools::tags$input(
          type  = "number",
          id    = paste0("tailLifespan-", instance),
          value = default_lifespan,
          min   = 1,
          max   = 120,
          step  = 1,
          inputmode = "numeric",
          pattern = "[0-9]*",
          style = "padding: 4px 6px; margin-left: 8px; width: 68px;"
        )
      ),
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Event:",
        htmltools::tags$select(
          id    = paste0("tailEvent-", instance),
          style = "padding: 4px 6px; margin-left: 8px;",
          options_html
        )
      ),
      if (isTRUE(include_cutoff)) {
        htmltools::tags$label(
          style = "font-weight: bold;",
          "Eligibility age:",
          htmltools::tags$input(
            type  = "number",
            id    = paste0("tailCutoff-", instance),
            value = default_cutoff_age,
            min   = 0,
            max   = 120,
            step  = 1,
            inputmode = "numeric",
            pattern = "[0-9]*",
            style = "padding: 4px 6px; margin-left: 8px; width: 68px;"
          )
        )
      },
      if (isTRUE(include_frequency)) {
        htmltools::tags$label(
          style = "font-weight: bold;",
          "Events / year:",
          htmltools::tags$input(
            type  = "number",
            id    = paste0("tailFrequency-", instance),
            value = default_events_per_year,
            min   = 1,
            max   = 365,
            step  = 1,
            inputmode = "numeric",
            pattern = "[0-9]*",
            style = "padding: 4px 6px; margin-left: 8px; width: 74px;"
          )
        )
      },
      if (isTRUE(include_frequency_years)) {
        htmltools::tags$label(
          style = "font-weight: bold;",
          "Every x years:",
          htmltools::tags$input(
            type  = "number",
            id    = paste0("tailFrequencyYears-", instance),
            value = default_frequency_years,
            min   = 1,
            max   = 100,
            step  = 1,
            inputmode = "numeric",
            pattern = "[0-9]*",
            style = "padding: 4px 6px; margin-left: 8px; width: 74px;"
          )
        )
      }
    ),
    htmltools::tags$button(
      "Update",
      onclick = paste0("window.TailEnd._instances['", instance, "'].update()"),
      style   = paste0(
        "padding: 5px 18px; background-color: ", btn_color, "; ",
        "color: white; border: none; border-radius: 3px; cursor: pointer;"
      )
    )
  )
}

#' Create container divs for a tail-end widget instance
#'
#' @param instance  String ID suffix (must match create_tail_end_controls)
#' @return htmltools tag with summary paragraph + grid div
create_tail_end_container <- function(instance) {
  htmltools::tags$div(
    htmltools::tags$p(
      id    = paste0("tail-end-summary-", instance),
      style = paste0(
        "font-size: 1.05rem; margin: 8px 0 4px; font-weight: bold; ",
        "color: ", INFERNO$lineA, ";"
      )
    ),
    htmltools::tags$div(
      id    = paste0("tail-end-grid-", instance),
      style = "padding: 12px 0;"
    )
  )
}

#' Create controls for a right-cutoff widget instance
#'
#' @param instance        String ID suffix
#' @param default_age     Default your age
#' @param default_lifespan Default your assumed lifespan
#' @param default_mate_age Default age of older mate
#' @param default_mate_lifespan Default life expectancy of older mate
#' @param default_event   Default selected event key
#' @return htmltools tagList
create_right_cutoff_controls <- function(instance,
                                         default_age      = 37,
                                         default_lifespan = 90,
                                         default_mate_age = 65,
                                         default_mate_lifespan = 85,
                                         default_met_age  = 0,
                                         default_event    = "yearswithparents") {
  panel_bg  <- INFERNO$panelBg
  btn_color <- INFERNO$buttonBg
  events    <- .TAIL_END_EVENTS[["rightcutoff"]]

  options_html <- lapply(events, function(ev) {
    htmltools::tags$option(
      value = ev$key,
      selected = if (ev$key == default_event) "selected" else NULL,
      ev$label
    )
  })

  htmltools::tags$div(
    style = paste0(
      "margin-bottom: 20px; padding: 15px; ",
      "background-color: ", panel_bg, "; border-radius: 8px;"
    ),
    htmltools::tags$div(
      style = "display: flex; gap: 24px; flex-wrap: wrap; align-items: center; margin-bottom: 12px;",
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Your age:",
        htmltools::tags$input(
          type  = "number",
          id    = paste0("tailAge-", instance),
          value = default_age,
          min   = 0,
          max   = 120,
          step  = 1,
          inputmode = "numeric",
          pattern = "[0-9]*",
          style = "padding: 4px 6px; margin-left: 8px; width: 68px;"
        )
      ),
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Your assumed lifespan:",
        htmltools::tags$input(
          type  = "number",
          id    = paste0("tailLifespan-", instance),
          value = default_lifespan,
          min   = 1,
          max   = 120,
          step  = 1,
          inputmode = "numeric",
          pattern = "[0-9]*",
          style = "padding: 4px 6px; margin-left: 8px; width: 68px;"
        )
      ),
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Event:",
        htmltools::tags$select(
          id    = paste0("tailEvent-", instance),
          style = "padding: 4px 6px; margin-left: 8px;",
          options_html
        )
      ),
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Age of your older mate:",
        htmltools::tags$input(
          type  = "number",
          id    = paste0("tailMateAge-", instance),
          value = default_mate_age,
          min   = 0,
          max   = 120,
          step  = 1,
          inputmode = "numeric",
          pattern = "[0-9]*",
          style = "padding: 4px 6px; margin-left: 8px; width: 68px;"
        )
      ),
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Life expectancy of your older mate:",
        htmltools::tags$input(
          type  = "number",
          id    = paste0("tailMateLifespan-", instance),
          value = default_mate_lifespan,
          min   = 1,
          max   = 120,
          step  = 1,
          inputmode = "numeric",
          pattern = "[0-9]*",
          style = "padding: 4px 6px; margin-left: 8px; width: 68px;"
        )
      ),
      htmltools::tags$label(
        style = "font-weight: bold;",
        "Your age when you met:",
        htmltools::tags$input(
          type  = "number",
          id    = paste0("tailMetAge-", instance),
          value = default_met_age,
          min   = 0,
          max   = 120,
          step  = 1,
          inputmode = "numeric",
          pattern = "[0-9]*",
          style = "padding: 4px 6px; margin-left: 8px; width: 68px;"
        )
      )
    ),
    htmltools::tags$button(
      "Update",
      onclick = paste0("window.TailEnd._instances['", instance, "'].update()"),
      style   = paste0(
        "padding: 5px 18px; background-color: ", btn_color, "; ",
        "color: white; border: none; border-radius: 3px; cursor: pointer;"
      )
    )
  )
}

#' Inline the JS engine (once per document) and wire up a widget instance
#'
#' @param js_file        Path to tail_end.js
#' @param instance       String ID suffix matching controls and container
#' @param controls_html  Output of create_tail_end_controls()
#' @param container_html Output of create_tail_end_container()
#' @param include_cutoff Whether this widget instance uses left cut-off input
#' @param include_frequency Whether this widget uses events-per-year input
#' @return htmltools tagList ready for rendering
render_tail_end_plot <- function(js_file, instance, controls_html, container_html,
                                 include_cutoff = FALSE,
                                 include_frequency = FALSE,
                                 include_frequency_years = FALSE,
                                 include_right_cutoff = FALSE) {
  engine_tag <- NULL
  if (!isTRUE(.GlobalEnv$.tail_end_engine_loaded)) {
    js_code    <- paste(readLines(js_file, warn = FALSE), collapse = "\n")
    engine_tag <- htmltools::tags$script(htmltools::HTML(js_code))
    .GlobalEnv$.tail_end_engine_loaded <- TRUE
  }

  cutoff_id_js <- if (isTRUE(include_cutoff)) {
    sprintf('"tailCutoff-%s"', instance)
  } else {
    "null"
  }

  frequency_id_js <- if (isTRUE(include_frequency)) {
    sprintf('"tailFrequency-%s"', instance)
  } else {
    "null"
  }

  frequency_years_id_js <- if (isTRUE(include_frequency_years)) {
    sprintf('"tailFrequencyYears-%s"', instance)
  } else {
    "null"
  }

  mate_age_id_js <- if (isTRUE(include_right_cutoff)) {
    sprintf('"tailMateAge-%s"', instance)
  } else {
    "null"
  }

  mate_lifespan_id_js <- if (isTRUE(include_right_cutoff)) {
    sprintf('"tailMateLifespan-%s"', instance)
  } else {
    "null"
  }

  met_age_id_js <- if (isTRUE(include_right_cutoff)) {
    sprintf('"tailMetAge-%s"', instance)
  } else {
    "null"
  }

  init_script <- sprintf(
    'document.addEventListener("DOMContentLoaded", function () {
  var inst = window.TailEnd.create({
    gridId:           "tail-end-grid-%s",
    summaryId:        "tail-end-summary-%s",
    ageId:            "tailAge-%s",
    lifespanId:       "tailLifespan-%s",
    eventId:          "tailEvent-%s",
    cutoffId:         %s,
    frequencyId:      %s,
    frequencyYearsId: %s,
    mateAgeId:        %s,
    mateLifespanId:   %s,
    metAgeId:         %s
  });
  window.TailEnd._instances["%s"] = inst;
  inst.init();
});',
    instance, instance, instance, instance, instance,
    cutoff_id_js, frequency_id_js, frequency_years_id_js,
    mate_age_id_js, mate_lifespan_id_js, met_age_id_js, instance
  )

  htmltools::tagList(
    engine_tag,
    controls_html,
    container_html,
    htmltools::tags$script(htmltools::HTML(init_script))
  )
}
