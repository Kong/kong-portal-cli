import tap from 'tap'
import { UsageError } from 'clipanion'

tap.test('Should succeed', async (t) => {
  let spinnerFailCalled = false
  let spinnerSucceedCalled = false
  const _e = t.mock('./enable', {
    '../core/Workspace': {
      init: async () => {
        return { name: 'foo', config: {} }
      },
    },
    '../core/HTTP/RestClient': function() {
      return {
        enablePortal: () => {},
      }
    },
    ora: () => {
      return {
        start: () => {},
        succeed: () => {
          spinnerSucceedCalled = true
        },
        fail: (e) => {
          t.equal(e, 'ddd')
          spinnerFailCalled = true
        },
      }
    },
  }).default
  await _e({ workspace: 'foo', disableSSLVerification: false })
    .then(() => {
      t.notOk(spinnerFailCalled)
      t.ok(spinnerSucceedCalled)
    })
    .catch(() => t.fail('Should not throw'))

  t.end()
})

tap.test('Fail because of missing workspace', async (t) => {
  const _e = t.mock('./enable', {
    '../core/Workspace': {
      getDirectoryPath: () => 'path',
      init: async () => {
        throw 'error'
      },
    },
    '../core/HTTP/RestClient': {},
    ora: {},
  }).default

  await _e({ workspace: 'foo', disableSSLVerification: false })
    .then(() => t.fail('Should throw'))
    .catch((e: Error) => {
      t.ok(e)
      t.type(e, UsageError)
    })
})

tap.test('Fail because of portal enablement error', async (t) => {
  let spinnerFailCalled = false
  let spinnerSucceedCalled = false
  const _e = t.mock('./enable', {
    '../core/Workspace': {
      init: async () => {
        return { name: 'foo', config: {} }
      },
    },
    ora: () => {
      return {
        start: () => {},
        succeed: () => {
          spinnerSucceedCalled = true
        },
        fail: () => {
          spinnerFailCalled = true
        },
      }
    },
  }).default
  await _e({ workspace: 'foo', disableSSLVerification: false })
    .then(() => {
      t.ok(spinnerFailCalled)
      t.notOk(spinnerSucceedCalled)
    })
    .catch((e: Error) => t.fail())

  t.end()
})
