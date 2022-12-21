import { UsageError } from 'clipanion'
import tap from 'tap'
import { arrayPartition, MissingWorkspaceError } from './helpers'

tap.test('It throws an Usage Error', (t) => {
  t.throws(() => {
    MissingWorkspaceError('foo')
  }, UsageError)
  t.end()
})

tap.test('arrayPartition() returns correct partitioned results', (t) => {
  const res = arrayPartition([1, 2, 3, 4, 5, 6], (el) => el < 4)
  t.match(res.matched, [1, 2, 3])
  t.match(res.mismatched, [4, 5, 6])
  t.end()
})
