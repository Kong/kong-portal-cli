import tap from 'tap'
import { UsageError } from 'clipanion'

tap.test('Should succeed', async (t): Promise<void> => {
  let spinnerFailCalled = false
  let spinnerSucceedCalled = false
  const _e = t.mock('./enable', {
    '../core/Workspace': {
      init: async () => {
        return { name: 'foo', config: {} }
      },
    },
    '../core/HTTP/RestClient': function () {
      return {
        enablePortal: () => {
          return
        },
      }
    },
    ora: () => {
      return {
        start: () => {
          return
        },
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

tap.test('Fail because of missing workspace', async (t): Promise<void> => {
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

tap.test('Fail because of portal enablement error', async (t): Promise<void> => {
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
        start: () => {
          return
        },
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
    .catch(() => t.fail())

  t.end()
})
