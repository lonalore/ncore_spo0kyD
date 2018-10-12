import Storage from './includes/storage';
import Config from "./includes/config";

import jQuery from 'jquery';

/**
 * Class Content.
 */
export default class Content {

  /**
   * Constructor.
   */
  constructor() {
    this.browser = chrome || browser;
    this.storage = new Storage('local');
    this.config = new Config();
  }

  /**
   * Initializes Content.js functions.
   */
  init() {
    if (typeof this.browser === "undefined") {
      return;
    }

    this.initListener();
    this.initPageReload();
  }

  /**
   * Initializes the listener.
   */
  initListener() {
    let _this = this;

    setInterval(function () {
      let $spookies = jQuery('#spo0kyD img');

      if ($spookies.length > 0) {
        jQuery.each($spookies, function () {
          let $this = jQuery(this);
          let $that = $this.parent();
          let offset = $this.offset();
          let event = new jQuery.Event("click");

          // Fake mouse coordinates.
          event.pageX = offset.left + $this.width() / 2;
          event.pageY = offset.top + $this.height() / 2;
          // Set originalEvent to avoid alert message.
          event.originalEvent = event;

          // Force to disable captcha-check.
          $that.attr('data-recaptcha', 'false');
          $this.trigger(event);

          // console.log('New spo0kyD has been captured:');

          // Wait few seconds to get result text.
          setTimeout(function () {
            let $removes = $that.find('#removeMessage');

            if ($removes.length > 0) {
              jQuery.each($removes, function () {
                let $remove = jQuery(this);
                let text = $that.contents().filter(function () {
                  return parseInt(this.nodeType) === 3;
                }).text();

                if (text) {
                  _this.store(text);
                }

                let removeOffset = $remove.offset();
                let removeEvent = new jQuery.Event("click");

                // Fake mouse coordinates.
                removeEvent.pageX = removeOffset.left + $remove.width() / 2;
                removeEvent.pageY = removeOffset.top + $remove.height() / 2;
                // Set originalEvent to avoid alert message.
                removeEvent.originalEvent = removeEvent;

                $remove.trigger(removeEvent);
              });
            }
          }, 3000);
        });
      }
    }, 6000);
  }

  /**
   * Init page-reloader.
   */
  initPageReload() {
    let _this = this;

    setInterval(function () {
      _this.config.getAll(config => {
        if (config['reloadWebsite'] === true) {
          window.location.reload(true);
        }
      });
    }, 300000);
  }

  /**
   * Store the text from captured figure.
   *
   * @param text
   */
  store(text) {
    let _this = this;

    _this.storage.get('captured-figures', false, result => {
      let history = {};

      if (result !== false) {
        for (let [ts, txt] of Object.entries(JSON.parse(result))) {
          history[ts] = txt;
        }
      }

      let ts = Math.round(+new Date() / 1000);
      history[ts] = text;

      _this.storage.set('captured-figures', JSON.stringify(history));
    });
  }

}

// Run content script.
const content = new Content();
content.init();
