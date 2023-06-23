import tap from 'tap'
import Workspace from './Workspace'

tap.test('Fails at init', async (t): Promise<void> => {
  await Workspace.init('foo')
    .then((): void => {
      t.fail('should not throw')
    })
    .catch((e): void => {
      t.ok(e)
    })
  t.end()
})
