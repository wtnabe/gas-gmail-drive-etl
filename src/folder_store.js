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
   * @returns {GoogleAppsScript.Drive.File} - 保存したファイル
   */
  store (attachment) {
    const a = attachment

    const file = this.folder.createFile(a.getAs(a.getContentType()))
    file.setName(a.getName())

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
