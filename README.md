# Saarkesh — Portfolio

Single-page portfolio for **Saarkesh**, video editor and graphic designer in Colombo.

## Editing the site

Go to **`/admin`** on the live site (for example `https://saarkcreates.site/admin/`) and sign in.
Everything is edited there: videos, designs, experience cards, tools, all text, links, and layout.
Press **Publish** and the site updates in about a minute.

- Text, order and settings are saved to `content.json` in this repo.
- New videos and images go to **your own server** (CyberPanel, see `server-upload/SERVER-SETUP.md`)
  or to Cloudinary. You choose in the dashboard's Settings.
- Each device needs a one-time setup: a GitHub fine-grained key (Contents: read and write, this repo only)
  and the upload details (server address + key, or Cloudinary). Keys stay in that browser only.

## Files

- `index.html`: the site. It reads `content.json` when it loads; the copy inside it is only a fallback.
- `content.json`: all content. The dashboard writes it, so there's no need to edit it by hand.
- `admin/`: the dashboard.
- `tool-icons.js`: built-in tool logos used by the site and the dashboard.
- `server-upload/`: `upload.php` for your CyberPanel server and its setup guide. Kept out of git so your key is never published.
- `sw.js`: service worker. It never caches pages, `content.json`, the dashboard or videos.

## View it locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` by double-click also works, using the built-in copy of the content.
