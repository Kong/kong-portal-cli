import tap from 'tap'
import Config from './Config'

tap.test('Instanciate properly', (t) => {
  const c = new Config('moon', 'apollo', { encoding: 'utf16' })
  t.same(c, { filename: 'apollo', location: 'moon', data: null, encoding: 'utf16', path: 'moon/apollo' })
  const cEncoding = new Config('moon', 'apollo')
  t.same(cEncoding, { filename: 'apollo', location: 'moon', data: null, encoding: 'utf8', path: 'moon/apollo' })
  t.end()
})

tap.test('Loads the data', async (t) => {
  const _Config = t.mock('./Config', {
    'fs-extra': {
      readFile: (path) => {
        t.equal(path, 'moon/apollo')
        return 'foo'
      },
    },
  }).default

  const c = new _Config('moon', 'apollo', { encoding: 'utf8' })
  t.equal(c.data, null)
  await c.load()
  t.equal(c.data, 'foo')

  t.end()
})

tap.test('Fails at loading the data', async (t) => {
  const _Config = t.mock('./Config', {
    'fs-extra': {
      readFile: () => {
        throw 'error'
      },
    },
  }).default

  const c = new _Config('moon', 'apollo', { encoding: 'utf8' })
  t.equal(c.data, null)
  await c.load()
  t.equal(c.data, null)

  t.end()
})

tap.test('Saves the data on the filesystem', async (t) => {
  let assertData: string
  let assertPath: string
  const _Config = t.mock('./Config', {
    'fs-extra': {
      writeFile: (path, content) => {
        t.equal(assertData, content)
        t.equal(assertPath, path)
      },
    },
  }).default

  const c = new _Config('moon', 'apollo')
  c.data = { foo: 'bar', fiz: 'buz' }
  assertPath = c.path
  assertData = c.dump()
  await c.save()
  t.end()
})

tap.test('Dump the data', (t) => {
  const c = new Config('moon', 'apollo')
  c.data = { foo: 'bar', fiz: 'buz' }
  t.equal(c.dump(), 'foo: bar\nfiz: buz\n')

  t.end()
})

// TODO: find a way to mock console
// to check output. t.mock seems not able to
tap.test('print the data in the console', (t) => {
  const c = new Config('moon', 'apollo')
  c.toConsole()
  c.data = { foo: 'bar', fiz: 'buz' }
  c.toConsole()
  t.end()
})
