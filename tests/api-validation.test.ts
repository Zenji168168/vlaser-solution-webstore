import './mock-server-only'
import test from 'node:test'
import assert from 'node:assert/strict'
import { validateProductIdsRequest } from '../app/api/products/by-ids/route'

test('Recently Viewed API - Request Validation', async (t) => {
  await t.test('accepts valid product IDs', () => {
    const result = validateProductIdsRequest({ ids: ['p0001', 'p0050', 'p1382'] })
    assert.strictEqual(result.valid, true)
    assert.deepEqual(result.ids, ['p0001', 'p0050', 'p1382'])
    assert.strictEqual(result.error, undefined)
  })

  await t.test('rejects empty body or non-object', () => {
    const result = validateProductIdsRequest(null)
    assert.strictEqual(result.valid, false)
    assert.strictEqual(result.error, 'JSON object body required')

    const resultStr = validateProductIdsRequest('invalid')
    assert.strictEqual(resultStr.valid, false)
  })

  await t.test('rejects missing ids key', () => {
    const result = validateProductIdsRequest({ otherKey: [] })
    assert.strictEqual(result.valid, false)
    assert.strictEqual(result.error, 'ids array required')
  })

  await t.test('rejects non-array ids', () => {
    const result = validateProductIdsRequest({ ids: 'p0001' })
    assert.strictEqual(result.valid, false)
    assert.strictEqual(result.error, 'ids must be an array')
  })

  await t.test('rejects excessive IDs (> 10)', () => {
    const result = validateProductIdsRequest({
      ids: ['p0001', 'p0002', 'p0003', 'p0004', 'p0005', 'p0006', 'p0007', 'p0008', 'p0009', 'p0010', 'p0011']
    })
    assert.strictEqual(result.valid, false)
    assert.strictEqual(result.error, 'maximum of 10 ids allowed')
  })

  await t.test('rejects non-string IDs', () => {
    const result = validateProductIdsRequest({ ids: ['p0001', 123] })
    assert.strictEqual(result.valid, false)
    assert.strictEqual(result.error, 'id at index 1 must be a string')
  })

  await t.test('rejects invalid ID format', () => {
    const result = validateProductIdsRequest({ ids: ['p0001', 'invalid-id'] })
    assert.strictEqual(result.valid, false)
    assert.strictEqual(result.error, 'id at index 1 has invalid format')
  })

  await t.test('rejects incorrect prefix or numbers length', () => {
    const resultShort = validateProductIdsRequest({ ids: ['p001'] })
    assert.strictEqual(resultShort.valid, false)

    const resultWrongPrefix = validateProductIdsRequest({ ids: ['x0001'] })
    assert.strictEqual(resultWrongPrefix.valid, false)
  })
})
