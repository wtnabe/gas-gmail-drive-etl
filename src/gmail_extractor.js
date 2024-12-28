/* global GmailApp, s2 */
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
   * @param {string} params.attachmentPrefix - 保存するファイル名のprefix 'date' | 'time'
   */
  constructor ({
    app, query, filter, sheetStore, folderStore, extractProcess, attachmentPrefix
  }) {
    const d = new Date()
    const today = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const todayString = today.toISOString().split('T')[0]

    /** @type {GoogleAppsScript.Gmail.GmailApp} */
    this.app = (typeof app !== 'undefined') ? app : GmailApp
    /** @type {object} 検索queryのobject表現（文字列検索は q を利用）*/
    this.query = query || { after: todayString, has: 'attachment' }
    /** @type {Function} */
    this.filter = filter ? filter.bind(this) : () => true
    /** @type {SheetStore} */
    this.sheetStore = sheetStore
    /** @type {FolderStore} */
    this.folderStore = folderStore
    /** @type {string} */
    this.attachmentPrefix = attachmentPrefix ? attachmentPrefix : 'date'
    /** @type {Function} */
    this.extractProcess = extractProcess ? extractProcess.bind(this) : () => {}
  }

  /**
   * 全体の流れ
   *
   * @returns {any[] | null}
   */
  execute () {
    const threads = this.search(this.buildQuery(this.query))

    const results = threads.filter((thread) => {
      return !thread.isInSpam() && !thread.isInTrash()
    }).flatMap((thread) => {
      const messages = this.app.getMessagesForThread(thread)
      return messages.filter(this.filter).map((message) => {
        const result = this.extract(message)
        return result ? result : null
      }).filter((e) => e)
    })

    return results.length > 0 ? results : null
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
   * @param {GoogleAppsScript.Gmail.GmailMessage} message
   * @returns {any[] | null}
   */
  extract (message) {
    const attachedFiles = this.folderStore
          ? this.storeAttachments(message)
          : []

    return this.extractProcess(message, this.sheetStore, attachedFiles)
  }

  /**
   * @param {GoogleAppsScript.Gmail.GmailMessage} message
   * @returns {GoogleAppsScript.Drive.File[]}
   */
  storeAttachments (message) {
    return message.getAttachments().map((attachment) => {
      return this.folderStore.store(
        attachment,
        this.attachmentTimestamp({
          message,
          withTime: this.attachmentPrefix === 'time'
        })
      )
    })
  }

  /**
   * @returns {string[]}
   */
  attachmentPrefixOrder () {
    return ['date', 'time']
  }

  /**
   * message の Date から local timezone の日付文字列を得る
   *
   * @param {object} params
   * @param {GoogleAppsScript.Gmail.GmailMessage} params.message
   * @param {boolean} params.withTime
   * @param {string} params.sep
   * @returns {string}
   */
  attachmentTimestamp ({ message, withTime = false, sep = '' }) {
    const d = message.getDate()

    const date = [d.getFullYear(), s2(d.getMonth() + 1), s2(d.getDate())].join(sep)

    return withTime
      ? date + [s2(d.getHours()), s2(d.getMinutes()), s2(d.getSeconds())].join(sep)
      : date
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
   * @param {string} params.attachmentPrefix - 保存するファイル名のprefix 'date' | 'time'
 * @returns {GmailExtractor}
 */
function createGmailExtractor (params) { // eslint-disable-line no-unused-vars
  return new GmailExtractor(params)
}
