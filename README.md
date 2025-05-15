


# Sucrier 🍌

**Sucrier** is a zero-dependency, ultra-lightweight client-side templating engine.  
It brings Django-style ( inspired by Smarty and Jinja2 ) syntax (e.g. `{{ user.name }}`, `{% for ... %}`, `{% if ... %}`) into plain HTML pages — with no build step.

Ideal for static sites, HTMX integrations, JSON-powered dashboards, Electron style apps, or anywhere you want to drop in a template without a framework.

---

## 🚀 Features

- ✅ Familiar Django-like syntax: `{{ variable }}`, `{% for item in items %}`, `{% if condition %}`
- ✅ Works with any JSON context — local or API
- ✅ Optional `data-alias` for array remapping
- ✅ No build tools or npm install required
- ✅ Framework agnostic (can pair beautifully with HTMX)

---

## 🔧 Usage

### HTML

```html
<template id="blog-template">
  <h1>{{ page_title }}</h1>
  {% for blog in blogs %}
    <div>
      <h2>{{ blog.title }}</h2>
      <p>{{ blog.excerpt }}</p>
    </div>
  {% endfor %}
</template>

<div id="blog-container"
     data-template="blog-template"
     data-context="blog_data"
     data-render>
</div>
```

### Script

```html
<script>
  window.blog_data = "data.json";
</script>
<script type="module" src="context.js"></script>
```

---

## ✨ Optional: `data-alias`

If your JSON is an array instead of an object:

```js
// blog_data = [
//   { title: "Post 1" },
//   { title: "Post 2" }
// ]
```

Use `data-alias`:

```html
<div data-template="blog-template"
     data-context="blog_data"
     data-alias="blogs"
     data-render>
</div>
```

This makes the array accessible in the template as `blogs`.

---


## 🧪 Local Testing

If you're opening your HTML files directly in the browser (`file://`), some features like `fetch()` from APIs or local JSON will fail due to CORS restrictions.

To test properly, run a local HTTP server from your project directory:

```bash
# Node.js
npx serve .

# Python 3
python3 -m http.server
```

---


## 🧠 Philosophy

Sucrier isn't a full app framework. It doesn't try to manage state, routing, or hydration.  
Its only job is to combine a template and a context — like syrup over your favorite fruit.

---


## 🖥️ Using Sucrier in Electron and Tauri

**Electron** and **Tauri** (the Rust-based cross-platform framework) both package your frontend like a desktop app,  
but you're still running web tech under the hood — which means CORS, protocol origin, and local file quirks still apply.

### 💡 Best Practices:

- **Use a local HTTP server (`localhost`)** in dev mode to avoid `file://` CORS issues
- **Fetch remote data using the backend context** (`preload.js` in Electron or a Tauri command)
- **Inject your data as global variables** (e.g. `window.blog_data = ...`) — Sucrier will pick it up
- In production, **bundle your JSON or use static context files** unless you're making live API calls

This ensures smooth integration while keeping your templating logic frontend-only and framework-agnostic.


---

## 📜 License

MIT — free to use, modify, share, and remix. Just don’t pretend you’re the banana king.

---

## 🏗️ Roadmap (v0.x)

- [x] Basic `{{ variable }}`
- [x] Loops `{% for ... %}`
- [x] If/else logic `{% if %} {% else %}`
- [ ] Comparisons (`==`, `>`, etc.)
- [ ] Filters (`| upper`, `| truncate`)
- [ ] Partials (`{% include %}`)
- [ ] Explore partial re-rendering (HTMX, Alpine.js, or minimal JS-driven refresh)
- [ ] Local dev support for live API testing (CORS-safe, via proxy or dev server)
- [ ] Example integrations with Electron and Tauri (desktop cross-platform)

> Sucrier is static by default, but there’s potential to support fragment-level re-renders via HTMX swaps or simple JS events (like `updateContext()`).


> ⚠️ Right now, some public APIs (like SampleAPIs) may block local file or `localhost` access due to CORS. Looking into ways to support dev-time testing with remote APIs — e.g., using a dev proxy, Netlify Functions, or a bundled mini server.

---

Made with 🍌 by [Full Bore Studios](https://github.com/FullBoreStudios)
