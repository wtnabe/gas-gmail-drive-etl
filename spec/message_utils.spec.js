import { describe, it } from 'vitest'
import assert from 'node:assert'
import gas from 'gas-local'

const app = gas.require(import.meta.dirname + '/../src')

describe('message utils', () => {
  describe('#extractIds', () => {
    const message = {
      getId () { return 'abc' },
      getHeader (header) {
        return (header === 'Message-Id') ? 'rfc822abc' : undefined
      }
    }

    it('default', () => {
      assert.deepEqual(
        app.extractIds(message),
        [
          'abc',
          'https://mail.google.com/mail/u/0/#search/rfc822msgid%3Arfc822abc'
        ]
      )
    })

    it('withLink disabled', () => {
      assert.equal(app.extractIds(message, false), 'abc')
    })
  })

  describe('#messageSearchUrl', () => {
    it('abc', () => {
      assert.equal(app.messageSearchUrl('abc'), 'https://mail.google.com/mail/u/0/#search/rfc822msgid%3Aabc')
    })

    it('<abc>', () => {
      assert.equal(app.messageSearchUrl('<abc>'), 'https://mail.google.com/mail/u/0/#search/rfc822msgid%3Aabc')
    })
  })

  describe('#stripSignature', () => {
    it('not include signature line', () => {
      assert.equal(app.stripSignature('abc'), 'abc')
    })

    it('includes signature delimiter', () => {
      assert.equal(
        app.stripSignature([
          'body',
          'lines',
          '',
          '-- ',
          'name <email@example.com>',
          '  department position contact'
        ].join('\r\n')),
        'body\r\nlines\r\n'
      )
    })
  })
})
