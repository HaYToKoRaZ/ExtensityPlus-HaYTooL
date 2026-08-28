# Extensity+ (rewrite)

A modernized rewrite of the amazing [Extensity](https://github.com/sergiokas/Extensity). Quickly enable/disable Chrome extensions, switch between saved profiles, pin favorites, and keep a set of "Always On" extensions no matter what profile is active.

This is a from-scratch reimplementation of the original jQuery-free-but-still-2014-era
Knockout.js codebase, rebuilt on a modern toolchain while keeping every user-facing
behavior from the original: instant toggling, profiles, favorites, Always On, dark mode,
and the "flip everything off" master switch.

## What changed under the hood

| | Original | This rewrite |
|---|---|---|
| UI framework | Knockout.js 3.5 + hand-rolled templates | React 18 + TypeScript, function components/hooks |
| Styling | Hand-written CSS + bundled Font Awesome | Tailwind CSS + self-hosted variable fonts (no CDN/network font loads) |
| Bundler | Custom `Makefile` + manual concatenation | Vite, with `vite-plugin-static-copy` for `manifest.json` |
| State | `ko.observable` + a custom `persistable` extender | Typed hooks over `chrome.storage`, live-synced via `chrome.storage.onChanged` |
| Background | `js/migration.js` (localStorage → sync migration) | Minimal MV3 service worker, one-time default seeding only |
| Dependencies | underscore, underscore.string, knockout, knockout-secure-binding | react, react-dom, lucide-react (icons), fontsource packages |
| Manifest | MV3, broad default CSP | MV3, explicit `content_security_policy.extension_pages` locking down `script-src 'self'`, `object-src 'none'`, `form-action 'none'` |

## Building

```bash
npm install
npm run build      # type-checks, then builds dist/
npm run zip        # zips dist/ into extensity.zip
```

To load it in Chrome for development: go to `chrome://extensions`, enable
**Developer mode**, choose **Load unpacked**, and select the `dist/` folder.

## License

Unchanged from the original. See `LICENSE.md`. Original project and
copyright: Sergio Kaszczyszyn ([sergiokas/Extensity](https://github.com/sergiokas/Extensity)).
