import tap from 'tap'
// import config from './config'
import { UsageError } from 'clipanion'

// tap.test('Succeed', async t => {
//   const _config = tap.mock('./config', {
//     '../core/Workspace': {},
//     '../core/Config': {}
//   })
//   await _config({ workspace: 'foo' })
// 
// })

tap.test('Fails because missing workspace', async t => {
  const _config = tap.mock('./config', {
    '../core/Workspace': {
      exists: async () => { return false },
      getDirectoryPath: () => { return 'path' }
    },
    '../core/Config': {}
  }).default

  await _config({ workspace: 'foo' })
    .then(() => t.fail('Should Throw'))
    .catch((e: Error) => {
      t.ok(e)
      t.type(e, UsageError)
    })
  t.end()
})

tap.test('Fails because missing theme', async t => {
  const noop = () => { }
  const _config = tap.mock('./config', {
    '../core/Workspace': {
      exists: async () => true,
      getDirectoryPath: () => 'path',
      init: async () => {
        return {
          getCurrentThemeName: () => 'theme',
          config: { toConsole: noop },
          portalConfig: { toConsole: noop },
          routerConfig: { toConsole: noop },
          toConsole: () => { }
        }
      },
      getCurrentTheme: async () => { throw Error('F') }
    },
    '../core/Config': {}
  }).default

  await _config({ workspace: 'foo' })
    .then(() => t.fail('Should throw'))
    .catch((e:Error) => {
      t.ok(e)
      t.type(e, UsageError)
    })
  t.end()
})

