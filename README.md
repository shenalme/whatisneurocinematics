# Neurocinema Notes

A small static site of guides, interactive tools and resources on neurocinematics, built for GitHub Pages. Every page links back to the author's homepage (senaldharmasiri.co.uk) from a small author box at the end.

## Pages

| Path | Type | What it is |
|---|---|---|
| `/` | Hub | Landing page linking to everything below |
| `/what-is-neurocinematics/` | Guide | Beginner's guide to the field, methods and key studies |
| `/inter-subject-correlation/` | Interactive | ISC explainer with a live audience simulator |
| `/shot-length-calculator/` | Tool | Average/median shot length, cuts per minute, histogram |
| `/datasets/` | Resource | Curated open EEG/fMRI/physiology film-viewing datasets |
| `/glossary/` | Reference | 22 key terms, A–Z |

Also included: `sitemap.xml`, `robots.txt`, `404.html`, `.nojekyll`, per-page meta descriptions, canonical URLs, Open Graph tags and schema.org JSON-LD (Article / WebApplication with author details).

## Publish on GitHub Pages

1. Create a public repository named `neurocinematics` under the `shenalme` account.
2. Push the contents of this folder to the `main` branch.
3. In the repository, open **Settings → Pages**, set **Source** to *Deploy from a branch*, branch `main`, folder `/ (root)`, and save.
4. The site goes live at `https://shenalme.github.io/neurocinematics/` within a few minutes.

If you use a different repository name or a custom domain, find and replace `https://shenalme.github.io/neurocinematics` in every `index.html`, `sitemap.xml` and `robots.txt`, and update the home link in `404.html`.

## After launch

- Add the site to Google Search Console and submit `sitemap.xml`.
- Share individual pages on LinkedIn, ResearchGate and relevant communities; the datasets list and calculator are the most linkable.
- When you are ready, add a link from senaldharmasiri.co.uk (for example a footer "Resources" link) so search engines connect the two sites.

## Editing

Pages are plain HTML. Shared styles live in `assets/style.css`; behaviour in `assets/site.js` (scroll reveal), `assets/isc.js` (simulator) and `assets/asl.js` (calculator). Animations switch off automatically for visitors who prefer reduced motion, and the site follows the visitor's light or dark mode.
