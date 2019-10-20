import Storage from './storage';

/**
 * Class Config.
 */
export default class Config {

  /**
   * Constructor.
   */
  constructor() {
    this.config = {};
    this.storageSync = new Storage('sync');
  }

  /**
   * Gets the full configuration object.
   *
   * @param {Function} callback
   *   Callback function.
   */
  getAll(callback) {
    let _this = this;

    // Set defaults.
    _this.config['capturedFigures'] = true;
    _this.config['captchaAccessToken'] = "";

    _this.storageSync.get('settings', false, result => {
      if (typeof result !== false) {
        let config = JSON.parse(result);

        for (let [key, value] of Object.entries(config)) {
          _this.config[key] = value;
        }

        if (typeof callback === 'function') {
          callback(_this.config);
        }
      }
    });
  }

  /**
   * Gets the full configuration object.
   *
   * @returns {Promise<any>}
   */
  getAllPromised() {
    let _this = this;

    // Set defaults.
    _this.config['capturedFigures'] = true;
    _this.config['captchaAccessToken'] = "";

    return new Promise(function (resolve) {
      _this.storageSync.getPromised('settings', false).then((result) => {
        if (typeof result !== false) {
          let config = JSON.parse(result);

          for (let [key, value] of Object.entries(config)) {
            _this.config[key] = value;
          }

          resolve(_this.config);
        }
      });
    });
  }

  /**
   * Gets one configuration item.
   *
   * @param {String} key
   *   Key for configuration item.
   * @param {String|Boolean|Number|Object|Array|Null} def
   *   Default value if no result...
   * @param {Function} callback
   *   Callback function.
   */
  get(key, def, callback) {
    let _this = this;

    _this.getAll(result => {
      if (typeof callback === 'function') {
        callback(result[key] || def);
      }
    });
  }

  /**
   * Gets one configuration item.
   *
   * @param {String} key
   *   Key for configuration item.
   * @param {String|Boolean|Number|Object|Array|Null} def
   *   Default value if no result...
   *
   * @returns {Promise<any>}
   */
  getPromised(key, def) {
    let _this = this;

    return new Promise(function (resolve) {
      _this.getAllPromised().then((config) => {
        resolve(config[key] || def);
      });
    });
  }

  /**
   * Sets one configuration item.
   *
   * @param {String} key
   *   Key for configuration item.
   * @param {String|Boolean|Number|Object|Array|Null} val
   *   Value for configuration item.
   */
  set(key, val) {
    let _this = this;

    _this.getAll(result => {
      result[key] = val;

      _this.storageSync.set('settings', JSON.stringify(result));
    });
  }

  /**
   * Sets one configuration item.
   *
   * @param {String} key
   *   Key for configuration item.
   * @param {String|Boolean|Number|Object|Array|Null} val
   *   Value for configuration item.
   *
   * @returns {Promise<any>}
   */
  setPromised(key, val) {
    let _this = this;

    return new Promise(function (resolve) {
      _this.storageSync.setPromised(key, val).then((result) => {
        resolve(result);
      });
    });
  }

}
