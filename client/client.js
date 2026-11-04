/**
 * dsh-quick-settings — browser half.
 *
 * One row in the sidebar foot, above the account row: a gear and the word 设置.
 * Clicking it opens the settings dialog through the host's own command
 * registry — the same `settings.open` command the Ctrl+, accelerator runs — so
 * focus, the modal stack and Escape all behave exactly as they do from the
 * keyboard.
 *
 * There is deliberately no DOM fallback: a previous revision clicked "the
 * first dialog popup button" when the registry call looked inert, which landed
 * on the usage popover instead of the settings trigger. The registry call is
 * asynchronous from this side (React commits the dialog a tick later), so the
 * click path is now "invoke, then observe" — it never synthesises a click on
 * an element it does not own.
 */
window.__ModuleLoader__.load({
  id: 'dsh-quick-settings',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var react = require('react')
    var h = react.createElement

    exports.name = 'dsh-quick-settings'
    exports.inject = ['slots', 'shortcuts']

    /** Route base, resolved against the page's own baseURI. */
    function logUrl() {
      var relative = 'dsh-quick-settings/log'
      if (typeof document === 'undefined') return '/' + relative
      return new URL(relative, document.baseURI).pathname
    }

    /** Fire-and-forget diagnostic line; never allowed to break the click. */
    function report(payload) {
      try {
        fetch(logUrl(), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(function () {})
      } catch (error) {
        /* nothing to do */
      }
    }

    /** True when the settings dialog is on screen. */
    function dialogOpen() {
      try {
        return document.querySelector('[data-shortcut-modal="settings"]') !== null
      } catch (error) {
        return false
      }
    }

    /**
     * Open settings through the command registry.
     * @param ctx - client context carrying `shortcuts`.
     */
    function openSettings(ctx) {
      var diag = { step: 'start' }
      var service = null
      try {
        service = ctx && ctx.shortcuts ? ctx.shortcuts : (ctx && typeof ctx.get === 'function' ? ctx.get('shortcuts') : null)
      } catch (error) {
        diag.shortcutsError = String(error && error.message ? error.message : error)
      }

      var registry = null
      try {
        registry = service ? service.registry : null
      } catch (error) {
        registry = null
      }
      diag.hasRegistry = Boolean(registry)

      if (!registry || typeof registry.invoke !== 'function') {
        diag.invoke = 'unavailable'
        report(diag)
        return
      }

      try {
        registry.invoke('settings.open', { target: document.body, region: 'page', modal: null })
        diag.invoke = 'called'
      } catch (error) {
        diag.invoke = 'threw: ' + String(error && error.message ? error.message : error)
        report(diag)
        return
      }

      // The dialog is committed a tick later; report the outcome for the log
      // only. Nothing is clicked here.
      diag.dialogOpen = dialogOpen()
      report(diag)
      setTimeout(function () {
        report({ step: 'after', dialogOpen: dialogOpen() })
      }, 400)
    }

    /** The gear glyph, inline so nothing external has to load. */
    function Gear(props) {
      var size = (props && props.size) || 17
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { flex: 'none' },
        },
        h('circle', { cx: 12, cy: 12, r: 3 }),
        h('path', {
          d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
        }),
      )
    }

    /** Captured in `apply` so the component can reach the client context. */
    var ctxRef = null

    /**
     * The settings row: gear + 设置, shaped like a sidebar panel row. Collapsed
     * to the icon alone when the sidebar is a rail. No accelerator hint — the
     * row is the shortcut.
     * @param props - slot props: `wide` says whether labels fit.
     */
    function QuickSettingsRow(props) {
      var wide = !(props && props.wide === false)
      var hover = react.useState(false)
      var hovered = hover[0]
      var setHovered = hover[1]
      var context = props && props.ctx ? props.ctx : ctxRef

      return h(
        'button',
        {
          type: 'button',
          title: '设置',
          'aria-label': '设置',
          onClick: function () { openSettings(context) },
          onMouseEnter: function () { setHovered(true) },
          onMouseLeave: function () { setHovered(false) },
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: wide ? 'flex-start' : 'center',
            gap: 8,
            width: '100%',
            height: 32,
            padding: wide ? '0 10px' : 0,
            margin: '0 0 2px',
            border: 'none',
            borderRadius: 8,
            background: hovered ? 'rgba(127,127,127,0.14)' : 'transparent',
            color: 'inherit',
            font: 'inherit',
            fontSize: 13,
            cursor: 'pointer',
            opacity: hovered ? 1 : 0.8,
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            transition: 'background 120ms ease, opacity 120ms ease',
          },
        },
        h(Gear, { size: 16 }),
        wide && h('span', { style: { flex: '1 1 auto', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' } }, '设置'),
      )
    }

    exports.apply = function apply(ctx) {
      ctxRef = ctx
      ctx.slots.inject('sidebar.footer.action', function () {
        return ctx.slots.register(
          { name: 'sidebar.footer.action', id: 'dsh-quick-settings' },
          QuickSettingsRow,
        )
      })
    }

    return module.exports
  },
})
