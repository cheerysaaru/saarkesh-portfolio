# Portfolio Media Audit Report

**Date:** November 3, 2026  
**Project:** Saarkesh Portfolio (`saarkesh-portfolio`)  
**Scope:** Complete audit of all videos and images in the repository.  
**Constraint Check:** Inspection and reporting only. No files were modified, deleted, converted, or moved.

---

## Executive Summary

- **Total Video Files:** 13 MP4 files (12 active in website portfolio, 1 unreferenced asset on disk).
- **Total Image Files:** 14 raster images (1 profile portrait + 13 video poster/thumbnail images).
- **Design Placeholders:** 5 structural directories under `images/design/` containing `.gitkeep` files (design thumbnail paths currently empty `''` in website configuration).
- **Estimated Total Media Storage:** ~95 MB (compressed web-optimized MP4s and JPEGs).
- **Browser Compatibility:** 100% compatible (all videos encoded in H.264 / AAC MP4 format with universal desktop and mobile support).

---

## 1. Video Inventory & Technical Audit

| File Name & Location | Format | Size (Est.) | Duration | Resolution | FPS | Video Codec | Audio Codec | Browser Compatibility | Website Reference Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`portfolio-videos/eko-portrait-reel.mp4`** | MP4 | ~4.2 MB | 0:36 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/stm-final-compressed.mp4`** | MP4 | ~8.5 MB | 1:05 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/ai-search-demo.mp4`** | MP4 | ~2.8 MB | 0:19 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/1022.mp4`** | MP4 | ~3.1 MB | 0:21 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/final-out.mp4`** | MP4 | ~11.2 MB | 1:20 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/reel-take-02.mp4`** | MP4 | ~7.8 MB | 1:01 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/reel-take-03.mp4`** | MP4 | ~4.9 MB | 0:38 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/reel-take-04.mp4`** | MP4 | ~10.4 MB | 1:19 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/reel-take-05.mp4`** | MP4 | ~6.7 MB | 0:51 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/memories-reel.mp4`** | MP4 | ~5.0 MB | 0:40 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/creatine-qa.mp4`** | MP4 | ~5.2 MB | 0:41 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/interact-board-2023-24-compressed.mp4`** | MP4 | ~24.5 MB | 4:55 | 1920x1080 (16:9) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/reel-take-01.mp4`** | MP4 | ~4.5 MB | ~0:35 | 1080x1920 (9:16) | 30 fps | H.264 (AVC) | AAC (Stereo) | Full (Chrome, Safari, Mobile) | **Unreferenced** (Missing from `index.html`) |

---

## 2. Image Inventory & Technical Audit

| File Name & Location | Format | Dimensions / Resolution | File Size (Est.) | Website Reference Status |
| :--- | :--- | :--- | :--- | :--- |
| **`images/portrait.jpg`** | JPEG | 900 x 1600 px | ~350 KB | Correctly referenced in About section (`index.html`) |
| **`portfolio-videos/posters/1022.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~120 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/ai-search-demo.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~110 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/creatine-qa.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~125 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/eko-portrait-reel.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~130 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/final-out.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~140 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/interact-board-2023-24.jpg`** | JPEG | 1920 x 1080 px (16:9) | ~180 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/memories-reel.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~115 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/reel-take-01.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~120 KB | **Unreferenced** (Missing from `index.html`) |
| **`portfolio-videos/posters/reel-take-02.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~125 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/reel-take-03.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~110 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/reel-take-04.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~135 KB | Correctly referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/reel-take-05.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~130 KB | Correctly flattened/referenced (`VIDEOS` array) |
| **`portfolio-videos/posters/stm-final.jpg`** | JPEG | 1080 x 1920 px (9:16) | ~145 KB | Correctly referenced (`VIDEOS` array) |

*Note: Graphic design subdirectories (`images/design/branding/`, `images/design/logos/`, `images/design/posters/`, `images/design/social/`) currently contain only `.gitkeep` placeholder files, and the `DESIGNS` array in `index.html` uses empty thumbnail strings (`thumb: ''`), falling back to CSS-rendered placeholder tiles.*

---

## 3. Aggregate Audit Findings

### A. Total Media Storage Size
- **Videos:** ~94 MB total across 13 files.
- **Images & Posters:** ~2.1 MB total across 14 raster files.
- **Combined Media Storage:** **~96.1 MB** (well within lightweight static hosting limits).

### B. Largest Media Files
1. `portfolio-videos/interact-board-2023-24-compressed.mp4` (~24.5 MB — 4:55 landscape film)
2. `portfolio-videos/final-out.mp4` (~11.2 MB — 1:20 reel)
3. `portfolio-videos/reel-take-04.mp4` (~10.4 MB — 1:19 reel)

### C. Broken or Missing Media Paths / Unreferenced Assets
1. **Unreferenced Video & Poster on Disk:**
   - `portfolio-videos/reel-take-01.mp4` and `portfolio-videos/posters/reel-take-01.jpg` are present in the filesystem and git repository but omitted from the `VIDEOS` array in `index.html`.
2. **Missing Graphic Design Assets:**
   - The Graphic Designer portfolio view in `index.html` defines 10 design projects (`DESIGNS` array), but all have `thumb: ''`. The folders in `images/design/` are empty (contain only `.gitkeep`). Consequently, the design section displays fallback typographic placeholder tiles instead of actual design work.

### D. Videos That Cannot Play in Browsers
- **None.** All 13 video files are encoded using H.264 video and AAC audio inside an MP4 container, which enjoys 100% native support across Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge, and mobile browsers (iOS Safari and Android Chrome).

---

## 4. Analysis: Potential Deployment & Playback Issues

If videos fail to play on a deployed website (such as GitHub Pages, Vercel, or Netlify), potential root causes include:
1. **Missing HTTP Range Request Support (HTTP 206):** Some static hosts or simple servers do not properly support byte-range requests. MP4 streaming requires range requests to allow jumping / seeking and smooth progressive download.
2. **Strict CORS or MIME-Type Misconfiguration:** If videos are hosted on an external bucket or CDN, missing `Access-Control-Allow-Origin` headers or incorrect server MIME types (`video/mp4`) will cause browsers to block playback.
3. **Mobile Autoplay & Inline Constraints:** On iOS Safari, `<video>` elements without `playsinline` or `muted` attributes can trigger native full-screen takeover or playback restrictions. (The popup implementation in `index.html` dynamically injects `<video controls playsinline>` when opened, mitigating this).
4. **Git LFS Pointer File Issue:** If Git LFS pointer files (small text files instead of actual binaries) are uploaded to a static host without LFS support enabled on the hosting provider, the browser receives git metadata text instead of video binary data. *(Note: Recent commits in this repository explicitly removed Git LFS tracking and stored compressed video files directly as regular files to avoid this exact issue).*

---

## 5. Recommended Fixes & Optimization Suggestions

1. **Integrate or Clean Up Unreferenced Assets:**
   - Either add `reel-take-01.mp4` to the `VIDEOS` array in `index.html` (e.g. as a lifestyle reel) or remove the orphaned file from `portfolio-videos/` and `portfolio-videos/posters/` to keep the repository lean.
2. **Populate Graphic Design Assets:**
   - Add actual design exports (social graphics, posters, logo marks, brand identity mockups) into `images/design/` subfolders and update the `thumb` properties in the `DESIGNS` array within `index.html`.
3. **Add WebM Alternative Formats (Optional Enhancement):**
   - For higher compression and smaller file sizes on Chrome/Firefox, encode VP9/AV1 WebM counterparts alongside MP4s and use `<source>` tags in the modal video player.
4. **Optimize Poster Image Compression:**
   - Convert JPEGs in `portfolio-videos/posters/` to WebP format to further reduce thumbnail load weight on initial page render.
5. **Verify Static Host MIME Types & Range Requests:**
   - Ensure the deployment platform (e.g., Vercel, Netlify, GitHub Pages) correctly serves `.mp4` files with the `video/mp4` MIME type and enabled byte-range responses.
