# Numa — website

Static site. Three source files + one image. No build step.

## Files
- `index.html` — all content & structure
- `styles.css` — colors, type, layout
- `app.js` — interactions (filter slider, tiers, pre-order form)
- `assets/how-to-wear.png` — fitting-guide image

## Run locally
Just open `index.html` in a browser. (Or run `npx serve` in this folder.)

## Deploy (Netlify — free)
1. Push this folder to a GitHub repo.
2. netlify.com → Add new site → Import from GitHub → pick the repo.
3. Leave build settings blank → Deploy.

Every `git push` auto-updates the live site.

## Before launch — 2 edits in app.js
1. **Pre-order emails:** find `FORMSPREE_ENDPOINT` near the top of the pre-order
   section and replace `your-form-id` with your real Formspree form ID
   (free at formspree.io). Until then the form runs in local demo mode.
2. **Privacy/Terms:** links in the footer point to `#` — point them at real pages
   when ready.

## Editing later
Change the text in `index.html`, styles in `styles.css`, behavior in `app.js`,
then `git add . && git commit -m "..." && git push`. Done.
