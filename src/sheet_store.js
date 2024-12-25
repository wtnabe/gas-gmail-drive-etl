/* global SpreadsheetApp, extractIds */
/// <reference types="google-apps-script" />
/// <reference path="./gmail_extractor.js" />
/// <reference path="./folder_store.js" />

/**
 * メールを保存するSpreadsheetを扱うクラス
 */
class SheetStore {
  /**
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheet
   * @param {GoogleAppsScript.Spreadsheet.SpreadsheetApp} app
   */
  constructor (sheet, app = SpreadsheetApp) {
    /** @type {GoogleAppsScript.Spreadsheet.Spreadsheet} */
    this.spreadSheet = sheet
    /** @type {GoogleAppsScript.Spreadsheet.SpreadsheetApp} */
    this.app = app
    /** @type {GoogleAppsScript.Spreadsheet.Sheet} */
    this.sheet = this.spreadSheet.getSheets()[0]
  }

  /**
   * すでにmessageをsheetに保存しているかどうか
   *
   * 文字列の完全一致でidを探す（store()でidは自動的に保存されていることが前提）
   *
   * @param {GoogleAppsScript.Gmail.GmailMessage} message
   * @returns {boolean}
   */
  messageExists (message) {
    const id = message.getId()

    const ranges = this.sheet.createTextFinder(id).findAll()
    const result = ranges.flatMap(r => r.getValues()[0]).filter((e) => e === id)

    return result.length > 0
  }

  /**
   * @param {object} params
   * @param {GoogleAppsScript.Gmail.GmailMessage} params.message
   * @param {array} params.cols
   * @param {GoogleAppsScript.Drive.File[]} params.files
   * @param {boolean} params.withIdLink
   * @param {FolderStore|undefined} params.withThumbnailLink
   * @returns {array} - 保存した値の配列
   */
  store ({ message, cols, files, withIdLink, withThumbnailLink }) {
    files = typeof files !== 'undefined' ? files : []

    const row = [
      ...extractIds(message, withIdLink),
      ...cols,
      ...files.map((file) => file.getId())
    ]

    // append の result と update の result
    const appendResult = this.sheet.appendRow(row)
    if (appendResult) {
      if (files.length > 0) {
        this.updateRowWithFiles(this.getLastRow(), files, withThumbnailLink)
      }
      return this.rowValues(this.getLastRow())
    } else {
      return []
    }
  }

  /**
   * 添付ファイルを保存したDriveAppのFileの情報をもとに該当行を更新する
   *
   * @param {number} rowpos
   * @param {GoogleAppsScript.Drive.File[]} files
   * @param {FolderStore} folderStore
   * @returns {(GoogleAppsScript.Spreadsheet.RichTextValue|boolean)[]}
   */
  updateRowWithFiles (rowpos, files, folderStore) {
    return files.map((file) => {
      const fileCol = this.findFileColumnInRow(rowpos, file)
      const fileCell = this.getCell(rowpos, fileCol)

      const link = (typeof folderStore !== 'undefined')
        ? (this.imageLinkToFile(file, folderStore) || this.richTextLinkToFile(file))
        : this.richTextLinkToFile(file)

      if (link) {
        fileCell.setRichTextValue(link)
        return link
      } else {
        return false
      }
    })
  }

  /**
   * @param {integer} rownum
   * @returns {array}
   */
  rowValues (rownum) {
    const lastCol = this.getLastColumn()
    const range = this.sheet.getRange(rownum, 1, 1, lastCol)

    return range.getValues().flat()
  }

  /**
   * Fileの情報が入ったカラムをFile.getId()で検索し、列番号を返す
   *
   * @param {interger} rownum
   * @param {GoogleAppsScript.Drive.File} file
   * @returns {integer|NaN} - 見つかった列番号（1 origin）
   */
  findFileColumnInRow (rownum, file) {
    const col = this.rowValues(rownum).indexOf(file.getId())

    return col >= 0 ? col + 1 : NaN
  }

  /**
   * @returns {number}
   */
  getLastColumn () {
    return this.sheet.getLastColumn()
  }

  /**
   * @returns {number}
   */
  getLastRow () {
    return this.sheet.getLastRow()
  }

  /**
   * @param {integer} row
   * @param {integer} column
   * @returns {GoogleAppsScript.Spreadsheet.Range}
   */
  getCell (row, column) {
    return this.sheet.getRange(row, column).getCell(1, 1)
  }

  /**
   * @param {GoogleAppsScript.Drive.File} file
   * @returns {GoogleAppsScript.Spreadsheet.RichTextValue}
   */
  richTextLinkToFile (file) {
    return this.app.newRichTextValue()
      .setText(file.getName())
      .setLinkUrl(file.getUrl())
      .build()
  }

  /**
   * @param {GoogleAppsScript.Drive.File} file
   * @param {FolderStore} folderStore
   * @returns {GoogleAppsScript.Spreadsheet.CellImage|false}
   */
  imageLinkToFile (file, folderStore) {
    const thumbnail = file.getThumbnail()
    if (thumbnail) {
      const thumbnailFile = folderStore.folder.createFile(thumbnail)

      return this.app.newCellImage()
        .setSourceUrl(thumbnailFile.getUrl())
        .setAltTextTitle(file.getName())
        .build()
    } else {
      return false
    }
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheet
 * @param {GoogleAppsScript.Spreadsheet.SpreadsheetApp} app
 * @returns {SheetStore}
 */
function createSheetStore (sheet, app) { // eslint-disable-line no-unused-vars
  return new SheetStore(sheet, app)
}
