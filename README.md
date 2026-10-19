# Saarkesh — Video Editor Portfolio

Single-page portfolio site for **Saarkesh**, a video editor based in Colombo, Sri Lanka.

Dark mode by default (with a remembered light/dark toggle), huge Inter Tight typography,
a Behance-style grid of vertical reels, and a video popup that plays local files or
YouTube / Vimeo / Instagram links.

## View it

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 8000
```

## Structure

- `index.html` — the entire site (HTML + CSS + JS in one file, no build step)
- `portfolio-videos/` — video files, tracked with **Git LFS**
- `portfolio-videos/posters/` — thumbnail frames extracted from each video

## Editing the work grid

Every tile is one line in the `VIDEOS` array near the bottom of `index.html`:

```js
{ kind: 'reel', cat: 'social', title: 'My reel', duration: '0:30',
  url: 'portfolio-videos/my-reel.mp4', thumb: 'portfolio-videos/posters/my-reel.jpg' }
```

- `kind`: `reel` (9:16 tile) or `film` (16:9 tile)
- `cat`: `social`, `wedding`, or `motion` (used by the filter buttons)
- `url`: a local file or a YouTube / Vimeo / Instagram link

## Stack

Vanilla HTML/CSS/JS — Inter Tight from Google Fonts, no frameworks, no dependencies.
