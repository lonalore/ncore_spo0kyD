import Storage from './includes/storage';
import Config from './includes/config';
import jQuery from 'jquery';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.css';

/**
 * Class Popup.
 */
export default class Popup {

  /**
   * Constructor.
   */
  constructor() {
    this.browser = chrome || browser;
    this.storage = new Storage('local');
    this.config = new Config();
  }

  /**
   * Initializes Popup,js functions.
   */
  init() {
    if (typeof this.browser === "undefined") {
      return;
    }

    this.initCapturedFigures();
    this.initSettingsForm();
  }

  /**
   * Initializes "Captured figures" history list.
   */
  initCapturedFigures() {
    let _this = this;

    let $list = jQuery('#capturedFigures');
    $list.html('');

    _this.storage.get('captured-figures', false, result => {
      if (result === false) {
        let $markup = jQuery('<div class="empty-middle"></div>');
        $markup.text("No figure has been captured yet... please visit ncore.cc website first, then log into it during Spooky Dayz event is active.");
        $markup.appendTo($list);
        return;
      }

      let index = 0;

      for (let [ts, txt] of Object.entries(JSON.parse(result))) {
        index++;

        let $wrapper = jQuery('<div class="list-group-item list-group-item-action flex-column align-items-start"></div>');
        let $text = jQuery('<span></span>');

        $text.text(txt);

        $text.appendTo($wrapper);
        $wrapper.appendTo($list);
      }
    });
  }

  /**
   * Initializes Settings form functions.
   */
  initSettingsForm() {
    let _this = this;

    let $reloadWebsite = jQuery('#reloadWebsite');

    // Set default values on form elements.
    _this.config.getAll(config => {
      if (config['reloadWebsite'] === true) {
        $reloadWebsite.prop('checked', true);
      }
    });

    $reloadWebsite.on('change', () => {
      let state = $reloadWebsite.is(':checked');
      _this.config.set('reloadWebsite', state);
    });
  }

}

const popup = new Popup();
popup.init();
