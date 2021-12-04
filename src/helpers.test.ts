import { UsageError } from 'clipanion/lib/errors';
import tap, { Test } from 'tap';
import { MissingWorkspaceError } from './helpers'

tap.test('It throws an Usage Error', (t: Test) => {
  t.throws(() => { MissingWorkspaceError('foo') }, UsageError)
  t.end();
})
