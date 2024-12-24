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

  describe('#extractIds', () => {
    const message = {
      getId () { return 'abc' },
      getHeader (header) {
        return (header === 'Message-Id') ? 'rfc822abc' : undefined
      }
    }

    it('default', () => {
      assert.deepEqual(
        extractor.extractIds(message),
        [
          'abc',
          'https://mail.google.com/mail/u/0/#search/rfc822msgid%3Arfc822abc'
        ]
      )
    })

    it('withLink disabled', () => {
      assert.equal(extractor.extractIds(message, false), 'abc')
    })
  })

  describe('#messageSearchUrl', () => {
    it('abc', () => {
      assert.equal(extractor.messageSearchUrl('abc'), 'https://mail.google.com/mail/u/0/#search/rfc822msgid%3Aabc')
    })

    it('<abc>', () => {
      assert.equal(extractor.messageSearchUrl('<abc>'), 'https://mail.google.com/mail/u/0/#search/rfc822msgid%3Aabc')
    })
  })
})
