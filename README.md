# PawPoint Landing

Simple static landing page for an AI-assisted appointment system for pet groomers. Built with plain HTML/CSS/JS for easy hosting on GitHub Pages.

## Local preview

Open `index.html` in your browser, or run a simple server:

```bash
python3 -m http.server 5173
```

Then visit `http://localhost:5173`.

## Structure

- `index.html`: Sections — Hero, Problem, Solution/Benefits, Pricing, Waitlist, FAQ, Footer
- `styles.css`: Theme, layout, responsive styles
- `script.js`: Smooth scroll, waitlist validation, localStorage persistence, year update

## Waitlist data

For hypothesis testing, submissions are kept in `localStorage`:
- `pawpoint_waitlist`: latest form draft
- `pawpoint_waitlist_submissions`: array of submitted entries

To export, open DevTools Console and run:

```js
copy(localStorage.getItem('pawpoint_waitlist_submissions'))
```

If you want to forward submissions to a webhook, uncomment the `fetch` call in `script.js` and replace the URL.

## Deploy to GitHub Pages

1. Push these files to a public repository.
2. In the repo, go to Settings → Pages.
3. Set Source to `Deploy from a branch`, pick `main` and `/ (root)`.
4. Save — your site will be available at the Pages URL.

## License

No license specified; private prototype for market validation.
