window.__ModuleLoader__.load({
  id: 'dsh-model-provider-prefix',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    var React = require('react')
    /**
     * Composer model seat, split the way another client does it: the model trigger reads
     * `Provider/Model` and opens a two-column card — providers on the left, the hovered
     * provider's models on the right — while the reasoning effort is its own trigger.
     */
    var STYLE_ID = 'dsh-model-provider-prefix-style'
    var CSS = [
      '[data-dsh-pm]{display:inline-flex;align-items:center;gap:6px;min-width:0}',
      '[data-dsh-pm-trigger]{display:inline-flex;align-items:center;gap:0;min-width:0;max-width:min(360px,45cqw);',
      'height:28px;padding:0 5px 0 8px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;',
      'color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;font-weight:400;cursor:pointer;',
      'transition:background-color 120ms ease,color 120ms ease}',
      '[data-dsh-pm-trigger]:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
      '[data-dsh-pm-trigger]:active:not(:disabled){background:var(--dsw-alias-interactive-bg-pressed,var(--dsw-alias-interactive-bg-hover))}',
      '[data-dsh-pm-trigger]:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}',
      '[data-dsh-pm-trigger]:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
      '[data-dsh-pm][data-open] [data-dsh-pm-trigger]{background:var(--dsw-alias-interactive-bg-hover)}',
      '[data-dsh-pm-trigger][data-dsh-pm-fallback]{padding:0 8px;color:var(--dsw-alias-label-dimmed);cursor:default}',
      '[data-dsh-pm-trigger] svg{width:12px;height:12px;margin-left:3px;opacity:.55;flex:none}',
      '[data-dsh-pm-label]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '[data-dsh-pm-trigger] [data-dsh-pm-label="provider"],[data-dsh-pm-trigger] [data-dsh-pm-label="model"]{color:var(--dsw-alias-label-primary)}',
      '[data-dsh-pm-slash]{color:var(--dsw-alias-label-primary);margin:0}',
      '[data-dsh-pm-effort]{max-width:12em;padding:0 6px}',
      '[data-dsh-pm-effort] [data-dsh-pm-label]{color:var(--dsw-alias-label-secondary)}',
      /* Portaled card: the shipped menu surface, anchored above the composer. */
      '[data-dsh-pm-pop]{position:fixed;z-index:1200;display:flex;align-items:stretch;padding:4px;',
      'border:0.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md);',
      'background:var(--dsw-menu-surface-fill,var(--dsw-alias-bg-layer-1));',
      '-webkit-backdrop-filter:var(--dsw-menu-backdrop-filter);backdrop-filter:var(--dsw-menu-backdrop-filter);',
      'box-shadow:var(--dsw-elevation-prominent,var(--dsw-shadow-lv2));overflow:hidden}',
      '[data-dsh-pm-col]{display:flex;flex-direction:column;min-height:0;overflow-y:auto}',
      '[data-dsh-pm-col="providers"]{width:168px;flex:none}',
      '[data-dsh-pm-col="models"]{width:236px;flex:none;margin-left:2px;padding-left:6px;',
      'border-left:0.5px solid var(--dsw-alias-border-l2)}',
      '[data-dsh-pm-col="effort"]{width:196px;flex:none}',
      '[data-dsh-pm-row]{display:flex;align-items:center;gap:6px;width:100%;min-height:32px;padding:5px 8px;',
      'border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);',
      'font-size:13px;line-height:20px;font-weight:400;text-align:left;cursor:pointer}',
      '[data-dsh-pm-row]:hover:not(:disabled),[data-dsh-pm-row][data-hover]{background:var(--dsw-alias-interactive-bg-hover)}',
      '[data-dsh-pm-row]:focus-visible{outline:none;background:var(--dsw-alias-interactive-bg-hover)}',
      '[data-dsh-pm-row]:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
      '[data-dsh-pm-row-name]{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '[data-dsh-pm-note]{flex:none;color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px}',
      '[data-dsh-pm-count]{flex:none;margin-left:auto;color:var(--dsw-alias-label-dimmed);font-size:11px;line-height:17px}',
      '[data-dsh-pm-row] [data-dsh-pm-check]{flex:none;width:14px;height:14px;color:var(--dsw-alias-label-secondary)}',
      '[data-dsh-pm-glyph]{flex:none;width:14px;height:14px;color:var(--dsw-alias-label-caption)}',
      '[data-dsh-pm-head]{display:flex;align-items:center;gap:4px;padding:6px 8px 3px;',
      'color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px;font-weight:500;letter-spacing:.01em}',
      '[data-dsh-pm-hint]{padding:6px 8px;color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px}',
      '[data-dsh-pm-sep]{flex:none;height:0.5px;margin:3px 4px;background:var(--dsw-alias-border-l2)}',
      '[data-dsh-pm-search]{margin:2px 4px 4px;padding:0 8px;height:30px;border:0.5px solid var(--dsw-alias-border-l2);',
      'border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);',
      'font-size:13px;line-height:20px;outline:none}',
      '[data-dsh-pm-search]:focus{border-color:var(--dsw-alias-border-l3)}',
    ].join('')

    /** Inject the sheet once per document. */
    function ensureStyle() {
      if (typeof document === 'undefined') return
      var css = CSS
      var existing = document.getElementById(STYLE_ID)
      if (existing !== null) {
        /* Keep a hot reload honest: refresh the sheet when the source changed. */
        if (existing.textContent !== css) existing.textContent = css
        return
      }
      var style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = css
      document.head.appendChild(style)
    }

    /** A 14px inline glyph: chevron, check, or warning. */
    function glyph(kind) {
      var paths = {
        down: 'M4 6.5 8 10.5 12 6.5',
        right: 'M6 3.5 10.5 8 6 12.5',
        back: 'M10 3.5 5.5 8 10 12.5',
        check: 'M3.5 8.5 6.5 11.5 12.5 4.5',
        warn: 'M8 2.5 14 13H2L8 2.5Zm0 3.5v3.2m0 1.6v.2',
      }
      return React.createElement(
        'svg',
        { viewBox: '0 0 16 16', width: 14, height: 14, fill: 'none', stroke: 'currentColor', 'aria-hidden': 'true' },
        React.createElement('path', { d: paths[kind], strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      )
    }

    /**
     * Resolve the current selection against the loaded catalog.
     * @param state - the shared model directory snapshot.
     * @returns display names plus the catalog entries they came from.
     */
    function resolve(state) {
      var current = state === null || state === undefined ? null : state.current
      if (current === null || current === undefined) return null
      var group = groupById(state, current.provider)
      var model = null
      if (group !== null) {
        var models = group.models || []
        for (var i = 0; i < models.length; i++) {
          if (models[i].id === current.model) { model = models[i]; break }
        }
      }
      return {
        current: current,
        group: group,
        model: model,
        providerName: group === null ? current.provider : (group.name || current.provider),
        modelName: model === null ? current.model : (model.name || current.model),
      }
    }

    /**
     * One provider's catalog group — the hovered provider is resolved by id, never
     * assumed to be the live one.
     * @param state - the shared model directory snapshot.
     * @param providerId - provider id to look up.
     * @returns the group, or null when that provider has no loaded catalog.
     */
    function groupById(state, providerId) {
      if (state === null || state === undefined) return null
      var groups = state.groups || []
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].id === providerId) return groups[i]
      }
      return null
    }

    /**
     * The effort label the trigger shows: the model's own name for the value in use.
     * @param reasoning - catalog reasoning metadata of the current model.
     * @param effort - reasoning effort in use, or undefined for the provider default.
     * @returns the caption, or undefined when the model takes no effort.
     */
    function effortLabel(reasoning, effort) {
      if (reasoning === undefined || reasoning === null) return undefined
      if (effort === undefined) return 'Default'
      var efforts = reasoning.efforts || []
      for (var i = 0; i < efforts.length; i++) {
        if (efforts[i].id === effort) return efforts[i].name || effort
      }
      return effort
    }

    /** Provider rows: one per loaded group, plus a retry row per failed provider. */
    function providerRows(state, currentProvider) {
      var rows = ((state && state.groups) || []).map(function (group) {
        return {
          key: 'provider:' + group.id,
          kind: 'provider',
          provider: group.id,
          label: group.name || group.id,
          count: (group.models || []).length,
          checked: group.id === currentProvider,
        }
      })
      var failed = ((state && state.failures) || []).map(function (failure) {
        return {
          key: 'failed:' + failure.id,
          kind: 'retry',
          provider: failure.id,
          label: failure.name || failure.id,
          note: 'retry',
          checked: false,
        }
      })
      return rows.concat(failed)
    }

    /** Model rows of one provider, filtered by the search query. */
    function modelRows(group, query, current) {
      if (group === null || group === undefined) return []
      var needle = (query || '').trim().toLowerCase()
      return (group.models || []).filter(function (model) {
        if (needle === '') return true
        var name = (model.name || model.id).toLowerCase()
        return name.indexOf(needle) !== -1 || model.id.toLowerCase().indexOf(needle) !== -1
      }).map(function (model) {
        return {
          key: 'model:' + model.id,
          kind: 'model',
          provider: group.id,
          model: model.id,
          /* The effort a fresh pick starts on; the trigger keeps tracking current.reasoningEffort. */
          defaultEffort: model.reasoning === undefined ? undefined : model.reasoning.defaultEffort,
          label: model.name || model.id,
          checked: current !== null && current !== undefined
            && current.provider === group.id && current.model === model.id,
        }
      })
    }

    /** Effort rows: the provider default first when the model allows it, then each level. */
    function effortRows(reasoning, effort) {
      if (reasoning === undefined || reasoning === null) return []
      var rows = []
      if (reasoning.defaultEffort === undefined) {
        rows.push({ key: 'effort:default', kind: 'effort', effort: undefined, label: 'Default', checked: effort === undefined })
      }
      return rows.concat((reasoning.efforts || []).map(function (level) {
        return {
          key: 'effort:' + level.id,
          kind: 'effort',
          effort: level.id,
          label: level.name || level.id,
          description: level.description,
          checked: effort === level.id,
        }
      }))
    }

    /** One menu row; `onHover` lets the provider list drive the model column. */
    function row(spec, handlers) {
      return React.createElement(
        'button',
        {
          key: spec.key,
          type: 'button',
          'data-dsh-pm-row': '',
          'data-hover': spec.hovered === true ? '' : undefined,
          role: 'menuitemradio',
          'aria-checked': spec.checked === true ? 'true' : 'false',
          disabled: spec.disabled === true,
          onMouseEnter: spec.onHover,
          onFocus: spec.onHover,
          onClick: function () { handlers.activate(spec) },
        },
        React.createElement('span', { 'data-dsh-pm-row-name': '' }, spec.label),
        spec.note === undefined ? null : React.createElement('span', { 'data-dsh-pm-note': '' }, spec.note),
        spec.count === undefined ? null : React.createElement('span', { 'data-dsh-pm-count': '' }, String(spec.count)),
        spec.kind === 'retry' ? glyph('warn') : null,
        spec.checked === true ? React.createElement('span', { 'data-dsh-pm-check': '' }, glyph('check')) : null,
      )
    }

    /** Keep the card inside the window, above the composer row. */
    function cardStyle(rect, width) {
      if (rect === null) return { visibility: 'hidden', left: 0, top: 0 }
      var margin = 12
      var left = Math.min(Math.max(margin, rect.left), Math.max(margin, window.innerWidth - width - margin))
      var room = rect.top - margin * 2
      return { left: left + 'px', bottom: (window.innerHeight - rect.top + 6) + 'px', maxHeight: Math.min(420, room) + 'px' }
    }

    /* Card widths: providers + models side by side, and the narrow effort card. */
    var MODEL_CARD_WIDTH = 168 + 236 + 4 + 8
    var EFFORT_CARD_WIDTH = 204

    /**
     * Render the composer model seat: a `Provider/Model` trigger opening a provider
     * column with the hovered provider's models beside it, plus an effort trigger.
     * @returns the triggers and, while open, the portaled card.
     */
    /* Diagnostic: report the first render, then stay silent. */

    function ModelSeat(props) {
      var face = props.modelSeat
      var locked = props.locked === true
      var state = React.useSyncExternalStore(face.directory.subscribe, face.directory.getSnapshot, face.directory.getSnapshot)
      var openState = React.useState(null)
      var open = openState[0]
      var setOpen = openState[1]
      /* The provider the model column is showing; null means "follow the live selection". */
      var hoverState = React.useState(null)
      var hoveredProvider = hoverState[0]
      var setHoveredProvider = hoverState[1]
      var queryState = React.useState('')
      var query = queryState[0]
      var setQuery = queryState[1]
      var modelRef = React.useRef(null)
      var effortRef = React.useRef(null)
      var rectState = React.useState(null)
      var rect = rectState[0]
      var setRect = rectState[1]

      React.useEffect(function () { face.load() }, [face])

      React.useEffect(function () {
        if (open === null) return undefined
        /* Anchor the card on whichever trigger opened it; the rect stays null until measured. */
        var anchor = open === 'effort' ? effortRef.current : modelRef.current
        if (anchor !== null) setRect(anchor.getBoundingClientRect())
        function onPointerDown(event) {
          var card = document.querySelector('[data-dsh-pm-pop]')
          if (card !== null && card.contains(event.target)) return
          if (anchor !== null && anchor.contains(event.target)) return
          setOpen(null)
        }
        function onKeyDown(event) {
          if (event.key !== 'Escape') return
          setOpen(null)
        }
        function onResize() { setOpen(null) }
        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        window.addEventListener('resize', onResize)
        return function () {
          document.removeEventListener('mousedown', onPointerDown)
          document.removeEventListener('keydown', onKeyDown)
          window.removeEventListener('resize', onResize)
        }
      }, [open])
      var info = resolve(state)
      if (info === null && !face.available) return null
      var reasoning = info === null || info.model === null ? undefined : info.model.reasoning
      var effort = info === null ? undefined : info.current.reasoningEffort
      var effective = effort !== undefined ? effort : (reasoning === undefined ? undefined : reasoning.defaultEffort)
      var caption = effortLabel(reasoning, effective)
      var pending = state.pending !== null && state.pending !== undefined
      /* Right-column provider: the hovered one, else the live one. */
      var shownProvider = hoveredProvider !== null ? hoveredProvider : (info === null ? null : info.current.provider)
      var shownGroup = groupById(state, shownProvider)
      var shownModels = modelRows(shownGroup, query, info === null ? null : info.current)

      function choose(selection) {
        setOpen(null)
        setQuery('')
        face.select(selection)
      }

      /**
       * Act on a menu row: hovering or picking a provider re-targets the model column,
       * a failed provider retries its catalog, and everything else commits a selection.
       * @param spec - the row's description.
       */
      function activate(spec) {
        if (spec.kind === 'provider') {
          setHoveredProvider(spec.provider)
          setQuery('')
          return
        }
        if (spec.kind === 'retry') {
          face.load()
          return
        }
        if (spec.kind === 'model') {
          /* A model switch lands on that model's default effort, the way the shipped seat does. */
          var next = { provider: spec.provider, model: spec.model }
          if (spec.defaultEffort !== undefined) next.reasoningEffort = spec.defaultEffort
          choose(next)
          return
        }
        if (spec.kind === 'effort') {
          choose({ provider: info.current.provider, model: info.current.model, reasoningEffort: spec.effort })
        }
      }

      /* The `/` is its own dimmed span, so both names stay tight and the model ellipsizes first. */
      var labelParts = info === null
        ? [React.createElement('span', { key: 'provider', 'data-dsh-pm-label': 'provider' }, 'Model')]
        : [
            React.createElement('span', { key: 'provider', 'data-dsh-pm-label': 'provider' }, info.providerName),
            React.createElement('span', { key: 'slash', 'data-dsh-pm-slash': '', 'aria-hidden': 'true' }, '/'),
            React.createElement('span', { key: 'model', 'data-dsh-pm-label': 'model' }, info.modelName),
          ]
      var full = info === null ? 'Model' : info.providerName + '/' + info.modelName
      var modelTrigger = React.createElement.apply(null, [
        'button',
        {
          type: 'button',
          ref: modelRef,
          'data-dsh-pm-trigger': '',
          'aria-haspopup': 'menu',
          'aria-expanded': open === 'model',
          'aria-label': full,
          title: full,
          disabled: locked || !face.available,
          onClick: function () {
            if (open === 'model') {
              setOpen(null)
              return
            }
            setOpen('model')
            /* Open on the live provider so the right column is never empty. */
            setHoveredProvider(info === null ? null : info.current.provider)
            setQuery('')
          },
        },
      ].concat(labelParts, [glyph('down')]))

      var effortTrigger = caption === undefined ? null : React.createElement(
        'button',
        {
          type: 'button',
          ref: effortRef,
          'data-dsh-pm-trigger': '',
          'data-dsh-pm-effort': '',
          'aria-haspopup': 'menu',
          'aria-expanded': open === 'effort',
          'aria-label': 'Effort: ' + caption,
          title: caption,
          disabled: locked || !face.available,
          onClick: function () {
            setOpen(open === 'effort' ? null : 'effort')
          },
        },
        React.createElement('span', { 'data-dsh-pm-label': '' }, caption),
        glyph(open === 'effort' ? 'back' : 'down'),
      )

      var shell = { 'data-dsh-pm': '', 'data-open': open === null ? undefined : '' }
      var triggers = effortTrigger === null
        ? React.createElement('span', shell, modelTrigger)
        : React.createElement('span', shell, modelTrigger, effortTrigger)

      if (open === null) return triggers

      var columns = []
      if (open === 'effort') {
        columns.push(React.createElement(
          'div',
          { key: 'effort', 'data-dsh-pm-col': 'effort' },
          React.createElement('div', { 'data-dsh-pm-head': '' }, '推理强度'),
          React.createElement('div', { 'data-dsh-pm-sep': '' }),
          effortRows(reasoning, effective).map(function (spec) {
            return row(Object.assign({}, spec, { disabled: pending }), { activate: activate })
          }),
        ))
      } else {
        var providers = providerRows(state, info === null ? null : info.current.provider)
        columns.push(React.createElement(
          'div',
          { key: 'providers', 'data-dsh-pm-col': 'providers' },
          React.createElement('div', { 'data-dsh-pm-head': '' }, '供应商'),
          React.createElement('div', { 'data-dsh-pm-sep': '' }),
          providers.length === 0
            ? React.createElement('div', { key: 'hint', 'data-dsh-pm-hint': '' },
                state.status === 'loading' ? '正在读取…' : '暂无可用供应商')
            : providers.map(function (spec) {
                return row(Object.assign({}, spec, {
                  hovered: spec.provider === shownProvider,
                  /* Never disabled: re-targeting the column is always allowed, even mid-select. */
                  disabled: false,
                  onHover: function () { setHoveredProvider(spec.provider) },
                }), { activate: activate })
              }),
        ))

        var modelColumn = [
          React.createElement('div', { key: 'head', 'data-dsh-pm-head': '' },
            shownGroup === null ? '模型' : (shownGroup.name || '模型')),
          React.createElement('div', { key: 'sep', 'data-dsh-pm-sep': '' }),
        ]
        if (shownGroup !== null && (shownGroup.models || []).length > 6) {
          modelColumn.push(React.createElement('input', {
            key: 'search',
            'data-dsh-pm-search': '',
            value: query,
            placeholder: '搜索模型',
            onChange: function (event) { setQuery(event.target.value) },
          }))
        }
        if (shownModels.length === 0) {
          modelColumn.push(React.createElement('div', { key: 'hint', 'data-dsh-pm-hint': '' },
            shownGroup === null
              ? (state.status === 'loading' ? 'Loading…' : 'Pick a provider')
              : 'No matching model'))
        } else {
          modelColumn.push(shownModels.map(function (spec) {
            return row(Object.assign({}, spec, { disabled: pending }), { activate: activate })
          }))
        }
        columns.push(React.createElement('div', { key: 'models', 'data-dsh-pm-col': 'models' }, modelColumn))
      }

      var width = open === 'effort' ? EFFORT_CARD_WIDTH : MODEL_CARD_WIDTH
      var card = React.createElement(
        'div',
        { key: 'pop', 'data-dsh-pm-pop': '', role: 'menu', style: cardStyle(rect, width) },
        columns,
      )

      return React.createElement(React.Fragment, null, triggers, require('react-dom').createPortal(card, document.body))
    }

    /**
     * Per-entry isolation: a render failure must not silently erase the seat. The
     * slot runtime abdicates a crashed entry (and the shipped seat comes back), so
     * this boundary keeps a visible, explainable control and logs the reason.
     */
    class SeatBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false }
      }

      static getDerivedStateFromError() {
        return { failed: true }
      }

      componentDidCatch(error) {
        console.error('[dsh-model-provider-prefix] seat render failed:', error)
      }

      render() {
        if (this.state.failed) {
          return React.createElement(
            'span',
            { 'data-dsh-pm': '', 'data-dsh-pm-fallback': '', title: 'model picker unavailable — see the console' },
            'Model',
          )
        }
        return React.createElement(ModelSeat, this.props)
      }
    }

    /**
    /**
     * Register the seat over the profile's model directory service.
     * @param slots - the slot registry service.
     * @param models - the model directory service.
     * @param sessions - the session service, for subagent availability.
     * @returns the slot disposer, or undefined when registration was rejected.
     */

    function registerSeat(slots, models, sessions) {
      var current = null

      /* One registration pass: drop the previous entry first, so a retry cannot stack. */
      function attempt() {
        try {
          if (current !== null) {
            current()
            current = null
          }
          current = slots.inject('conversation.input.model', function () {
            var disposer = slots.register({
              name: 'conversation.input.model',
              /* Lower than the shipped seat's default 0; the slot renders the lowest priority entry. */
              priority: -1,
              inject: function (sessionId) {
                var directory = models.directoryFor(sessionId)
                var available = sessions.subagentAddress(sessionId) === undefined
                return {
                  modelSeat: {
                    available: available,
                    directory: directory.store,
                    load: function () {
                      if (!available) return
                      directory.load().catch(function () {
                        /* Catalog failures surface as retry rows in the provider column. */
                      })
                    },
                    select: function (selection) {
                      if (!available) return Promise.resolve(undefined)
                      return directory.select(selection)
                    },
                  },
                }
              },
            }, SeatBoundary)
            return disposer
          })
        } catch (error) {
          console.error('[dsh-model-provider-prefix] seat registration failed:', error)
        }
      }

      /* The composer commits its children table after our first pass, so an entry registered
         earlier is not part of the rendered set until something registers it again.
         Re-register on a short ladder, then keep a slow retry going until our own trigger
         actually shows up in the DOM: the slot registry can report the entry as active while
         React has not re-rendered yet, so only the rendered marker proves the seat is ours.
         Each pass disposes the previous entry first, so retries cannot stack. */
      var RETRY_DELAYS = [60, 150, 350, 700, 1200, 2000, 3200, 4500]
      var SLOW_RETRY_MS = 1500
      var MAX_SLOW_RETRIES = 60
      var step = 0
      var timer = null

      function seatRendered() {
        try {
          return document.querySelector('[data-dsh-pm-trigger]') !== null
        } catch (error) {
          return true
        }
      }

      function scheduleNext() {
        var delay
        if (step < RETRY_DELAYS.length) delay = RETRY_DELAYS[step]
        else if (step - RETRY_DELAYS.length < MAX_SLOW_RETRIES) delay = SLOW_RETRY_MS
        else return
        step += 1
        timer = setTimeout(function () {
          timer = null
          attempt()
          if (seatRendered()) return
          scheduleNext()
        }, delay)
      }

      attempt()
      if (!seatRendered()) scheduleNext()
      return function () {
        if (timer !== null) clearTimeout(timer)
        timer = null
        if (current !== null) current()
      }
    }

    /**
     * Shadow the composer model seat with the split model/effort control.
     *
     * The services arrive two ways depending on how the client tree mounted the
     * plugin: already on the context when `inject` was resolved before `apply`, or
     * only inside the nested `ctx.inject` scope. Both paths end in the same
     * registration.
     * @param ctx - client root context.
     */
    function apply(ctx) {
      ensureStyle()
      var ready = ctx.slots !== undefined && ctx.modelDirectories !== undefined && ctx.sessions !== undefined
      if (ready) {
        registerSeat(ctx.slots, ctx.modelDirectories, ctx.sessions)
        return
      }
      ctx.inject(['slots', 'modelDirectories', 'sessions'], function (scope) {
        registerSeat(scope.slots, scope.modelDirectories, scope.sessions)
      })
    }

    /* Services this browser half needs before `apply` may touch them. */
    var inject = ['slots', 'modelDirectories', 'sessions']

    exports.name = 'dsh-model-provider-prefix'
    exports.inject = inject
    exports.apply = apply
    /* Test-only seams: the row builders are pure and carry the menu's content rules. */
    exports.__internals = {
      ModelSeat: ModelSeat,
      SeatBoundary: SeatBoundary,
      resolve: resolve,
      groupById: groupById,
      effortLabel: effortLabel,
      providerRows: providerRows,
      modelRows: modelRows,
      effortRows: effortRows,
    }
    return module.exports
  },
})
