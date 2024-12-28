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

  describe('#attachmentTimestamp', () => {
    const fakeMessage = {
      getDate () {
        return new Date('2024-12-28T00:00:00+0900')
      }
    }

    describe('default date', () => {
      it('returns 8 digit string', () => {
        assert.equal(
          extractor.attachmentTimestamp({ message: fakeMessage }),
          '20241228'
        )
      })
    })

    describe('with time', () => {
      it('returns 12 digit string', () => {
        assert.equal(
          extractor.attachmentTimestamp({ message: fakeMessage, withTime: true }),
          '20241228000000'
        )
      })
    })
  })
})
