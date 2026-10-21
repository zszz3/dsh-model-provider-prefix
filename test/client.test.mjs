/**
 * Offline checks for dsh-model-provider-prefix.
 *
 * Run with: node --test test/client.test.mjs
 *
 * These cover what can break the plugin before it is installed: the bundle
 * manifest discovery (`dsh.bundle`/`dsh.client`), the shadow registration on the
 * composer's named model seat, the menu content rules (provider list first, then
 * that provider's models, plus a separate effort list), and the token-only CSS.
 */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Minimal React surface the bundle uses. State is inert: the component is called
 * as a plain function, so only the closed (trigger) tree is rendered here and the
 * menu content is exercised through the pure row builders instead.
 */
const React = {
  Fragment: Symbol('Fragment'),
  /* The seat registers behind an error boundary, so the base class must exist. */
  Component: class {
    constructor(props) {
      this.props = props
    }

    setState(next) {
      this.state = { ...this.state, ...(typeof next === 'function' ? next(this.state) : next) }
    }
  },
  createElement(type, props, ...children) {
    return { type, props: props ?? {}, children }
  },
  useRef(initial) {
    return { current: initial ?? null }
  },
  useState(initial) {
    return [typeof initial === 'function' ? initial() : initial, () => {}]
  },
  useEffect() {},
  useSyncExternalStore(_subscribe, getSnapshot) {
    return getSnapshot()
  },
}

/** A directory-like handle: the same snapshot the model seat renders from. */
function fakeDirectory(state) {
  return {
    store: {
      subscribe: () => () => {},
      getSnapshot: () => state,
    },
    loads: 0,
    selects: [],
    load() {
      this.loads += 1
      return Promise.resolve(state)
    },
    select(selection) {
      this.selects.push(selection)
      return Promise.resolve({ ok: true, value: undefined })
    },
  }
}

/** One session's directory snapshot. */
function snapshot(current, groups, extras = {}) {
  return {
    current,
    routable: true,
    groups,
    failures: [],
    status: 'ready',
    pending: null,
    ...extras,
  }
}

/** The shipped catalog shape for a provider group. */
function group(id, name, models) {
  return { id, name, models }
}

let bundleSeq = 0

/** Load the browser bundle the way the shell does and return its exports. */
async function loadBundle() {
  let captured
  globalThis.window = { __ModuleLoader__: { load: (entry) => { captured = entry } } }
  const file = pathToFileURL(join(root, 'client/client.js')).href
  await import(`${file}?v=${bundleSeq++}`)
  assert.ok(captured, 'bundle must call window.__ModuleLoader__.load')
  return { entry: captured, exports: captured.factory((id) => (id === 'react' ? React : {})) }
}

/**
 * Run the plugin's apply against a fake client scope.
 * @param exports - bundle exports under test.
 * @param directory - directory handle returned by `modelDirectories.directoryFor`.
 * @param subagent - whether the session is an addressed subagent session.
 * @returns the captured slot registration and the ids it asked for.
 */
function mount(exports, directory, subagent = undefined) {
  const seen = { injected: null, options: null, component: null, sessionId: null }
  const slots = {
    inject(key, run) {
      seen.injected = key
      run()
    },
    register(options, component) {
      seen.options = options
      seen.component = component
      return () => {}
    },
  }
  const scope = {
    slots,
    modelDirectories: {
      directoryFor: (id) => {
        seen.sessionId = id
        return directory
      },
    },
    sessions: {
      subagentAddress: (id) => (subagent === undefined ? undefined : { sessionId: id }),
    },
  }
  exports.apply({ inject: (_names, run) => { run(scope) } })
  return seen
}

/** Collect the rendered text of a stubbed element tree. */
function text(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(text).join('')
  return (node.children ?? []).map(text).join('')
}

/** Render the seat for one session. */
function renderSeat(exports, directory, locked = false, subagent = undefined) {
  const seen = mount(exports, directory, subagent)
  const face = seen.options.inject('s1')
  const Seat = exports.__internals.ModelSeat
  assert.equal(seen.component, exports.__internals.SeatBoundary, 'the slot entry is the guarded component')
  return { seen, face, tree: Seat({ ...face, locked }) }
}

test('manifest declares the bundle row and the client half', async () => {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  assert.equal(pkg.name, 'dsh-model-provider-prefix')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(pkg.dsh.client.platform, 'web')
  assert.equal(pkg.exports['./client'], './client/client.js')
  assert.equal(pkg.main, 'index.js')
  assert.ok(pkg.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-model-selection'))
  assert.ok(pkg.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-conversation'))
  assert.ok(pkg.files.includes('client/client.js'))
  const patch = await readFile(join(root, 'cordis.patch.yml'), 'utf8')
  assert.match(patch, new RegExp(`id: ${pkg.name}`))
  assert.match(patch, new RegExp(`name: '${pkg.name}'`))
})

test('bundle exports a Cordis client plugin under its own id', async () => {
  const { entry, exports } = await loadBundle()
  assert.equal(entry.id, 'dsh-model-provider-prefix')
  assert.equal(exports.name, 'dsh-model-provider-prefix')
  assert.deepEqual([...exports.inject], ['slots', 'modelDirectories', 'sessions'])
  assert.equal(typeof exports.apply, 'function')
  assert.deepEqual(
    Object.keys(exports.__internals).sort(),
    ['ModelSeat', 'SeatBoundary', 'effortLabel', 'effortRows', 'groupById', 'modelRows', 'providerRows', 'resolve'],
  )
})

test('apply shadows the named model seat instead of adding a cell beside it', async () => {
  const { exports } = await loadBundle()
  const state = snapshot({ provider: 'deepseek', model: 'deepseek-v4' }, [])
  const directory = fakeDirectory(state)
  const seen = mount(exports, directory)

  assert.equal(seen.injected, 'conversation.input.model')
  assert.equal(seen.options.name, 'conversation.input.model')
  assert.equal(seen.options.priority, -1, 'must sort before the shipped seat (default 0)')

  const face = seen.options.inject('session-1')
  assert.equal(seen.sessionId, 'session-1')
  assert.equal(face.modelSeat.available, true)
  assert.equal(face.modelSeat.directory, directory.store)

  face.modelSeat.load()
  assert.equal(directory.loads, 1)
  await face.modelSeat.select({ provider: 'deepseek', model: 'deepseek-v4', reasoningEffort: 'high' })
  assert.deepEqual(directory.selects, [{ provider: 'deepseek', model: 'deepseek-v4', reasoningEffort: 'high' }])
})

test('apply registers straight from the context when the services are already injected', async () => {
  const { exports } = await loadBundle()
  const directory = fakeDirectory(snapshot({ provider: 'p', model: 'm' }, []))
  const seen = { key: null, options: null, component: null }
  const scope = {
    slots: {
      inject: (key, run) => {
        seen.key = key
        run()
      },
      register: (options, component) => {
        seen.options = options
        seen.component = component
        return () => {}
      },
    },
    modelDirectories: { directoryFor: () => directory },
    sessions: { subagentAddress: () => undefined },
  }
  let nested = 0
  exports.apply({ ...scope, inject: () => { nested += 1 } })

  assert.equal(nested, 0, 'a resolved context needs no nested inject')
  assert.equal(seen.key, 'conversation.input.model')
  assert.equal(seen.options.priority, -1)
  assert.equal(seen.component, exports.__internals.SeatBoundary)
})

test('a rejected registration is logged instead of crashing the composer', async () => {
  const { exports } = await loadBundle()
  const directory = fakeDirectory(snapshot({ provider: 'p', model: 'm' }, []))
  const logged = []
  const original = console.error
  console.error = (...args) => logged.push(args)
  try {
    exports.apply({
      slots: {
        inject: (_key, run) => run(),
        register: () => {
          throw new Error('slot is taken')
        },
      },
      modelDirectories: { directoryFor: () => directory },
      sessions: { subagentAddress: () => undefined },
      inject: () => {},
    })
  } finally {
    console.error = original
  }
  assert.equal(logged.length, 1)
  assert.match(String(logged[0][0]), /seat registration failed/)
})

test('addressed subagent sessions hand back an unavailable face', async () => {
  const { exports } = await loadBundle()
  const directory = fakeDirectory(snapshot(null, []))
  const seen = mount(exports, directory, 'subagent')
  const face = seen.options.inject('child')

  assert.equal(face.modelSeat.available, false)
  face.modelSeat.load()
  assert.equal(directory.loads, 0, 'no catalog RPC for addressed subagents')
  await face.modelSeat.select({ provider: 'a', model: 'b' })
  assert.deepEqual(directory.selects, [])
})

test('resolve reads the display names off the loaded catalog', async () => {
  const { exports } = await loadBundle()
  const state = snapshot({ provider: 'opencode-go', model: 'deepseek-v4-flash' }, [
    group('opencode-go', 'OpenCode Go', [{ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' }]),
  ])
  const info = exports.__internals.resolve(state)

  assert.equal(info.providerName, 'OpenCode Go')
  assert.equal(info.modelName, 'DeepSeek V4 Flash')
  assert.equal(info.current, state.current)
  assert.equal(info.group.id, 'opencode-go')
  assert.equal(info.model.id, 'deepseek-v4-flash')
})

test('resolve falls back to raw ids when the catalog entry is gone', async () => {
  const { exports } = await loadBundle()
  const info = exports.__internals.resolve(snapshot(
    { provider: 'opencode-go', model: 'retired-model' },
    [group('opencode-go', 'OpenCode Go', [])],
  ))

  assert.equal(info.providerName, 'OpenCode Go')
  assert.equal(info.modelName, 'retired-model')
  assert.equal(info.model, null)
})

test('resolve returns null without a session selection', async () => {
  const { exports } = await loadBundle()
  assert.equal(exports.__internals.resolve(snapshot(null, [])), null)
  assert.equal(exports.__internals.resolve(undefined), null)
})

test('the model column follows the provider it was pointed at, not the live one', async () => {
  const { groupById, modelRows, resolve } = (await loadBundle()).exports.__internals
  const state = snapshot({ provider: 'deepseek', model: 'deepseek-v4' }, [
    group('deepseek', 'DeepSeek', [{ id: 'deepseek-v4', name: 'DeepSeek V4' }]),
    group('opencode-go', 'OpenCode Go', [{ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' }]),
  ])

  assert.equal(resolve(state).group.id, 'deepseek', 'the trigger keeps describing the live selection')
  assert.equal(groupById(state, 'opencode-go').name, 'OpenCode Go')
  assert.deepEqual(
    modelRows(groupById(state, 'opencode-go'), '', state.current).map(row => row.model),
    ['deepseek-v4-flash'],
    'pointing at another provider shows that provider models',
  )
  assert.equal(groupById(state, 'missing'), null)
  assert.equal(groupById(undefined, 'deepseek'), null)
})

test('effortLabel prefers catalog names and marks the provider default', async () => {
  const { effortLabel } = (await loadBundle()).exports.__internals
  const reasoning = {
    efforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }],
  }

  assert.equal(effortLabel(undefined, undefined), undefined, 'models without reasoning take no effort')
  assert.equal(effortLabel(reasoning, undefined), 'Default')
  assert.equal(effortLabel(reasoning, 'high'), 'High')
  assert.equal(effortLabel(reasoning, 'vendor-only'), 'vendor-only')
})

test('providerRows lists every loaded provider, then failed ones as retries', async () => {
  const { providerRows } = (await loadBundle()).exports.__internals
  const state = snapshot({ provider: 'deepseek', model: 'deepseek-v4' }, [
    group('deepseek', 'DeepSeek', [{ id: 'deepseek-v4' }, { id: 'deepseek-v4-flash' }]),
    group('opencode-go', 'OpenCode Go', [{ id: 'deepseek-v4-flash' }]),
  ], { failures: [{ id: 'broken', name: 'Broken Vendor', message: 'timeout' }] })
  const rows = providerRows(state, 'deepseek')

  assert.deepEqual(rows.map(row => row.label), ['DeepSeek', 'OpenCode Go', 'Broken Vendor'])
  assert.deepEqual(rows.map(row => row.count ?? null), [2, 1, null])
  assert.deepEqual(rows.map(row => row.checked), [true, false, false])
  assert.deepEqual(rows.map(row => row.kind), ['provider', 'provider', 'retry'])
  assert.equal(rows[2].note, 'retry')
})

test('modelRows filters one provider by name or id and marks the live route', async () => {
  const { modelRows } = (await loadBundle()).exports.__internals
  const state = snapshot({ provider: 'opencode-go', model: 'deepseek-v4-flash' }, [])
  const opencode = group('opencode-go', 'OpenCode Go', [
    { id: 'deepseek-v4', name: 'DeepSeek V4' },
    { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' },
    { id: 'glm-5', name: 'GLM 5', reasoning: { efforts: [{ id: 'high', name: 'High' }], defaultEffort: 'high' } },
  ])

  const all = modelRows(opencode, '', state.current)
  assert.deepEqual(all.map(row => row.label), ['DeepSeek V4', 'DeepSeek V4 Flash', 'GLM 5'])
  assert.deepEqual(all.map(row => row.checked), [false, true, false])
  assert.deepEqual(all.map(row => row.provider), ['opencode-go', 'opencode-go', 'opencode-go'])
  assert.deepEqual(all.map(row => row.defaultEffort ?? null), [null, null, 'high'], 'each row carries the effort a pick starts on')

  assert.deepEqual(modelRows(opencode, 'FLASH', state.current).map(row => row.model), ['deepseek-v4-flash'])
  assert.deepEqual(modelRows(opencode, 'glm', state.current).map(row => row.model), ['glm-5'])
  assert.deepEqual(modelRows(opencode, '  ', state.current).length, 3, 'blank query keeps the list')
  assert.deepEqual(modelRows(null, 'x', state.current), [])
})

test('effortRows offers the provider default only when the model leaves it open', async () => {
  const { effortRows } = (await loadBundle()).exports.__internals
  const open = { efforts: [{ id: 'low', name: 'Low' }], defaultEffort: undefined }
  const pinned = { efforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }], defaultEffort: 'low' }

  const withDefault = effortRows(open, undefined)
  assert.deepEqual(withDefault.map(row => row.label), ['Default', 'Low'])
  assert.deepEqual(withDefault.map(row => row.checked), [true, false])
  assert.equal(withDefault[0].effort, undefined)

  const withoutDefault = effortRows(pinned, 'high')
  assert.deepEqual(withoutDefault.map(row => row.label), ['Low', 'High'])
  assert.deepEqual(withoutDefault.map(row => row.checked), [false, true])
  assert.deepEqual(effortRows(undefined, 'high'), [])
})

test('the closed seat renders Provider/Model plus a separate effort trigger', async () => {
  const { exports } = await loadBundle()
  const state = snapshot({ provider: 'opencode-go', model: 'deepseek-v4-flash', reasoningEffort: 'high' }, [
    group('opencode-go', 'OpenCode Go', [{
      id: 'deepseek-v4-flash',
      name: 'DeepSeek V4 Flash',
      reasoning: { efforts: [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }], defaultEffort: 'low' },
    }]),
  ])
  const { tree } = renderSeat(exports, fakeDirectory(state))

  assert.equal(tree.type, 'span')
  assert.equal(tree.props['data-dsh-pm'], '')

  const [modelTrigger, effortTrigger] = tree.children
  assert.equal(modelTrigger.props.title, 'OpenCode Go/DeepSeek V4 Flash', 'tooltip carries the full string')
  assert.equal(modelTrigger.props['data-dsh-pm-trigger'], '')
  assert.equal(modelTrigger.props['aria-haspopup'], 'menu')
  assert.equal(text(modelTrigger), 'OpenCode Go/DeepSeek V4 Flash')

  assert.equal(effortTrigger.props['data-dsh-pm-effort'], '')
  assert.equal(effortTrigger.props.title, 'High')
  assert.equal(text(effortTrigger), 'High', 'effort is its own trigger, not part of the model label')
})

test('a model without reasoning keeps the single model trigger', async () => {
  const { exports } = await loadBundle()
  const state = snapshot({ provider: 'opencode-go', model: 'glm-5' }, [
    group('opencode-go', 'OpenCode Go', [{ id: 'glm-5', name: 'GLM 5' }]),
  ])
  const { tree } = renderSeat(exports, fakeDirectory(state))

  assert.equal(tree.children.length, 1)
  assert.equal(text(tree.children[0]), 'OpenCode Go/GLM 5')
})

test('the effort trigger follows the model default before any pick', async () => {
  const { exports } = await loadBundle()
  const state = snapshot({ provider: 'p', model: 'm' }, [
    group('p', 'Provider', [{ id: 'm', name: 'M', reasoning: { efforts: [{ id: 'low', name: 'Low' }], defaultEffort: 'low' } }]),
  ])
  const { tree } = renderSeat(exports, fakeDirectory(state))

  assert.equal(text(tree.children[1]), 'Low')
})

test('locked disables both triggers', async () => {
  const { exports } = await loadBundle()
  const state = snapshot({ provider: 'p', model: 'm', reasoningEffort: 'low' }, [
    group('p', 'Provider', [{ id: 'm', name: 'M', reasoning: { efforts: [{ id: 'low', name: 'Low' }] } }]),
  ])
  const { tree } = renderSeat(exports, fakeDirectory(state), true)

  assert.equal(tree.children[0].props.disabled, true)
  assert.equal(tree.children[1].props.disabled, true)
})

test('an unavailable seat with no catalog renders nothing', async () => {
  const { exports } = await loadBundle()
  const { tree } = renderSeat(exports, fakeDirectory(snapshot(null, [])), false, 'subagent')

  assert.equal(tree, null)
})

test('styling stays on host tokens and needs no container query', async () => {
  const { exports } = await loadBundle()
  let css = ''
  globalThis.document = {
    getElementById: () => null,
    createElement: () => ({ set id(_value) {}, set textContent(value) { css = value } }),
    head: { appendChild() {} },
  }
  exports.apply({ inject: () => {} })
  delete globalThis.document

  assert.match(css, /--dsw-alias-label-secondary/)
  assert.match(css, /--dsw-radius-sm/)
  assert.match(css, /--dsw-menu-surface-fill/)
  assert.match(css, /--dsw-elevation-prominent/)
  assert.match(css, /\[data-dsh-pm-col="providers"\]/, 'provider column')
  assert.match(css, /\[data-dsh-pm-col="models"\]/, 'model column beside it')
  assert.match(css, /\[data-dsh-pm-row\]\[data-hover\]/, 'the pointed-at provider is marked')
  assert.doesNotMatch(css, /#[0-9a-f]{3,6}\b/i, 'no hardcoded colors')
  assert.doesNotMatch(css, /@container/, 'the shadowed seat sizes itself on the trigger')
})
