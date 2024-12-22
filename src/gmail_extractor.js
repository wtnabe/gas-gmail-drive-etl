/// <reference types="google-apps-script" />
/// <reference path="./sheet_store.js" />
/// <reference path="./folder_store.js" />

/**
 * メールと添付ファイルの保存を扱うクラス
 */
class GmailExtractor {
  /**
   * @param {object} params
   * @param {GoogleAppsScript.Gmail.GmailApp} params.app - GmailApp
   * @param {object} params.query - query for Gmail.search see https://support.google.com/mail/answer/7190
   * @param {Function} params.filter - additional fiter for target messages
   * @param {SheetStore} params.sheetStore
   * @param {FolderStore} params.folderStore
   * @param {Function} params.extractProcess - 実際にmessageから取り出す処理
   */
  constructor ({
    app, query, filter, sheetStore, folderStore, extractProcess
  }) {
    const d = new Date()
    const today = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const todayString = today.toISOString().split('T')[0]

    /** @type {GoogleAppsScript.Gmail.GmailApp} */
    this.app = (typeof app !== 'undefined') ? app : GmailApp
    /** @type {object} 検索queryのobject表現（文字列検索は q を利用）*/
    this.query = query || { after: todayString, has: 'attachment' }
    /** @type {Function} */
    this.filter = filter ? filter.bind(this) : (() => true)
    /** @type {SheetStore} */
    this.sheetStore = sheetStore
    /** @type {FolderStore} */
    this.folderStore = folderStore
    /** @type {Function} */
    this.extractProcess = extractProcess ? extractProcess.bind(this) : (() => {})
  }

  /**
   * extract本体
   */
  execute () {
    const threads = this.search(this.buildQuery(this.query))

    threads.filter((thread) => {
      return !thread.isInSpam() && !thread.isInTrash()
    }).forEach((thread) => {
      const messages = this.app.getMessagesForThread(thread)
      messages.filter(this.filter).forEach((message) => {
        this.extractProcess(message, this.sheetStore, this.folderStore)
      })
    })
  }

  /**
   * Gmailを検索する
   *
   * @param {string} query
   * @returns {GoogleAppsScript.Gmail.GmailThread[]}
   */
  search (query) {
    return this.app.search(query)
  }

  /**
   * Gmailの検索のqueryを組み立てる
   *
   * see https://support.google.com/mail/answer/7190
   *
   * @param {object} params
   * @returns {string}
   */
  buildQuery (params) {
    return Object.entries(params).map(([k, v]) => {
      return (k === 'q') ? v : `${k}:${v}`
    }).join(' ')
  }

  /**
   * GmailMessageからidとなる情報を抽出する
   *
   * @param {GoogleAppsScript.Gmail.GmailMessage} message
   * @param {boolean} withLink
   * @returns {string[]}
   */
  extractIds (message, withLink = true) {
    const ids = [message.getId()]
    if (withLink) {
      ids.push(this.messageSearchUrl(message.getHeader('Message-Id').replace(/^</, '').replace(/>$/, '')))
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
  messageSearchUrl (messageId) {
    return `https://mail.google.com/mail/u/0/#search/rfc822msgid${encodeURIComponent(':' + messageId)}`
  }
}

/**
 * @param {object} params
 * @param {GoogleAppsScript.Gmail.GmailApp} params.app - GmailApp
 * @param {object} params.query - query for Gmail.search see https://support.google.com/mail/answer/7190
 * @param {Function} params.filter - additional fiter for target messages
 * @param {SheetStore} params.sheetStore
 * @param {FolderStore} params.folderStore
 * @param {Function} params.extractProcess - 実際にmessageから取り出す処理
 * @returns {GmailExtractor}
 */
function createGmailExtractor (params) { // eslint-disable-line no-unused-vars
  return new GmailExtractor(params)
}
