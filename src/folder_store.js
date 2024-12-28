/// <reference types="google-apps-script" />

/**
 * Google Driveの特定のfolder以下のファイルを扱う
 */
class FolderStore {
  /**
   * @param {GoogleAppsScript.Drive.Folder} folder
   */
  constructor (folder) {
    /** @type {GoogleAppsScript.Drive.Folder} */
    this.folder = folder
  }

  /**
   * @param {GoogleAppsScript.Gmail.GmailAttachment} attachment
   * @param {string} timestamp
   * @returns {GoogleAppsScript.Drive.File} - 保存したファイル
   */
  store (attachment, timestamp) {
    const a = attachment

    const file = this.folder.createFile(a.getAs(a.getContentType()))
    file.setName([timestamp, a.getName()].join(' '))

    return file
  }
}

/**
 * @param {GoogleAppsScript.Drive.Folder} folder
 * @returns {FolderStore}
 */
function createFolderStore (folder) { // eslint-disable-line no-unused-vars
  return new FolderStore(folder)
}
