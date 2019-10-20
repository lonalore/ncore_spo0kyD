/**
 * Class StorageSync.
 *
 * Wrapper class for storage.sync API.
 *
 * @see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/sync
 * @see https://developer.chrome.com/extensions/storage#property-sync
 */
export default class StorageSync {

  /**
   * Constructor.
   */
  constructor(id) {
    this.browser = chrome || browser;
  }

  /**
   * @param key
   * @param value
   * @param callback
   */
  set(key, value, callback) {
    let _this = this;

    let data = {
      [key]: value
    };

    _this.browser.storage.sync.set(data, result => {
      if (typeof callback === "function") {
        callback(result);
      }
    });
  }

  /**
   * @param key
   * @param value
   *
   * @returns {Promise<any>}
   */
  setPromised(key, value) {
    let _this = this;

    let data = {
      [key]: value
    };

    return new Promise(function (resolve) {
      _this.browser.storage.sync.set(data, result => {
        resolve(result);
      });
    });
  }

  /**
   * @param key
   * @param def
   * @param callback
   */
  get(key, def, callback) {
    let _this = this;

    _this.browser.storage.sync.get(key, result => {
      let value = result[key] || def;

      if (typeof callback === "function") {
        callback(value);
      }
    });
  }

  /**
   * @param key
   * @param def
   *
   * @returns {Promise<any>}
   */
  getPromised(key, def) {
    let _this = this;

    return new Promise(function (resolve) {
      _this.browser.storage.sync.get(key, result => {
        let value = result[key] || def;
        resolve(value);
      });
    });
  }

  /**
   * @param key
   * @param callback
   */
  remove(key, callback) {
    let _this = this;

    _this.browser.storage.sync.remove(key, result => {
      if (typeof callback === "function") {
        callback(result);
      }
    });
  }

  /**
   * @param key
   * @param def
   *
   * @returns {Promise<any>}
   */
  removePromised(key, def) {
    let _this = this;

    return new Promise(function (resolve) {
      _this.browser.storage.sync.remove(key, result => {
        resolve(result);
      });
    });
  }

}
