# Generate books.qmd from post metadata
# This script runs as a Quarto pre-render step.

library(yaml)

posts_dir <- "posts"
output_file <- "books.qmd"

# Find all index.qmd files in post directories
post_files <- list.files(posts_dir, pattern = "index\\.qmd$",
                         recursive = TRUE, full.names = TRUE)

books <- data.frame(
  title = character(),
  author = character(),
  post_title = character(),
  post_href = character(),
  stringsAsFactors = FALSE
)

blogs <- data.frame(
  title = character(),
  author = character(),
  post_title = character(),
  post_href = character(),
  stringsAsFactors = FALSE
)

for (post_file in post_files) {
  lines <- readLines(post_file, warn = FALSE)

  # Extract YAML frontmatter
  delimiters <- which(lines == "---")
  if (length(delimiters) < 2) next

  yaml_text <- paste(lines[(delimiters[1] + 1):(delimiters[2] - 1)],
                     collapse = "\n")
  meta <- tryCatch(yaml.load(yaml_text), error = function(e) NULL)
  if (is.null(meta)) next

  post_title <- meta$title %||% basename(dirname(post_file))

  if (!is.null(meta$books)) {
    for (book in meta$books) {
      books <- rbind(books, data.frame(
        title = book$title,
        author = book$author,
        post_title = post_title,
        post_href = post_file,
        stringsAsFactors = FALSE
      ))
    }
  }

  if (!is.null(meta$blogs)) {
    for (blog in meta$blogs) {
      blogs <- rbind(blogs, data.frame(
        title = blog$title,
        author = blog$author,
        post_title = post_title,
        post_href = post_file,
        stringsAsFactors = FALSE
      ))
    }
  }
}

# Sort alphabetically
books <- books[order(books$title), ]
blogs <- blogs[order(blogs$title), ]

# Generate the books.qmd content
output <- c(
  "---",
  'title: "Books"',
  "---",
  "",
  "An index of books and blogs mentioned — directly or indirectly — across the blog posts.",
  "",
  "## Books",
  "",
  "| Book | Author | Post |",
  "|------|--------|------|"
)

for (i in seq_len(nrow(books))) {
  output <- c(output, sprintf("| *%s* | %s | [%s](%s) |",
                              books$title[i], books$author[i],
                              books$post_title[i], books$post_href[i]))
}

output <- c(output, "", "## Blogs", "",
            "| Blog | Author | Post |",
            "|------|--------|------|")

for (i in seq_len(nrow(blogs))) {
  output <- c(output, sprintf("| *%s* | %s | [%s](%s) |",
                              blogs$title[i], blogs$author[i],
                              blogs$post_title[i], blogs$post_href[i]))
}

writeLines(output, output_file)
cat("Generated", output_file, "with", nrow(books), "books and",
    nrow(blogs), "blogs\n")
