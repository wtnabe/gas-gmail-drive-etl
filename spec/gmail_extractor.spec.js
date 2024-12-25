/// <reference types="google-apps-script" />

import { describe, it } from 'vitest'
import assert from 'node:assert'
import gas from 'gas-local'

const app = gas.require(import.meta.dirname + '/../src')

describe('GmailExtractor', () => {
  const extractor = app.createGmailExtractor({ app: {} })

  describe('#buildQuery', () => {
    it('{ q: "abc" }', () => {
      assert.equal(extractor.buildQuery({ q: 'abc' }), 'abc')
    })

    it('q and has:attachment', () => {
      assert.equal(
        extractor.buildQuery({ q: 'abc', has: 'attachment' }),
        'abc has:attachment'
      )
    })
  })

  describe('#filter', () => {
    it('default filter returns true', () => {
      assert(extractor.filter())
    })
  })
})
