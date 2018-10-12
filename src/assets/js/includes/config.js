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

}
