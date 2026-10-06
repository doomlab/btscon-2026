# Summarize BTSCon 2026 registrations into de-identified country counts
# Raw export stays outside this folder (contains names/emails)

library(readxl)
library(dplyr)
library(countrycode)

raw_file <- "~/Downloads/BTSCon Registration 2026_October 5, 2026_17.03.xlsx"

# Qualtrics export: row 1 is the question text
reg <- read_excel(raw_file)[-1, ]

# drop previews and blank emails, then de-duplicate on email (keep latest)
reg <- reg |>
  filter(Status != "Survey Preview") |>
  mutate(email_clean = tolower(trimws(email))) |>
  filter(!is.na(email_clean), email_clean != "") |>
  arrange(desc(RecordedDate)) |>
  distinct(email_clean, .keep_all = TRUE)

# clean country: take first entry of "Country/Region" answers
reg <- reg |>
  mutate(
    location_first = trimws(sub("/.*$", "", location)),
    country = countrycode(
      location_first,
      origin = "country.name",
      destination = "country.name",
      custom_match = c(
        "México" = "Mexico", "España" = "Spain", "Suiza" = "Switzerland",
        "Deutschland" = "Germany", "Österreich" = "Austria", "Polska" = "Poland",
        "Brasil" = "Brazil", "Cameroun" = "Cameroon", "Türkiye" = "Turkey",
        "Turkiye" = "Turkey", "中国" = "China", "Scotland" = "United Kingdom",
        "UK" = "United Kingdom", "USA" = "United States", "usa" = "United States"
      ),
      warn = FALSE
    ),
    iso3 = countrycode(country, "country.name", "iso3c", warn = FALSE)
  )

# answers that were regions only (e.g., "Europe", "Earth") are left out of the map
unmatched <- reg |> filter(!is.na(location), is.na(iso3)) |> count(location)
print(unmatched)

country_counts <- reg |>
  filter(!is.na(iso3)) |>
  count(country, iso3, name = "registrants", sort = TRUE)

career_counts <- reg |>
  filter(!is.na(`career stage`)) |>
  mutate(stage = case_when(
    grepl("Undergraduate|Master|Phd|PsyD", `career stage`) ~ "Student",
    grepl("^(1-5|6-10) years", `career stage`) ~ "Early career (1-10 years)",
    grepl("^(11-15|16-20) years", `career stage`) ~ "Mid career (11-20 years)",
    TRUE ~ "Senior (21+ years)"
  )) |>
  count(stage, name = "registrants")

summary_stats <- tibble(
  registrants = nrow(reg),
  countries = nrow(country_counts),
  region_only_answers = sum(unmatched$n)
)
print(summary_stats)

dir.create("data", showWarnings = FALSE)
write.csv(country_counts, "data/registration_countries.csv", row.names = FALSE)
write.csv(career_counts, "data/registration_career.csv", row.names = FALSE)
write.csv(summary_stats, "data/registration_summary.csv", row.names = FALSE)
