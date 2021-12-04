import { UsageError } from 'clipanion';
import tap from 'tap';
import { MissingWorkspaceError } from './helpers'

tap.test('It throws an Usage Error', t => {
  t.throws(() => { MissingWorkspaceError('foo') }, UsageError)
  t.end();
})
