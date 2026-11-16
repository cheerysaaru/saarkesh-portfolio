/* Portfolio dashboard — edits content.json in the GitHub repo, uploads media to Cloudinary. */
(function () {
  'use strict';

  /* =================================================================== *
   *  state & helpers
   * =================================================================== */
  var CFG_KEY = 'pd.cfg';
  var cfg = readJSON(CFG_KEY) || {};
  var S = {
    published: null, sha: null, draft: null,
    view: 'videos', role: 'video',
    videoFilter: 'all', designTab: null,
    uploads: [], preview: 'desktop', busy: false
  };
  var FONTS = ['Inter Tight', 'Space Grotesk', 'Syne', 'Archivo', 'Bricolage Grotesque', 'Unbounded', 'Sora', 'DM Serif Display', 'Playfair Display'];
  var ACCENTS = ['#37d67a', '#ff8a3d', '#4d8dff', '#ff5fa2', '#c084fc', '#facc15'];
  var LINK_TYPES = ['instagram', 'whatsapp', 'youtube', 'tiktok', 'behance', 'linkedin', 'facebook', 'website'];
  var SECTION_NAMES = {
    about: 'About', contact: 'Contact', experience: 'Experience (What I do)', reels: 'Reels & social',
    films: 'Films & stories', tools: 'Tools', 'experience-design': 'Experience (What I design)',
    work: 'Design work', branding: 'Branding', 'tools-design': 'Tools'
  };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function readJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid(p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function slug(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || uid('c'); }
  function fmtDur(sec) { sec = Math.round(sec || 0); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  function niceName(file) { var n = file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim(); return n.charAt(0).toUpperCase() + n.slice(1); }
  function getPath(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setPath(o, p, v) { var ks = p.split('.'); var last = ks.pop(); var t = ks.reduce(function (a, k) { if (a[k] == null) { a[k] = {}; } return a[k]; }, o); t[last] = v; }
  /* site-relative paths (portfolio-videos/…) live one folder up from /admin/ */
  function abs(u) { if (!u) { return ''; } return /^(https?:|data:|blob:|\/)/.test(u) ? u : '../' + u; }
  function sized(u, w) {
    if (!u || u.indexOf('res.cloudinary.com') === -1 || u.indexOf('/image/upload/') === -1) { return abs(u); }
    return u.replace('/image/upload/', '/image/upload/f_auto,q_auto,c_limit,w_' + w + '/');
  }
  function isCloud(u) { return /res\.cloudinary\.com/.test(u || ''); }
  function applyOrder(arr, order) {
    var pos = order.slice().sort(function (a, b) { return a - b; });
    var out = arr.slice();
    pos.forEach(function (p, i) { out[p] = arr[order[i]]; });
    return out;
  }
  var ICON = {
    grip: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 16V4"/><path d="M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'
  };

  /* ---------- toast / modal / confirm ---------- */
  var toastTimer = null;
  function toast(msg, type, ms) {
    var t = $('#toast');
    t.innerHTML = msg;
    t.className = 'toast' + (type === 'error' ? ' error' : '');
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, ms || 4000);
  }
  function modal(title, body, opts) {
    opts = opts || {};
    var root = $('#modalRoot');
    var wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML = '<div class="modal-card' + (opts.wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="modal-head"><h2>' + esc(title) + '</h2><button type="button" class="icon-btn" data-close aria-label="Close">' + ICON.close + '</button></div>' +
      body + '</div>';
    var last = document.activeElement;
    function close() { wrap.remove(); document.removeEventListener('keydown', onKey); if (last && last.focus) { last.focus(); } if (opts.onClose) { opts.onClose(); } }
    function onKey(e) { if (e.key === 'Escape') { close(); } }
    wrap.addEventListener('click', function (e) { if (e.target === wrap || e.target.closest('[data-close]')) { close(); } });
    document.addEventListener('keydown', onKey);
    root.appendChild(wrap);
    var first = wrap.querySelector('input, select, textarea, button:not([data-close])');
    if (first) { first.focus(); }
    return { el: wrap, close: close };
  }
  function confirmBox(msg, yes, danger) {
    return new Promise(function (resolve) {
      var done = false;
      var m = modal('Are you sure?', '<p style="margin:0;line-height:1.5">' + msg + '</p><div class="modal-foot"><button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn ' + (danger ? 'btn--danger' : 'btn--light') + '" data-yes>' + esc(yes || 'Yes') + '</button></div>',
        { onClose: function () { if (!done) { resolve(false); } } });
      m.el.querySelector('[data-yes]').addEventListener('click', function () { done = true; m.close(); resolve(true); });
    });
  }
  function pickFiles(accept, multiple) {
    return new Promise(function (resolve) {
      var inp = $('#hiddenFile');
      inp.value = '';
      inp.accept = accept; inp.multiple = !!multiple;
      inp.onchange = function () { resolve(Array.prototype.slice.call(inp.files)); };
      inp.click();
    });
  }

  /* =================================================================== *
   *  GitHub
   * =================================================================== */
  function gh(path, opts) {
    opts = opts || {};
    return fetch('https://api.github.com/repos/' + cfg.repo + path, {
      method: opts.method || 'GET',
      cache: 'no-store',
      headers: { 'Authorization': 'Bearer ' + cfg.token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      if (r.status === 404 && opts.allow404) { return null; }
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.message || ('GitHub error ' + r.status)); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  function b64ToText(b) { var bin = atob(b.replace(/\s/g, '')); var bytes = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); } return new TextDecoder().decode(bytes); }
  function textToB64(t) { var bytes = new TextEncoder().encode(t); var bin = ''; for (var i = 0; i < bytes.length; i += 0x8000) { bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); } return btoa(bin); }
  function getFile(path) {
    return gh('/contents/' + path + '?ref=' + encodeURIComponent(cfg.branch) + '&t=' + Date.now(), { allow404: true }).then(function (j) {
      return j ? { text: b64ToText(j.content), sha: j.sha } : null;
    });
  }
  function putFile(path, text, sha, message) {
    var body = { message: message, content: textToB64(text), branch: cfg.branch };
    if (sha) { body.sha = sha; }
    return gh('/contents/' + path, { method: 'PUT', body: body });
  }

  /* =================================================================== *
   *  Cloudinary upload (chunked for big videos, with progress)
   * =================================================================== */
  function cloudReady() {
    if (cfg.cloud && cfg.preset) { return true; }
    toast('Add your Cloudinary details in <b>Settings</b> first, then try again.', 'error', 6000);
    go('settings');
    return false;
  }
  function cloudUpload(file, resource, onProgress) {
    var url = 'https://api.cloudinary.com/v1_1/' + encodeURIComponent(cfg.cloud) + '/' + resource + '/upload';
    var CHUNK = 20 * 1024 * 1024;
    var total = file.size;
    var uploadId = uid('u');
    function send(start) {
      var end = Math.min(start + CHUNK, total);
      var big = total > CHUNK;
      return new Promise(function (resolve, reject) {
        var fd = new FormData();
        fd.append('file', big ? file.slice(start, end) : file, file.name);
        fd.append('upload_preset', cfg.preset);
        fd.append('folder', 'portfolio/' + (resource === 'video' ? 'videos' : 'images'));
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        if (big) {
          xhr.setRequestHeader('X-Unique-Upload-Id', uploadId);
          xhr.setRequestHeader('Content-Range', 'bytes ' + start + '-' + (end - 1) + '/' + total);
        }
        xhr.upload.onprogress = function (e) { if (e.lengthComputable) { onProgress((start + e.loaded) / total); } };
        xhr.onload = function () {
          var j = {}; try { j = JSON.parse(xhr.responseText); } catch (e) {}
          if (xhr.status >= 200 && xhr.status < 300) { resolve(j); }
          else { reject(new Error((j.error && j.error.message) || ('Upload failed (' + xhr.status + ')'))); }
        };
        xhr.onerror = function () { reject(new Error('Network problem — check your connection and try again.')); };
        xhr.send(fd);
      }).then(function (j) { return end < total ? send(end) : j; });
    }
    return send(0).then(function (j) {
      if (!j.secure_url) { throw new Error('Upload finished but Cloudinary sent no link. Check your upload preset is Unsigned.'); }
      return j;
    });
  }
  function friendlyUploadError(msg, resource) {
    if (/file size too large|too large/i.test(msg)) {
      return resource === 'video'
        ? 'Too big for the free Cloudinary plan (100 MB max). Export a smaller version (1080p, lower bitrate) or add it as a YouTube link.'
        : 'Image too big for the free Cloudinary plan (10 MB max). Save it as JPG or a smaller PNG.';
    }
    if (/preset/i.test(msg)) { return 'Upload preset not found or not Unsigned. Check Settings.'; }
    return msg;
  }

  /* upload queue: one file at a time so each finishes fast */
  var queue = Promise.resolve();
  function enqueue(file, resource, onDone) {
    var job = { id: uid('j'), name: file.name, progress: 0, status: 'Waiting…', error: '' };
    S.uploads.push(job);
    renderUploads();
    queue = queue.then(function () {
      job.status = 'Uploading';
      renderUploads();
      return cloudUpload(file, resource, function (p) { job.progress = p; job.status = 'Uploading · ' + Math.round(p * 100) + '%'; updateJob(job); })
        .then(function (res) {
          job.progress = 1; job.status = 'Done'; updateJob(job);
          onDone(res);
          setTimeout(function () { S.uploads = S.uploads.filter(function (j) { return j !== job; }); renderUploads(); }, 1500);
        })
        .catch(function (err) { job.error = friendlyUploadError(err.message, resource); job.status = job.error; renderUploads(); });
    });
  }
  function renderUploads() {
    var box = $('#uploads');
    if (!box) { return; }
    box.innerHTML = S.uploads.map(function (j) {
      return '<div class="up' + (j.error ? ' error' : '') + '" data-job="' + j.id + '"><div class="up-body"><div class="up-top"><b>' + esc(j.name) + '</b><span>' + esc(j.status) + '</span></div>' +
        '<div class="bar"><i style="width:' + Math.round(j.progress * 100) + '%"></i></div></div>' +
        (j.error ? '<button type="button" class="icon-btn" data-dismiss="' + j.id + '" aria-label="Dismiss">' + ICON.close + '</button>' : '') + '</div>';
    }).join('');
  }
  function updateJob(job) {
    var el = $('[data-job="' + job.id + '"]');
    if (!el) { return renderUploads(); }
    el.querySelector('.bar i').style.width = Math.round(job.progress * 100) + '%';
    el.querySelector('.up-top span').textContent = job.status;
  }
  window.addEventListener('beforeunload', function (e) {
    if (S.uploads.some(function (j) { return !j.error && j.status !== 'Done'; })) { e.preventDefault(); e.returnValue = ''; }
  });

  function videoFromUpload(r) {
    var orig = r.secure_url;
    var url = r.format === 'mp4' ? orig : orig.replace('/video/upload/', '/video/upload/f_mp4,vc_h264,q_auto/').replace(/\.[^./]+$/, '.mp4');
    return {
      id: uid('v'), kind: (r.height && r.width && r.width > r.height) ? 'film' : 'reel',
      cat: (S.draft.videoCats[0] || {}).id || 'social',
      title: niceName(r.original_filename || 'New video'), duration: fmtDur(r.duration),
      url: url, orig: orig, thumb: posterAt(orig, 1), hidden: false
    };
  }
  function posterAt(orig, t) {
    return orig.replace('/video/upload/', '/video/upload/so_' + (Math.round(t * 10) / 10) + ',w_720,c_limit,q_auto,f_jpg/').replace(/\.[^./]+$/, '.jpg');
  }
  function youtubeThumb(u) {
    var m = String(u).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
    return m ? 'https://img.youtube.com/vi/' + m[1] + '/hqdefault.jpg' : '';
  }

  /* =================================================================== *
   *  draft handling
   * =================================================================== */
  function draftKey() { return 'pd.draft.' + cfg.repo; }
  function isDirty() { return S.draft && S.published && JSON.stringify(S.draft) !== JSON.stringify(S.published); }
  function changed(rerender) {
    writeJSON(draftKey(), { base: S.sha, content: S.draft });
    updatePublish();
    schedulePreview();
    if (rerender) { render(); }
  }
  function updatePublish() {
    var dirty = isDirty();
    $$('[data-publish]').forEach(function (b) {
      b.disabled = !dirty || S.busy;
      b.innerHTML = S.busy ? '<span class="spin"></span> Publishing…' : dirty ? '<span class="dot"></span> Publish changes' : 'All changes live';
    });
    $('#publishBar').classList.toggle('show', dirty || S.busy);
    var st = $('#statusLine');
    if (st) { st.textContent = dirty ? 'You have unpublished changes' : 'Everything is published'; }
  }

  /* make sure every field the screens use exists */
  function normalize(c) {
    c.site = c.site || {};
    c.site.links = c.site.links || [];
    c.roles = c.roles || {};
    ['video', 'design'].forEach(function (r) {
      var R = c.roles[r] = c.roles[r] || {};
      R.skills = R.skills || []; R.experience = R.experience || []; R.tools = R.tools || [];
    });
    c.videoCats = c.videoCats || [{ id: 'social', label: 'Social' }];
    c.designCats = c.designCats || [{ id: 'social', label: 'Social' }];
    c.videos = (c.videos || []).map(function (v) { v.id = v.id || uid('v'); return v; });
    c.designs = (c.designs || []).map(function (d) { d.id = d.id || uid('d'); return d; });
    var L = c.layout = c.layout || {};
    var defs = { accent: '#37d67a', headingFont: 'Inter Tight', defaultTheme: 'dark', radius: 18, reelCols: 4, designCols: 3, reelStyle: 'grid', designStyle: 'grid', hoverPreview: true };
    Object.keys(defs).forEach(function (k) { if (L[k] == null) { L[k] = defs[k]; } });
    L.sections = L.sections || {};
    var secDefs = { video: ['about', 'experience', 'reels', 'films', 'tools', 'contact'], design: ['about', 'experience-design', 'work', 'branding', 'tools-design', 'contact'] };
    Object.keys(secDefs).forEach(function (r) {
      var list = L.sections[r] = L.sections[r] || [];
      secDefs[r].forEach(function (id) { if (!list.some(function (s) { return s.id === id; })) { list.push({ id: id, show: true }); } });
    });
    return c;
  }

  /* =================================================================== *
   *  publish
   * =================================================================== */
  function seoBlock(c) {
    var R = c.roles.video;
    var img = c.site.shareImage ? (isCloud(c.site.shareImage) ? c.site.shareImage.replace('/image/upload/', '/image/upload/c_fill,w_1200,h_630,f_jpg,q_auto/') : c.site.shareImage) : '';
    return '<!--SEO-START-->\n' +
      '<title>' + esc(R.seoTitle) + '</title>\n' +
      '<meta name="description" content="' + esc(R.seoDesc) + '">\n' +
      '<meta property="og:title" content="' + esc(R.seoTitle) + '">\n' +
      '<meta property="og:description" content="' + esc(R.seoDesc) + '">\n' +
      '<meta property="og:type" content="website">\n' +
      (img ? '<meta property="og:image" content="' + esc(img) + '">\n<meta name="twitter:card" content="summary_large_image">\n' : '') +
      '<!--SEO-END-->';
  }
  function publish() {
    if (!isDirty() || S.busy) { return; }
    S.busy = true; updatePublish();
    var c = S.draft;
    getFile('content.json').then(function (remote) {
      if (remote && S.sha && remote.sha !== S.sha) {
        return confirmBox('Your content was changed somewhere else (another device or a code push) after you opened the dashboard. Publish anyway and replace it with this version?', 'Publish anyway').then(function (ok) {
          if (!ok) { throw new Error('cancelled'); }
          return remote;
        });
      }
      return remote;
    }).then(function (remote) {
      return putFile('content.json', JSON.stringify(c, null, 2) + '\n', remote && remote.sha, 'Update portfolio content from dashboard');
    }).then(function (res) {
      S.sha = res.content.sha;
      S.published = clone(c);
      writeJSON(draftKey(), null);
      /* keep <title>, description and the share preview in index.html in step (crawlers don't run JS) */
      return getFile('index.html').then(function (f) {
        if (!f || f.text.indexOf('<!--SEO-START-->') === -1) { return; }
        var next = f.text.replace(/<!--SEO-START-->[\s\S]*?<!--SEO-END-->/, seoBlock(c));
        if (next !== f.text) { return putFile('index.html', next, f.sha, 'Update page title and share preview from dashboard'); }
      }).catch(function (e) { console.warn('SEO update skipped', e); });
    }).then(function () {
      toast('Published! Your site updates in about a minute. <a href="../" target="_blank" rel="noopener noreferrer">Open site ↗</a>', null, 7000);
    }).catch(function (e) {
      if (e.message !== 'cancelled') { toast('Could not publish: ' + esc(e.message), 'error', 8000); }
    }).then(function () {
      S.busy = false; updatePublish();
    });
  }

  /* =================================================================== *
   *  drag-to-reorder (mouse + touch)
   * =================================================================== */
  function sortable(container, itemSel, onDone) {
    if (!container) { return; }
    container.addEventListener('pointerdown', function (e) {
      var h = e.target.closest('.handle');
      if (!h || !container.contains(h)) { return; }
      var item = h.closest(itemSel);
      if (!item) { return; }
      e.preventDefault();
      item.classList.add('dragging');
      var moved = false;
      function siblings() { return Array.prototype.filter.call(item.parentNode.children, function (c) { return c.matches(itemSel); }); }
      function move(ev) {
        if (ev.clientY < 70) { window.scrollBy(0, -12); } else if (ev.clientY > window.innerHeight - 70) { window.scrollBy(0, 12); }
        var el = document.elementFromPoint(ev.clientX, ev.clientY);
        var over = el && el.closest(itemSel);
        if (!over || over === item || over.parentNode !== item.parentNode) { return; }
        var list = siblings();
        if (list.indexOf(item) < list.indexOf(over)) { over.after(item); } else { over.before(item); }
        moved = true;
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        item.classList.remove('dragging');
        if (moved) { onDone(siblings().map(function (c) { return Number(c.dataset.idx); })); }
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
  }

  function dropZone(el, accept, onFiles) {
    if (!el) { return; }
    ['dragenter', 'dragover'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.preventDefault(); el.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.preventDefault(); if (ev === 'dragleave' && el.contains(e.relatedTarget)) { return; } el.classList.remove('over'); }); });
    el.addEventListener('drop', function (e) {
      var files = Array.prototype.filter.call(e.dataTransfer.files, function (f) { return accept.test(f.type) || accept.test(f.name); });
      if (!files.length) { toast('Those files are not the right type here.', 'error'); return; }
      onFiles(files);
    });
  }

  /* =================================================================== *
   *  views
   * =================================================================== */
  function go(view) { S.view = view; render(); $('#main').focus({ preventScroll: true }); window.scrollTo(0, 0); }
  function header(title, sub, extra) {
    return '<header class="top"><div><h1>' + title + '</h1><p>' + sub + '</p></div><div class="top-actions">' + (extra || '') +
      '<a class="btn" href="../" target="_blank" rel="noopener noreferrer">View site ↗</a><button class="btn btn--green pub" type="button" data-publish></button></div></header>';
  }
  function roleSeg() {
    return '<div class="seg" role="group" aria-label="Which portfolio">' +
      ['video', 'design'].map(function (r) { return '<button type="button" data-role="' + r + '" aria-pressed="' + (S.role === r) + '">' + (r === 'video' ? 'Video Editor' : 'Graphic Designer') + '</button>'; }).join('') + '</div>';
  }
  function field(label, path, opts) {
    opts = opts || {};
    var v = getPath(S.draft, path);
    var attrs = ' data-bind="' + path + '"' + (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '');
    var input = opts.area
      ? '<textarea rows="' + (opts.rows || 4) + '"' + attrs + '>' + esc(v) + '</textarea>'
      : '<input type="' + (opts.type || 'text') + '"' + attrs + ' value="' + esc(v) + '">';
    return '<label class="field"><span>' + label + '</span>' + input + (opts.hint ? '<p class="hint">' + opts.hint + '</p>' : '') + '</label>';
  }
  function toggle(label, path, rerender) {
    return '<label class="switch"><span>' + label + '</span><input type="checkbox" data-bind="' + path + '"' + (rerender ? ' data-rerender' : '') + (getPath(S.draft, path) ? ' checked' : '') + '></label>';
  }

  function render() {
    $$('#nav [data-view]').forEach(function (b) { if (b.dataset.view === S.view) { b.setAttribute('aria-current', 'page'); } else { b.removeAttribute('aria-current'); } });
    var c = S.draft;
    $('#brandName').textContent = c.site.name || 'Portfolio';
    $('#brandMark').textContent = (c.site.name || 'S').charAt(0);
    var html = ({ videos: viewVideos, designs: viewDesigns, experience: viewExperience, content: viewContent, layout: viewLayout, settings: viewSettings })[S.view]();
    $('#main').innerHTML = html;
    renderUploads();
    updatePublish();
    mount();
  }

  /* ---------- Videos ---------- */
  function viewVideos() {
    var c = S.draft, f = S.videoFilter;
    var items = c.videos.map(function (v, i) { return { v: v, i: i }; }).filter(function (x) {
      if (f === 'all') { return true; }
      if (f === 'hidden') { return x.v.hidden; }
      if (f === 'film') { return x.v.kind === 'film'; }
      return x.v.kind === 'reel' && x.v.cat === f;
    });
    function count(fn) { return c.videos.filter(fn).length; }
    var chips = [['all', 'All', c.videos.length]].concat(c.videoCats.map(function (k) { return [k.id, k.label, count(function (v) { return v.kind === 'reel' && v.cat === k.id; })]; }))
      .concat([['film', 'Films (wide)', count(function (v) { return v.kind === 'film'; })], ['hidden', 'Hidden', count(function (v) { return v.hidden; })]]);
    var catLabel = {}; c.videoCats.forEach(function (k) { catLabel[k.id] = k.label; });
    return header('Videos', 'Drag tiles by the dots to reorder. Changes go live when you press Publish.') +
      '<section class="drop" id="vDrop"><div class="drop-ico">' + ICON.up + '</div><b>Drop videos here</b>' +
      '<p class="hint">MP4 works best (MOV/WebM are converted). The thumbnail and length are picked up automatically. Free plan: up to 100 MB per video.</p>' +
      '<div class="drop-actions"><button class="btn btn--light" type="button" data-act="pick-videos">Choose files</button><button class="btn" type="button" data-act="add-link">' + ICON.link + ' Add YouTube / Vimeo / Instagram link</button></div></section>' +
      '<div class="uploads" id="uploads"></div>' +
      '<div class="toolbar"><div class="chips" role="group" aria-label="Filter">' +
      chips.map(function (ch) { return '<button type="button" class="chip" data-vfilter="' + esc(ch[0]) + '" aria-pressed="' + (f === ch[0]) + '">' + esc(ch[1]) + ' · ' + ch[2] + '</button>'; }).join('') +
      '</div><button class="btn btn--sm" type="button" data-act="video-cats">Edit categories</button></div>' +
      (items.length ? '<div class="grid" id="vGrid">' + items.map(function (x) {
        var v = x.v;
        return '<article class="m m--' + (v.kind === 'film' ? 'film' : 'reel') + (v.hidden ? ' is-hidden' : '') + '" data-idx="' + x.i + '">' +
          '<div class="m-media">' + (v.thumb ? '<img src="' + esc(sized(v.thumb, 400)) + '" alt="" loading="lazy">' : '<span class="ph">' + esc((v.title || '?').charAt(0)) + '</span>') +
          '<div class="m-over"><div class="m-row"><span class="icon-btn handle" aria-label="Drag to reorder" title="Drag to reorder">' + ICON.grip + '</span>' +
          '<span style="display:flex;gap:6px">' + (v.hidden ? '<span class="pill-s">Hidden</span>' : '') + '<span class="pill-s">' + esc(v.duration || '') + '</span></span></div>' +
          '<div class="m-acts"><button type="button" class="icon-btn" data-vhide="' + x.i + '" aria-label="' + (v.hidden ? 'Show on site' : 'Hide from site') + '" title="' + (v.hidden ? 'Show on site' : 'Hide from site') + '">' + (v.hidden ? ICON.eyeOff : ICON.eye) + '</button>' +
          '<button type="button" class="icon-btn" data-vedit="' + x.i + '" aria-label="Edit" title="Edit">' + ICON.edit + '</button>' +
          '<button type="button" class="icon-btn danger" data-vdel="' + x.i + '" aria-label="Delete" title="Delete">' + ICON.trash + '</button></div></div></div>' +
          '<div class="m-title">' + esc(v.title) + '</div><div class="m-sub">' + (v.kind === 'film' ? 'Film (wide)' : esc(catLabel[v.cat] || v.cat) + ' reel') + '</div></article>';
      }).join('') + '</div>' : '<div class="empty">Nothing here yet.</div>');
  }

  function editVideo(i) {
    var v = clone(S.draft.videos[i]);
    var c = S.draft;
    var body = '<label class="field"><span>Title</span><input type="text" id="evTitle" value="' + esc(v.title) + '"></label>' +
      '<div class="row2"><label class="field"><span>Shape</span><select id="evKind"><option value="reel"' + (v.kind === 'reel' ? ' selected' : '') + '>Reel (tall 9:16)</option><option value="film"' + (v.kind === 'film' ? ' selected' : '') + '>Film (wide 16:9)</option></select></label>' +
      '<label class="field"><span>Category</span><select id="evCat">' + c.videoCats.map(function (k) { return '<option value="' + esc(k.id) + '"' + (k.id === v.cat ? ' selected' : '') + '>' + esc(k.label) + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="row2"><label class="field"><span>Length</span><input type="text" id="evDur" value="' + esc(v.duration) + '" placeholder="0:30"></label>' +
      '<label class="switch" style="align-self:end"><span>Hide from site</span><input type="checkbox" id="evHidden"' + (v.hidden ? ' checked' : '') + '></label></div>' +
      '<label class="field"><span>Video link</span><input type="text" id="evUrl" value="' + esc(v.url) + '"><p class="hint">Uploaded file, or a YouTube / Vimeo / Instagram link.</p></label>' +
      '<div class="field"><span>Thumbnail</span><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">' +
      '<div style="width:96px;aspect-ratio:' + (v.kind === 'film' ? '16/9' : '9/16') + ';border-radius:12px;overflow:hidden;background:var(--tile2)" id="evThumbBox">' + (v.thumb ? '<img src="' + esc(sized(v.thumb, 300)) + '" alt="" style="width:100%;height:100%;object-fit:cover">' : '') + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px"><button type="button" class="btn btn--sm" id="evFrame">Pick a frame from the video</button><button type="button" class="btn btn--sm" id="evThumbUp">' + ICON.image + ' Upload an image</button></div></div></div>' +
      '<div class="modal-foot"><button type="button" class="btn grow" id="evReplace">' + ICON.up + ' Replace video file</button><button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn btn--light" id="evSave">Save</button></div>';
    var m = modal('Edit video', body, { wide: true });
    var el = m.el;
    function setThumb(u) { v.thumb = u; $('#evThumbBox', el).innerHTML = '<img src="' + esc(sized(u, 300)) + '" alt="" style="width:100%;height:100%;object-fit:cover">'; }
    $('#evThumbUp', el).onclick = function () {
      if (!cloudReady()) { return; }
      pickFiles('image/*').then(function (files) {
        if (!files[0]) { return; }
        $('#evThumbUp', el).innerHTML = '<span class="spin"></span> Uploading…';
        cloudUpload(files[0], 'image', function () {}).then(function (r) { setThumb(r.secure_url); })
          .catch(function (e) { toast(esc(friendlyUploadError(e.message, 'image')), 'error'); })
          .then(function () { $('#evThumbUp', el).innerHTML = ICON.image + ' Upload an image'; });
      });
    };
    $('#evFrame', el).onclick = function () {
      var src = $('#evUrl', el).value.trim();
      if (!/\.(mp4|webm|m4v|mov)(\?|$)/i.test(src)) { toast('Frame picking works for uploaded video files. For YouTube links, upload an image instead.', 'error'); return; }
      framePicker(v, src, setThumb);
    };
    $('#evReplace', el).onclick = function () {
      if (!cloudReady()) { return; }
      pickFiles('video/*').then(function (files) {
        if (!files[0]) { return; }
        m.close();
        toast('Uploading the new video — it replaces the old one when done.');
        enqueue(files[0], 'video', function (r) {
          var nv = videoFromUpload(r);
          var cur = S.draft.videos.filter(function (x) { return x.id === v.id; })[0];
          if (!cur) { return; }
          cur.url = nv.url; cur.orig = nv.orig; cur.thumb = nv.thumb; cur.duration = nv.duration;
          changed(true);
        });
      });
    };
    $('#evSave', el).onclick = function () {
      var cur = S.draft.videos.filter(function (x) { return x.id === v.id; })[0];
      if (!cur) { return m.close(); }
      cur.title = $('#evTitle', el).value.trim() || 'Untitled';
      cur.kind = $('#evKind', el).value;
      cur.cat = $('#evCat', el).value;
      cur.duration = $('#evDur', el).value.trim();
      cur.hidden = $('#evHidden', el).checked;
      var nu = $('#evUrl', el).value.trim();
      if (nu !== cur.url) { cur.url = nu; if (!isCloud(nu)) { delete cur.orig; } if (!v.thumb || v.thumb === cur.thumb) { var yt = youtubeThumb(nu); if (yt) { v.thumb = yt; } } }
      cur.thumb = v.thumb;
      m.close();
      changed(true);
    };
  }

  function framePicker(v, src, done) {
    var body = '<div class="frame-picker"><video id="fpVid" src="' + esc(abs(src)) + '" controls playsinline muted preload="metadata"' + (isCloud(src) ? '' : ' crossorigin="anonymous"') + '></video></div>' +
      '<p class="hint">Play or scrub to the moment you want, then press “Use this frame”.</p>' +
      '<div class="modal-foot"><button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn btn--light" id="fpUse">Use this frame</button></div>';
    var m = modal('Pick a thumbnail frame', body, { wide: true });
    var vid = $('#fpVid', m.el);
    $('#fpUse', m.el).onclick = function () {
      var t = vid.currentTime || 0;
      if (v.orig || isCloud(src)) {
        var base = v.orig || src.replace(/\/video\/upload\/[^/]*[_,][^/]*\//, '/video/upload/');
        done(posterAt(base, t));
        m.close();
        return;
      }
      /* video stored in the repo: grab the frame and upload it as an image */
      if (!cloudReady()) { return; }
      try {
        var cv = document.createElement('canvas');
        cv.width = vid.videoWidth; cv.height = vid.videoHeight;
        cv.getContext('2d').drawImage(vid, 0, 0);
        cv.toBlob(function (blob) {
          var btn = $('#fpUse', m.el); btn.innerHTML = '<span class="spin"></span> Saving…';
          var file = new File([blob], 'thumb.jpg', { type: 'image/jpeg' });
          cloudUpload(file, 'image', function () {}).then(function (r) { done(r.secure_url); m.close(); })
            .catch(function (e) { toast(esc(e.message), 'error'); btn.textContent = 'Use this frame'; });
        }, 'image/jpeg', 0.88);
      } catch (e) { toast('Could not grab that frame. Upload an image instead.', 'error'); }
    };
  }

  function addLink() {
    var c = S.draft;
    var body = '<label class="field"><span>Link</span><input type="url" id="alUrl" placeholder="https://youtube.com/watch?v=…"></label>' +
      '<label class="field"><span>Title</span><input type="text" id="alTitle"></label>' +
      '<div class="row2"><label class="field"><span>Shape</span><select id="alKind"><option value="film">Film (wide 16:9)</option><option value="reel">Reel (tall 9:16)</option></select></label>' +
      '<label class="field"><span>Category</span><select id="alCat">' + c.videoCats.map(function (k) { return '<option value="' + esc(k.id) + '">' + esc(k.label) + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="field"><span>Length (optional)</span><input type="text" id="alDur" placeholder="4:55"></label>' +
      '<p class="hint">YouTube links get their thumbnail automatically. You can change it after adding.</p>' +
      '<div class="modal-foot"><button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn btn--light" id="alAdd">Add video</button></div>';
    var m = modal('Add a video link', body);
    $('#alAdd', m.el).onclick = function () {
      var u = $('#alUrl', m.el).value.trim();
      if (!/^https?:\/\//.test(u)) { toast('Paste a full link starting with https://', 'error'); return; }
      c.videos.unshift({ id: uid('v'), kind: $('#alKind', m.el).value, cat: $('#alCat', m.el).value, title: $('#alTitle', m.el).value.trim() || 'New video', duration: $('#alDur', m.el).value.trim(), url: u, thumb: youtubeThumb(u), hidden: false });
      m.close(); changed(true);
    };
  }

  function editCats(key, title) {
    var cats = clone(S.draft[key]);
    function rows() {
      return cats.map(function (k, i) {
        return '<div class="li" data-i="' + i + '"><div class="li-body"><input class="input" type="text" value="' + esc(k.label) + '" data-catlabel="' + i + '" aria-label="Category name"></div>' +
          '<button type="button" class="icon-btn danger" data-catdel="' + i + '" aria-label="Delete category">' + ICON.trash + '</button></div>';
      }).join('');
    }
    var body = '<div class="list" id="catList">' + rows() + '</div><button type="button" class="btn btn--dashed" id="catAdd">+ Add category</button>' +
      '<p class="hint">Deleting a category moves its items to the first category.</p>' +
      '<div class="modal-foot"><button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn btn--light" id="catSave">Save</button></div>';
    var m = modal(title, body);
    var list = $('#catList', m.el);
    m.el.addEventListener('input', function (e) { var i = e.target.dataset.catlabel; if (i != null) { cats[i].label = e.target.value; } });
    m.el.addEventListener('click', function (e) {
      var d = e.target.closest('[data-catdel]');
      if (d) { if (cats.length < 2) { toast('Keep at least one category.', 'error'); return; } cats.splice(Number(d.dataset.catdel), 1); list.innerHTML = rows(); }
    });
    $('#catAdd', m.el).onclick = function () { cats.push({ id: '', label: 'New category' }); list.innerHTML = rows(); var ins = $$('input', list); ins[ins.length - 1].select(); };
    $('#catSave', m.el).onclick = function () {
      var used = {};
      cats.forEach(function (k) { k.label = k.label.trim() || 'Untitled'; if (!k.id) { k.id = slug(k.label); } while (used[k.id]) { k.id += '-2'; } used[k.id] = true; });
      var first = cats[0].id;
      var items = key === 'videoCats' ? S.draft.videos : S.draft.designs;
      items.forEach(function (it) { if (it.kind !== 'brand' && !used[it.cat]) { it.cat = first; } });
      S.draft[key] = cats;
      if (key === 'designCats' && S.designTab !== '__brand' && !used[S.designTab]) { S.designTab = first; }
      if (key === 'videoCats' && !/^(all|film|hidden)$/.test(S.videoFilter) && !used[S.videoFilter]) { S.videoFilter = 'all'; }
      m.close(); changed(true);
    };
  }

  /* ---------- Designs ---------- */
  function designTabs() { return S.draft.designCats.map(function (k) { return { id: k.id, label: k.label }; }).concat([{ id: '__brand', label: 'Branding (wide)' }]); }
  function inTab(d, tab) { return tab === '__brand' ? d.kind === 'brand' : (d.kind !== 'brand' && d.cat === tab); }
  function viewDesigns() {
    var c = S.draft;
    var tabs = designTabs();
    if (!S.designTab || !tabs.some(function (t) { return t.id === S.designTab; })) { S.designTab = tabs[0].id; }
    var tab = S.designTab;
    var label = tabs.filter(function (t) { return t.id === tab; })[0].label;
    var items = c.designs.map(function (d, i) { return { d: d, i: i }; }).filter(function (x) { return inTab(x.d, tab); });
    return header('Graphic designs', 'Pick a category, drop images in. Drag by the dots to change the order.') +
      '<div class="toolbar"><div class="seg" role="tablist" aria-label="Design categories">' + tabs.map(function (t) {
        var n = c.designs.filter(function (d) { return inTab(d, t.id); }).length;
        return '<button type="button" role="tab" data-dtab="' + esc(t.id) + '" aria-pressed="' + (t.id === tab) + '" aria-selected="' + (t.id === tab) + '">' + esc(t.label) + ' · ' + n + '</button>';
      }).join('') + '</div><button class="btn btn--sm" type="button" data-act="design-cats">Edit categories</button></div>' +
      '<section class="drop" id="dDrop"><div class="drop-ico">' + ICON.up + '</div><b>Drop images into “' + esc(label) + '”</b>' +
      '<p class="hint">PNG, JPG or WebP · up to 10 MB each on the free plan · shown at web size automatically.</p>' +
      '<div class="drop-actions"><button class="btn btn--light" type="button" data-act="pick-designs">Choose files</button></div></section>' +
      '<div class="uploads" id="uploads"></div>' +
      (items.length ? '<div class="grid' + (tab === '__brand' ? ' grid--wide' : '') + '" id="dGrid">' + items.map(function (x) {
        var d = x.d;
        return '<article class="m ' + (d.kind === 'brand' ? 'm--brand' : 'm--design') + (d.hidden ? ' is-hidden' : '') + '" data-idx="' + x.i + '">' +
          '<div class="m-media">' + (d.thumb ? '<img src="' + esc(sized(d.thumb, 500)) + '" alt="" loading="lazy">' : '<span class="ph">' + esc((d.title || '?').charAt(0)) + '</span>') +
          '<div class="m-over"><div class="m-row"><span class="icon-btn handle" aria-label="Drag to reorder" title="Drag to reorder">' + ICON.grip + '</span>' + (d.hidden ? '<span class="pill-s">Hidden</span>' : '') + '</div>' +
          '<div class="m-acts"><button type="button" class="icon-btn" data-dhide="' + x.i + '" aria-label="' + (d.hidden ? 'Show on site' : 'Hide from site') + '">' + (d.hidden ? ICON.eyeOff : ICON.eye) + '</button>' +
          '<button type="button" class="icon-btn" data-dedit="' + x.i + '" aria-label="Edit">' + ICON.edit + '</button>' +
          '<button type="button" class="icon-btn danger" data-ddel="' + x.i + '" aria-label="Delete">' + ICON.trash + '</button></div></div></div>' +
          '<div class="m-title">' + esc(d.title) + '</div><div class="m-sub">' + esc(d.label || '') + '</div></article>';
      }).join('') + '</div>' : '<div class="empty">No designs in “' + esc(label) + '” yet — drop some images above.</div>');
  }
  function addDesignFiles(files) {
    if (!cloudReady()) { return; }
    var tab = S.designTab;
    var label = tab === '__brand' ? 'Branding' : (S.draft.designCats.filter(function (k) { return k.id === tab; })[0] || {}).label || 'Design';
    files.forEach(function (f) {
      enqueue(f, 'image', function (r) {
        S.draft.designs.unshift({ id: uid('d'), kind: tab === '__brand' ? 'brand' : 'work', cat: tab === '__brand' ? 'branding' : tab, title: niceName(r.original_filename || f.name), label: label.replace(/s$/, ''), thumb: r.secure_url, hidden: false });
        changed(true);
      });
    });
  }
  function editDesign(i) {
    var d = clone(S.draft.designs[i]);
    var tabs = designTabs();
    var cur = d.kind === 'brand' ? '__brand' : d.cat;
    var body = '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start"><div id="edImg" style="width:160px;border-radius:14px;overflow:hidden;background:var(--tile2)">' + (d.thumb ? '<img src="' + esc(sized(d.thumb, 400)) + '" alt="" style="width:100%;display:block">' : '') + '</div>' +
      '<div style="flex:1 1 220px;display:flex;flex-direction:column;gap:12px">' +
      '<label class="field"><span>Title</span><input type="text" id="edTitle" value="' + esc(d.title) + '"></label>' +
      '<label class="field"><span>Small label on the tile</span><input type="text" id="edLabel" value="' + esc(d.label) + '" placeholder="Poster"></label>' +
      '<label class="field"><span>Category</span><select id="edCat">' + tabs.map(function (t) { return '<option value="' + esc(t.id) + '"' + (t.id === cur ? ' selected' : '') + '>' + esc(t.label) + '</option>'; }).join('') + '</select></label>' +
      '<label class="switch"><span>Hide from site</span><input type="checkbox" id="edHidden"' + (d.hidden ? ' checked' : '') + '></label></div></div>' +
      '<div class="modal-foot"><button type="button" class="btn grow" id="edReplace">' + ICON.image + ' Replace image</button><button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn btn--light" id="edSave">Save</button></div>';
    var m = modal('Edit design', body, { wide: true });
    $('#edReplace', m.el).onclick = function () {
      if (!cloudReady()) { return; }
      pickFiles('image/*').then(function (files) {
        if (!files[0]) { return; }
        var b = $('#edReplace', m.el); b.innerHTML = '<span class="spin"></span> Uploading…';
        cloudUpload(files[0], 'image', function () {}).then(function (r) {
          d.thumb = r.secure_url; $('#edImg', m.el).innerHTML = '<img src="' + esc(sized(d.thumb, 400)) + '" alt="" style="width:100%;display:block">';
        }).catch(function (e) { toast(esc(friendlyUploadError(e.message, 'image')), 'error'); }).then(function () { b.innerHTML = ICON.image + ' Replace image'; });
      });
    };
    $('#edSave', m.el).onclick = function () {
      var t = S.draft.designs.filter(function (x) { return x.id === d.id; })[0];
      if (!t) { return m.close(); }
      var cat = $('#edCat', m.el).value;
      t.title = $('#edTitle', m.el).value.trim() || 'Untitled';
      t.label = $('#edLabel', m.el).value.trim();
      t.kind = cat === '__brand' ? 'brand' : 'work';
      t.cat = cat === '__brand' ? 'branding' : cat;
      t.hidden = $('#edHidden', m.el).checked;
      t.thumb = d.thumb;
      m.close(); changed(true);
    };
  }

  /* ---------- Experience & tools ---------- */
  function toolIcon(t) {
    if (t.icon && /[/.]/.test(t.icon)) { return '<span class="tool-ico"><img src="' + esc(sized(t.icon, 64)) + '" alt=""></span>'; }
    if (t.icon && window.TOOL_ICONS && window.TOOL_ICONS[t.icon]) { return '<span class="tool-ico">' + window.TOOL_ICONS[t.icon] + '</span>'; }
    return '<span class="tool-ico">' + esc((t.name || '?').slice(0, 2)) + '</span>';
  }
  function viewExperience() {
    var r = S.role, R = S.draft.roles[r], p = 'roles.' + r + '.';
    var exp = R.experience.map(function (x, i) {
      return '<div class="li' + (x.hidden ? ' is-hidden' : '') + '" data-idx="' + i + '"><span class="handle" aria-label="Drag to reorder" title="Drag to reorder" style="width:20px;height:20px">' + ICON.grip + '</span>' +
        '<div class="li-body"><div class="row2">' + field('Title', p + 'experience.' + i + '.title') + field('Tag', p + 'experience.' + i + '.tag', { placeholder: 'Main work' }) + '</div>' +
        field('Role', p + 'experience.' + i + '.role') + field('Description', p + 'experience.' + i + '.desc', { area: true, rows: 3 }) + '</div>' +
        '<div class="li-acts" style="flex-direction:column"><button type="button" class="icon-btn" data-exphide="' + i + '" aria-label="' + (x.hidden ? 'Show' : 'Hide') + '">' + (x.hidden ? ICON.eyeOff : ICON.eye) + '</button>' +
        '<button type="button" class="icon-btn danger" data-expdel="' + i + '" aria-label="Delete card">' + ICON.trash + '</button></div></div>';
    }).join('');
    var tools = R.tools.map(function (t, i) {
      return '<span class="tool-chip' + (t.hidden ? ' is-hidden' : '') + '" data-idx="' + i + '"><span class="handle" style="display:flex;color:var(--muted);width:16px" aria-label="Drag to reorder">' + ICON.grip + '</span>' + toolIcon(t) +
        '<span>' + esc(t.name) + '</span><button type="button" class="icon-btn" style="background:transparent" data-tooledit="' + i + '" aria-label="Edit ' + esc(t.name) + '">' + ICON.edit + '</button></span>';
    }).join('');
    var headings = r === 'video'
      ? '<div class="row2">' + field('Reels label', p + 'workLabel') + field('Reels heading', p + 'workHeading') + '</div><div class="row2">' + field('Films label', p + 'filmsLabel') + field('Films heading', p + 'filmsHeading') + '</div>'
      : '<div class="row2">' + field('Work label', p + 'workLabel') + field('Work heading', p + 'workHeading') + '</div><div class="row2">' + field('Branding label', p + 'brandLabel') + field('Branding heading', p + 'brandHeading') + '</div>';
    return header('Experience &amp; tools', 'Your “What I do” cards and toolkit. Each portfolio has its own.', roleSeg()) +
      '<div class="grid-2">' +
      '<section class="card"><h2>Experience cards</h2><div class="row2">' + field('Small label', p + 'experienceLabel') + field('Heading', p + 'experienceHeading') + '</div>' +
      '<div class="list" id="expList">' + (exp || '<div class="empty">No cards yet.</div>') + '</div><button type="button" class="btn btn--dashed" data-act="exp-add">+ Add card</button></section>' +
      '<div style="display:flex;flex-direction:column;gap:18px">' +
      '<section class="card"><h2>Toolkit</h2><div class="row2">' + field('Small label', p + 'toolsLabel') + field('Heading', p + 'toolsHeading') + '</div>' +
      '<div class="chips" id="toolList">' + tools + '<button type="button" class="btn btn--dashed" data-act="tool-add">+ Add tool</button></div>' +
      '<p class="hint">Drag by the dots to reorder. Tap the pencil to rename, change the icon or remove.</p></section>' +
      '<section class="card"><h2>Work section headings</h2>' + headings + '</section></div></div>';
  }
  function editTool(i) {
    var list = S.draft.roles[S.role].tools;
    var isNew = i == null;
    var t = isNew ? { name: '', icon: '', hidden: false } : clone(list[i]);
    var builtins = Object.keys(window.TOOL_ICONS || {}).filter(function (k) { return k !== 'pen'; }).concat(['pen']);
    function grid() {
      return '<div class="chips">' + builtins.map(function (k) {
        return '<button type="button" class="chip" data-icon="' + k + '" aria-pressed="' + (t.icon === k) + '"><span class="tool-ico" style="background:transparent">' + window.TOOL_ICONS[k] + '</span>' + esc(k.replace(/-/g, ' ')) + '</button>';
      }).join('') + '<button type="button" class="chip" data-icon="" aria-pressed="' + (!t.icon) + '">No icon</button>' +
        (t.icon && /[/.]/.test(t.icon) ? '<span class="chip" aria-pressed="true">' + toolIcon(t) + 'Your image</span>' : '') + '</div>';
    }
    var body = '<label class="field"><span>Tool name</span><input type="text" id="etName" value="' + esc(t.name) + '" placeholder="Final Cut Pro"></label>' +
      '<div class="field"><span>Icon</span><div id="etIcons">' + grid() + '</div><button type="button" class="btn btn--sm" id="etUp" style="align-self:flex-start">' + ICON.image + ' Upload a logo (PNG/SVG)</button></div>' +
      (isNew ? '' : '<label class="switch"><span>Hide from site</span><input type="checkbox" id="etHidden"' + (t.hidden ? ' checked' : '') + '></label>') +
      '<div class="modal-foot">' + (isNew ? '' : '<button type="button" class="btn btn--danger grow" id="etDel">Remove tool</button>') + '<button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn btn--light" id="etSave">' + (isNew ? 'Add tool' : 'Save') + '</button></div>';
    var m = modal(isNew ? 'Add a tool' : 'Edit tool', body);
    m.el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-icon]');
      if (b) { t.icon = b.dataset.icon; $('#etIcons', m.el).innerHTML = grid(); }
    });
    $('#etUp', m.el).onclick = function () {
      if (!cloudReady()) { return; }
      pickFiles('image/*').then(function (files) {
        if (!files[0]) { return; }
        var b = $('#etUp', m.el); b.innerHTML = '<span class="spin"></span> Uploading…';
        cloudUpload(files[0], 'image', function () {}).then(function (r) { t.icon = r.secure_url; $('#etIcons', m.el).innerHTML = grid(); })
          .catch(function (e) { toast(esc(friendlyUploadError(e.message, 'image')), 'error'); }).then(function () { b.innerHTML = ICON.image + ' Upload a logo (PNG/SVG)'; });
      });
    };
    if (!isNew) { $('#etDel', m.el).onclick = function () { list.splice(i, 1); m.close(); changed(true); }; }
    $('#etSave', m.el).onclick = function () {
      t.name = $('#etName', m.el).value.trim();
      if (!t.name) { toast('Give the tool a name.', 'error'); return; }
      if (!isNew) { t.hidden = $('#etHidden', m.el).checked; list[i] = t; } else { list.push(t); }
      m.close(); changed(true);
    };
  }

  /* ---------- Site text & profile ---------- */
  function viewContent() {
    var r = S.role, p = 'roles.' + r + '.', s = S.draft.site;
    var skills = S.draft.roles[r].skills.map(function (k, i) { return '<span class="chip chip--edit">' + esc(k) + '<button type="button" class="x" data-skilldel="' + i + '" aria-label="Remove ' + esc(k) + '">×</button></span>'; }).join('');
    var links = s.links.map(function (l, i) {
      return '<div class="li" data-idx="' + i + '"><span class="handle" style="width:20px;height:20px" aria-label="Drag to reorder">' + ICON.grip + '</span><div class="li-body">' +
        '<div class="row2"><label class="field"><span>Type</span><select data-bind="site.links.' + i + '.type" data-rerender>' + LINK_TYPES.map(function (t) { return '<option value="' + t + '"' + (l.type === t ? ' selected' : '') + '>' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>'; }).join('') + '</select></label>' +
        field('Button text', 'site.links.' + i + '.label') + '</div>' +
        field(l.type === 'whatsapp' ? 'Phone number or wa.me link' : 'Link', 'site.links.' + i + '.url', { placeholder: l.type === 'whatsapp' ? '+94 70 377 1851' : 'https://' }) +
        toggle('Also show in the About facts', 'site.links.' + i + '.showInAbout') + '</div>' +
        '<button type="button" class="icon-btn danger" data-linkdel="' + i + '" aria-label="Remove link">' + ICON.trash + '</button></div>';
    }).join('');
    function imgField(label, path, hint, ratio) {
      var v = getPath(S.draft, path);
      return '<div class="field"><span>' + label + '</span><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><div style="width:' + (ratio === 'wide' ? '160px;aspect-ratio:1.9' : '90px;aspect-ratio:3/4') + ';border-radius:12px;overflow:hidden;background:var(--tile2)">' +
        (v ? '<img src="' + esc(sized(v, 300)) + '" alt="" style="width:100%;height:100%;object-fit:cover">' : '') + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px"><button type="button" class="btn btn--sm" data-imgup="' + path + '">' + ICON.image + ' ' + (v ? 'Change' : 'Upload') + '</button>' + (v && ratio === 'wide' ? '<button type="button" class="btn btn--sm" data-imgclear="' + path + '">Remove</button>' : '') + '</div></div>' + (hint ? '<p class="hint">' + hint + '</p>' : '') + '</div>';
    }
    return header('Site text &amp; profile', 'Headlines, about, contact and links. Fields with the switch above are per portfolio.', roleSeg()) +
      '<div class="grid-2">' +
      '<section class="card"><h2>Hero</h2>' + toggle('Show “available for work” badge', 'site.available') + field('Badge text', 'site.availableText') +
      field('Big headline', p + 'headline') + field('Intro line', p + 'intro', { area: true, rows: 3 }) +
      '<div class="field"><span>Scrolling skills strip</span><div class="chips">' + skills + '<input class="input" style="width:170px;min-height:40px" id="skillAdd" placeholder="Add skill + Enter"></div></div>' +
      '<div class="row2">' + field('Button text', 'site.hireText') + field('Button goes to', 'site.hireLink', { placeholder: '#contact', hint: '#contact scrolls down, or paste a link (WhatsApp, email…)' }) + '</div></section>' +
      '<section class="card"><h2>About</h2>' + imgField('Your photo', 'site.portrait', '') + field('Greeting', 'site.greeting') +
      field('Bio', p + 'bio', { area: true, rows: 8, hint: 'Leave an empty line between paragraphs.' }) +
      '<div class="row2">' + field('Location', 'site.location') + field('Focus', p + 'focus') + '</div>' +
      '<div class="row2">' + field('Your name', 'site.name') + field('Logo text (top left)', 'site.logo') + '</div></section>' +
      '<section class="card"><h2>Contact &amp; links</h2>' + field('Closing line', p + 'contactLine') + field('Email', 'site.email', { type: 'email' }) +
      '<div class="list" id="linkList">' + links + '</div><button type="button" class="btn btn--dashed" data-act="link-add">+ Add link (Instagram, WhatsApp, YouTube…)</button></section>' +
      '<section class="card"><h2>Google &amp; sharing</h2>' + field('Role name (footer)', p + 'label') + field('Page title', p + 'seoTitle') +
      field('Description in Google results', p + 'seoDesc', { area: true, rows: 3 }) +
      imgField('Share image (WhatsApp / Instagram link preview)', 'site.shareImage', 'Best size 1200×630. Google and link previews use the Video Editor title and description.', 'wide') + '</section>' +
      '</div>';
  }

  /* ---------- Layout & look ---------- */
  function viewLayout() {
    var L = S.draft.layout, r = S.role;
    var secs = L.sections[r].map(function (s, i) {
      return '<div class="sec-row' + (s.show ? '' : ' off') + '" data-idx="' + i + '"><span class="handle" style="display:flex;width:18px;color:var(--muted)" aria-label="Drag to reorder">' + ICON.grip + '</span>' +
        '<span>' + esc(SECTION_NAMES[s.id] || s.id) + '</span><label class="switch" style="min-height:0"><span class="sr-only">Show ' + esc(SECTION_NAMES[s.id] || s.id) + '</span><input type="checkbox" data-bind="layout.sections.' + r + '.' + i + '.show" data-rerender' + (s.show ? ' checked' : '') + '></label></div>';
    }).join('');
    function opts(path, values, labels) {
      var cur = getPath(S.draft, path);
      return '<div class="opts">' + values.map(function (v, i) { return '<button type="button" data-set="' + path + '" data-val="' + esc(JSON.stringify(v)) + '" aria-pressed="' + (cur === v) + '">' + esc(labels ? labels[i] : v) + '</button>'; }).join('') + '</div>';
    }
    return header('Layout &amp; look', 'Every change shows in the preview. Publish when you like it.', roleSeg()) +
      '<div class="split"><div class="col">' +
      '<section class="card"><h2>Sections — drag to reorder</h2><div class="list" id="secList">' + secs + '</div><p class="hint">The top hero always stays first. Empty sections hide themselves.</p></section>' +
      '<section class="card"><h2>Work grid</h2>' +
      '<div class="field"><span>Reels per row (desktop)</span>' + opts('layout.reelCols', [2, 3, 4, 5]) + '</div>' +
      '<div class="field"><span>Reels style</span>' + opts('layout.reelStyle', ['grid', 'carousel'], ['Grid', 'Swipe carousel']) + '</div>' +
      '<div class="field"><span>Designs per row (desktop)</span>' + opts('layout.designCols', [2, 3, 4]) + '</div>' +
      '<div class="field"><span>Designs style</span>' + opts('layout.designStyle', ['grid', 'masonry'], ['Even grid', 'Masonry (keeps shapes)']) + '</div>' +
      '<label class="field"><span>Corner roundness · <b id="radiusVal">' + L.radius + 'px</b></span><input type="range" min="0" max="32" step="1" value="' + L.radius + '" data-bind="layout.radius" data-type="number"></label>' +
      toggle('Play reels on mouse hover', 'layout.hoverPreview') + '</section>' +
      '<section class="card"><h2>Look</h2><div class="field"><span>Accent colour</span><div class="swatches">' +
      ACCENTS.map(function (a) { return '<button type="button" class="sw" style="background:' + a + '" data-set="layout.accent" data-val="' + esc(JSON.stringify(a)) + '" aria-pressed="' + (L.accent === a) + '" aria-label="Accent ' + a + '"></button>'; }).join('') +
      '<label class="sw-custom" title="Custom colour"><span class="sr-only">Custom colour</span><input type="color" value="' + esc(L.accent) + '" data-bind="layout.accent" style="width:60px;height:60px;margin:-10px;border:0;padding:0;cursor:pointer"></label></div></div>' +
      '<label class="field"><span>Heading font</span><select data-bind="layout.headingFont">' + FONTS.map(function (f) { return '<option' + (L.headingFont === f ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>Default theme for new visitors</span><select data-bind="layout.defaultTheme">' + [['dark', 'Dark'], ['light', 'Light'], ['auto', 'Follow visitor’s device']].map(function (o) { return '<option value="' + o[0] + '"' + (L.defaultTheme === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label></section>' +
      '</div><div class="wide"><div class="toolbar"><b style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Live preview</b><div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<div class="seg"><button type="button" data-pv="desktop" aria-pressed="' + (S.preview === 'desktop') + '">Desktop</button><button type="button" data-pv="phone" aria-pressed="' + (S.preview === 'phone') + '">Phone</button></div>' +
      '<button type="button" class="btn btn--sm" data-act="full-preview">Full-screen preview ↗</button></div></div>' +
      '<div class="preview-box' + (S.preview === 'phone' ? ' phone' : '') + '"><iframe id="pvFrame" title="Live preview of your site" src="../index.html?preview=1&role=' + r + '"></iframe></div></div></div>';
  }

  /* ---------- Settings ---------- */
  function viewSettings() {
    return header('Settings', 'Connections for this device, backups and sign out.') +
      '<div class="grid-2"><section class="card"><h2>Cloudinary (videos &amp; images)</h2>' +
      '<label class="field"><span>Cloud name</span><input type="text" id="setCloud" value="' + esc(cfg.cloud || '') + '"></label>' +
      '<label class="field"><span>Unsigned upload preset</span><input type="text" id="setPreset" value="' + esc(cfg.preset || '') + '"></label>' +
      '<p class="hint">Cloudinary › Settings › Upload › Upload presets › Add › Signing mode <b>Unsigned</b>, folder <b>portfolio</b>.</p>' +
      '<button type="button" class="btn btn--light" data-act="save-cloud" style="align-self:flex-start">Save</button></section>' +
      '<section class="card"><h2>GitHub</h2><p class="hint">Repository <b>' + esc(cfg.repo) + '</b> · branch <b>' + esc(cfg.branch) + '</b></p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn" data-act="reload">Reload from GitHub</button><button type="button" class="btn btn--danger" data-act="signout">Sign out on this device</button></div></section>' +
      '<section class="card"><h2>Backup</h2><p class="hint">Download everything (text, links, order, settings) as one file, or bring a backup back.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn" data-act="backup">Download backup</button><button type="button" class="btn" data-act="restore">Restore from file</button></div></section>' +
      '<section class="card"><h2>Unpublished changes</h2><p class="hint">Throw away everything you changed since the last publish.</p>' +
      '<button type="button" class="btn btn--danger" data-act="discard" style="align-self:flex-start"' + (isDirty() ? '' : ' disabled') + '>Discard changes</button></section></div>';
  }

  /* =================================================================== *
   *  mount: wire up the current view
   * =================================================================== */
  function mount() {
    if (S.view === 'videos') {
      dropZone($('#vDrop'), /^video\/|\.(mp4|mov|webm|m4v)$/i, addVideoFiles);
      sortable($('#vGrid'), '.m', function (order) { S.draft.videos = applyOrder(S.draft.videos, order); changed(true); });
    }
    if (S.view === 'designs') {
      dropZone($('#dDrop'), /^image\/|\.(png|jpe?g|webp|gif|svg)$/i, addDesignFiles);
      sortable($('#dGrid'), '.m', function (order) { S.draft.designs = applyOrder(S.draft.designs, order); changed(true); });
    }
    if (S.view === 'experience') {
      var R = S.draft.roles[S.role];
      sortable($('#expList'), '.li', function (order) { R.experience = applyOrder(R.experience, order); changed(true); });
      sortable($('#toolList'), '.tool-chip', function (order) { R.tools = applyOrder(R.tools, order); changed(true); });
    }
    if (S.view === 'content') {
      sortable($('#linkList'), '.li', function (order) { S.draft.site.links = applyOrder(S.draft.site.links, order); changed(true); });
      var sk = $('#skillAdd');
      sk.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') { return; }
        e.preventDefault();
        var v = sk.value.trim(); if (!v) { return; }
        S.draft.roles[S.role].skills.push(v); changed(true); $('#skillAdd').focus();
      });
    }
    if (S.view === 'layout') {
      var list = S.draft.layout.sections[S.role];
      sortable($('#secList'), '.sec-row', function (order) { S.draft.layout.sections[S.role] = applyOrder(list, order); changed(true); });
    }
  }
  function addVideoFiles(files) {
    if (!cloudReady()) { return; }
    var cat = /^(all|film|hidden)$/.test(S.videoFilter) ? null : S.videoFilter;
    files.forEach(function (f) {
      enqueue(f, 'video', function (r) {
        var v = videoFromUpload(r);
        if (cat) { v.cat = cat; }
        S.draft.videos.unshift(v);
        changed(true);
        if (r.format !== 'mp4') { toast('“' + esc(v.title) + '” was converted to MP4. It can take a minute before it plays.', null, 6000); }
      });
    });
  }

  /* ---------- live preview ---------- */
  var pvTimer = null;
  function schedulePreview() {
    clearTimeout(pvTimer);
    pvTimer = setTimeout(function () {
      var f = $('#pvFrame');
      if (f && f.contentWindow) { try { f.contentWindow.location.reload(); } catch (e) { f.src = f.src; } }
    }, 700);
  }
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'portfolio-ready' || !e.source) { return; }
    e.source.postMessage({ type: 'portfolio-content', content: S.draft }, location.origin);
  });

  /* =================================================================== *
   *  events (delegated)
   * =================================================================== */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, [data-publish]');
    if (!t) { return; }
    var d = t.dataset, c = S.draft;
    if (d.view) { return go(d.view); }
    if ('publish' in d) { return publish(); }
    if (!c) { return; }
    if (d.role) { S.role = d.role; return render(); }
    if (d.vfilter) { S.videoFilter = d.vfilter; return render(); }
    if (d.dtab) { S.designTab = d.dtab; return render(); }
    if (d.pv) { S.preview = d.pv; $$('[data-pv]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.pv === S.preview)); }); $('.preview-box').classList.toggle('phone', S.preview === 'phone'); return; }
    if (d.dismiss) { S.uploads = S.uploads.filter(function (j) { return j.id !== d.dismiss; }); return renderUploads(); }
    if (d.vhide) { var v = c.videos[d.vhide]; v.hidden = !v.hidden; return changed(true); }
    if (d.vedit) { return editVideo(Number(d.vedit)); }
    if (d.vdel) {
      var vv = c.videos[d.vdel];
      return confirmBox('Delete “' + esc(vv.title) + '” from your portfolio? (The file stays in your Cloudinary account.)', 'Delete', true).then(function (ok) { if (ok) { c.videos.splice(Number(d.vdel), 1); changed(true); } });
    }
    if (d.dhide) { var dd = c.designs[d.dhide]; dd.hidden = !dd.hidden; return changed(true); }
    if (d.dedit) { return editDesign(Number(d.dedit)); }
    if (d.ddel) {
      var x = c.designs[d.ddel];
      return confirmBox('Delete “' + esc(x.title) + '” from your portfolio?', 'Delete', true).then(function (ok) { if (ok) { c.designs.splice(Number(d.ddel), 1); changed(true); } });
    }
    if (d.exphide) { var ex = c.roles[S.role].experience[d.exphide]; ex.hidden = !ex.hidden; return changed(true); }
    if (d.expdel) { return confirmBox('Delete this experience card?', 'Delete', true).then(function (ok) { if (ok) { c.roles[S.role].experience.splice(Number(d.expdel), 1); changed(true); } }); }
    if (d.tooledit) { return editTool(Number(d.tooledit)); }
    if (d.skilldel) { c.roles[S.role].skills.splice(Number(d.skilldel), 1); return changed(true); }
    if (d.linkdel) { c.site.links.splice(Number(d.linkdel), 1); return changed(true); }
    if (d.set) { setPath(c, d.set, JSON.parse(d.val)); return changed(true); }
    if (d.imgup) {
      if (!cloudReady()) { return; }
      return pickFiles('image/*').then(function (files) {
        if (!files[0]) { return; }
        t.innerHTML = '<span class="spin"></span> Uploading…';
        cloudUpload(files[0], 'image', function () {}).then(function (r) { setPath(c, d.imgup, r.secure_url); changed(true); })
          .catch(function (er) { toast(esc(friendlyUploadError(er.message, 'image')), 'error'); render(); });
      });
    }
    if (d.imgclear) { setPath(c, d.imgclear, ''); return changed(true); }
    switch (d.act) {
      case 'pick-videos': if (cloudReady()) { pickFiles('video/*', true).then(addVideoFiles); } break;
      case 'pick-designs': if (cloudReady()) { pickFiles('image/*', true).then(addDesignFiles); } break;
      case 'add-link': addLink(); break;
      case 'video-cats': editCats('videoCats', 'Video categories'); break;
      case 'design-cats': editCats('designCats', 'Design categories'); break;
      case 'exp-add': c.roles[S.role].experience.push({ title: 'New card', tag: '', role: '', desc: '', hidden: false }); changed(true); break;
      case 'tool-add': editTool(null); break;
      case 'link-add': c.site.links.push({ type: 'instagram', label: 'Instagram', url: '', showInAbout: false }); changed(true); break;
      case 'full-preview': window.open('../index.html?preview=1&role=' + S.role, '_blank'); break;
      case 'save-cloud':
        cfg.cloud = $('#setCloud').value.trim(); cfg.preset = $('#setPreset').value.trim(); writeJSON(CFG_KEY, cfg);
        toast('Saved. You can upload now.'); break;
      case 'reload':
        (isDirty() ? confirmBox('This throws away your unpublished changes. Continue?', 'Reload', true) : Promise.resolve(true)).then(function (ok) { if (ok) { writeJSON(draftKey(), null); loadContent(); } }); break;
      case 'signout':
        confirmBox('Sign out on this device? Your published site is not affected.', 'Sign out', true).then(function (ok) { if (ok) { localStorage.removeItem(CFG_KEY); location.reload(); } }); break;
      case 'backup': {
        var blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'portfolio-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); break;
      }
      case 'restore':
        pickFiles('application/json,.json').then(function (files) {
          if (!files[0]) { return; }
          files[0].text().then(function (txt) {
            try { var j = JSON.parse(txt); if (!j.videos || !j.roles) { throw new Error(); } S.draft = normalize(j); changed(true); toast('Backup loaded. Press Publish to put it live.'); }
            catch (er) { toast('That file is not a portfolio backup.', 'error'); }
          });
        }); break;
      case 'discard':
        confirmBox('Throw away all unpublished changes?', 'Discard', true).then(function (ok) { if (ok) { S.draft = clone(S.published); changed(true); } }); break;
    }
  });

  /* text inputs, selects, switches → draft (no re-render while typing) */
  function onBind(e) {
    var el = e.target, path = el.dataset && el.dataset.bind;
    if (!path || !S.draft) { return; }
    var val = el.type === 'checkbox' ? el.checked : el.dataset.type === 'number' ? Number(el.value) : el.value;
    if (/^site\.links\.\d+\.url$/.test(path) && e.type === 'change') {
      var link = getPath(S.draft, path.replace(/\.url$/, ''));
      if (link.type === 'whatsapp' && /^[+\d\s()-]{6,}$/.test(val)) { val = 'https://wa.me/' + val.replace(/\D/g, ''); el.value = val; }
      else if (link.type !== 'whatsapp' && val && !/^(https?:|mailto:)/.test(val)) { val = 'https://' + val.replace(/^\/+/, ''); el.value = val; }
    }
    setPath(S.draft, path, val);
    if (path === 'layout.radius') { var rv = $('#radiusVal'); if (rv) { rv.textContent = val + 'px'; } }
    changed(el.hasAttribute('data-rerender') && e.type === 'change');
  }
  document.addEventListener('input', onBind);
  document.addEventListener('change', onBind);

  /* =================================================================== *
   *  start
   * =================================================================== */
  function showSetup(err) {
    $('#app').hidden = true;
    $('#setup').hidden = false;
    if (cfg.repo) { $('#sRepo').value = cfg.repo; }
    if (cfg.branch) { $('#sBranch').value = cfg.branch; }
    if (cfg.cloud) { $('#sCloud').value = cfg.cloud; }
    if (cfg.preset) { $('#sPreset').value = cfg.preset; }
    var e = $('#setupErr'); e.hidden = !err; e.textContent = err || '';
  }
  $('#setupForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var next = { token: $('#sToken').value.trim(), repo: $('#sRepo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, ''), branch: $('#sBranch').value.trim() || 'main', cloud: $('#sCloud').value.trim(), preset: $('#sPreset').value.trim() };
    var btn = $('#setupBtn'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Checking…';
    var prev = cfg; cfg = next;
    gh('').then(function (repo) {
      if (repo.permissions && !repo.permissions.push) { throw new Error('This key can read but not save. Give it Contents: Read and write.'); }
      writeJSON(CFG_KEY, cfg);
      startApp();
    }).catch(function (er) {
      cfg = prev;
      showSetup(er.status === 401 ? 'That GitHub key was not accepted. Copy it again (it starts with github_pat_).' : er.status === 404 ? 'Repository not found, or the key has no access to it. Check the name and the key’s repository access.' : er.message);
    }).then(function () { btn.disabled = false; btn.textContent = 'Open dashboard'; });
  });

  function loadContent() {
    $('#main').innerHTML = '<div class="empty"><span class="spin" style="display:inline-block"></span> Loading your portfolio…</div>';
    return getFile('content.json').then(function (f) {
      if (f) { return { content: JSON.parse(f.text), sha: f.sha }; }
      return fetch('../content.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { return { content: j, sha: null }; });
    }).then(function (res) {
      S.published = normalize(res.content);
      S.sha = res.sha;
      var saved = readJSON(draftKey());
      if (saved && saved.content && saved.base === S.sha && JSON.stringify(saved.content) !== JSON.stringify(S.published)) {
        S.draft = normalize(saved.content);
        toast('Your unpublished changes from last time are back.');
      } else {
        S.draft = clone(S.published);
      }
      render();
    }).catch(function (er) {
      if (er.status === 401) { localStorage.removeItem(CFG_KEY); return showSetup('Your GitHub key expired or was removed. Add a new one.'); }
      $('#main').innerHTML = '<div class="empty">Could not load your content: ' + esc(er.message) + '<br><br><button type="button" class="btn" onclick="location.reload()">Try again</button></div>';
    });
  }
  function startApp() {
    $('#setup').hidden = true;
    $('#app').hidden = false;
    loadContent();
  }

  if (cfg.token && cfg.repo) { startApp(); } else { showSetup(); }
})();
