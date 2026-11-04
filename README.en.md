# dsh-quick-settings

**Settings, out of the avatar menu and onto the sidebar.**

The settings entry normally lives two clicks deep — open the avatar, then click 设置. This plugin lifts that row out and pins it in the sidebar:

```
⚙  设置
```

One click, the dialog opens.

---

## Why

`Ctrl + ,` already works, but that gesture belongs to the keyboard. A mouse user either clicks twice or memorizes an accelerator. This row is that accelerator with a face.

## Install

**Desktop app (recommended)**

`Settings → Plugins`, paste the package name, then restart the app.

```
dsh-quick-settings
```

**CLI (plain web profile)**

```sh
dsh plugin --profile web add dsh-quick-settings
```

> The Electron desktop profile is managed by the application itself; `dsh plugin add` is refused there with `profile "desktop" is managed exclusively by the Electron application`. Use the Plugins page instead.

**From a local checkout**

```sh
dsh plugin --profile web add /absolute/path/dsh-quick-settings
```

## Behaviour

- Sits at the bottom of the sidebar, directly **above** the account row, full width
- Collapses to the icon alone when the sidebar is a rail, aligned with the other controls in that area
- The click runs the host's own `settings.open` command — the same one behind `Ctrl+,` — so focus handling, the modal stack and Escape behave exactly as they do from the keyboard
- No synthesised clicks, no DOM takeover, no kernel patches

## Compatibility

- Verified on DSH `0.1.x`, Windows desktop
- Depends on the host's `shortcuts` service and the `sidebar.footer.action` slot; when either is missing the row is absent or inert — it never throws or disturbs the rest of the UI
- One client component, no build step, no third-party runtime dependency

## Uninstall

Disable or remove it on the Plugins page, then restart. The plugin is purely additive and leaves nothing behind.

## License

MIT
