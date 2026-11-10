# FINORA — Hybrid project presentation

A responsive project website with an optional full-screen presentation mode, inspired by the two Gachon Web Programming team references and built from the supplied 11-slide FINORA PowerPoint.

## Run locally

Open `index.html` in a modern browser. No build step or package installation is required.

## Files

- `index.html` — all project sections and semantic page structure
- `styles.css` — responsive visual system and presentation mode
- `app.js` — sample transaction interaction, navigation, and slide controls
- `assets/dashboard-reference.png` — dashboard concept image extracted from the supplied FINORA presentation

## Interactions

- Scroll navigation between project sections
- `Present` opens an 11-part slide-style presentation with previous/next, slide dots, keyboard arrows, Escape, and fullscreen
- The sample transaction form updates the displayed sample balance and recent activity in memory only

## Important project-scope note

The source PowerPoint describes a proposed full-stack system (HTML/CSS/JavaScript, Node.js/Express, SQLite, Chart.js, and Lucide). This presentation site does not implement the production backend, authentication, persistent database, or bank connection. The transaction form is a temporary browser-only demonstration using fictional data. The dashboard visual is a concept image from the supplied proposal.
