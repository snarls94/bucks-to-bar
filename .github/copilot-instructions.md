# Copilot Instructions for this project

## Project context

This project is a lightweight static budget tracker for monthly income and expenses. It uses plain HTML, CSS, and JavaScript with a Bootstrap-based UI and no framework build pipeline.

## Working conventions

- Keep the app simple and client-side: prefer minimal, direct changes in the existing HTML, CSS, and JavaScript structure.
- Preserve the current visual design language: soft paper background, green and red data accents, muted UI text, and monospace currency formatting.
- Continue using USD as the currency throughout labels, summaries, and chart tooltips.
- Favor accessibility: keep semantic HTML, provide clear labels, and preserve visible focus states.
- Prefer small, surgical edits over large rewrites.
- Use the existing localStorage pattern for persistence unless the task explicitly calls for a different storage model.

## UI rules

- All buttons must have a pink background color.
- Use a consistent, readable pink accent that contrasts well with text and matches the app’s existing color system.
- Keep button styling consistent across the app instead of creating ad hoc colors in individual sections.
- If a button needs a hover or focus state, preserve readable contrast and visual polish.

## Validation

- Check JavaScript syntax after changes when relevant.
- Make sure edits do not break the visual layout or month/amount logic.
- Keep the app behavior aligned with the budget tracker’s existing flows: monthly inputs, total calculations, and chart updates.

## Examples of preferred changes

- Add or adjust labels using clear, user-focused wording.
- Update the table, summary, or chart while keeping the current app structure intact.
- Maintain consistent non-breaking styling for buttons, inputs, and summary cards.
