/// <reference types="google-apps-script" />

/**
 * GmailMessageからidとなる情報を抽出する
 *
 * @param {GoogleAppsScript.Gmail.GmailMessage} message
 * @param {boolean} withLink
 * @returns {string[]}
 */
function extractIds (message, withLink = true) { // eslint-disable-line no-unused-vars
  const ids = [message.getId()]
  if (withLink) {
    ids.push(messageSearchUrl(message.getHeader('Message-Id')))
  }

  return ids
}

/**
 * message-idをもとに特定のメールだけの検索結果のURLを作る
 *
 * @see https://stackoverflow.com/questions/20780976/obtain-a-link-to-a-specific-email-in-gmail#answer-48014199
 * @param {string} messageId - RFC 822 の message id
 * @returns {string}
 */
function messageSearchUrl (messageId) { // eslint-disable-line no-unused-vars
  const stripped = messageId.replace(/^</, '').replace(/>$/, '')

  return `https://mail.google.com/mail/u/0/#search/rfc822msgid${encodeURIComponent(':' + stripped)}`
}

/**
 * @see https://en.wikipedia.org/wiki/Signature_block
 * @param {string} body
 * @returns {string}
 */
function stripSignature (body) { // eslint-disable-line no-unused-vars
  const usenetDelimiter = '^-- '

  return body.replace(new RegExp(`\r\n${usenetDelimiter}\r\n.+`, 'sm'), '')
}
