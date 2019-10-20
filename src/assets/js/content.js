import Storage from './includes/storage';
import Config from "./includes/config";

import jQuery from 'jquery';
import 'bestcaptchasolver-client';

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
    this.in_solving = window.in_solving = false;
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
      _this.capture();
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
   * Tries to capture a figure.
   */
  capture() {
    let _this = this;
    let $spooky = jQuery('#spo0kyD');

    if ($spooky.length > 0) {
      let $spookyImg = $spooky.find('img');

      let offset = $spookyImg.offset();
      let event = new jQuery.Event("click");

      // Fake mouse coordinates.
      event.pageX = offset.left + $spookyImg.width() / 2;
      event.pageY = offset.top + $spookyImg.height() / 2;
      // Set originalEvent to avoid alert message.
      event.originalEvent = event;

      // Force to disable captcha-check.
      $spooky.attr('data-recaptcha', 'false');
      $spookyImg.trigger(event);

      // Wait few seconds to get result text.
      setTimeout(function () {
        _this.captured();
      }, 3000);
    }
  }

  /**
   * After a figure has been captured,
   *
   * @param $spooky
   */
  captured($spooky) {
    let _this = this;
    let $closeBtn = $spooky.find('#removeMessage');
    let $reCaptcha = jQuery('div.g-recaptcha');

    // Captcha has been detected!
    if ($reCaptcha.length > 0) {
      _this.captchaSolver().then(() => {
        $reCaptcha.closest('form').submit();
      }).catch((error) => {
        // console.log(error);
      });
    }
    else if ($closeBtn.length > 0) {
      let text = _this.extractText($spooky);
      if (text) {
        _this.store(text);
      }

      let closeBtnOffset = $closeBtn.offset();
      let closeEvent = new jQuery.Event("click");

      // Fake mouse coordinates.
      closeEvent.pageX = closeBtnOffset.left + $closeBtn.width() / 2;
      closeEvent.pageY = closeBtnOffset.top + $closeBtn.height() / 2;
      // Set originalEvent to avoid alert message.
      closeEvent.originalEvent = closeEvent;

      $closeBtn.trigger(closeEvent);
    }
  }

  /**
   * Captcha solver using BestCaptchaSolver.com API.
   *
   * @returns {Promise<string>}
   */
  captchaSolver() {
    let _this = this;

    return new Promise((resolve, reject) => {
      _this.config.getPromised('captchaAccessToken', "").then((accessToken) => {
        if (_this.in_solving === true) {
          reject('Doing another task currently.');
          return;
        }
        _this.in_solving = true;

        let $gReCaptcha = jQuery('div.g-recaptcha');
        let $captchaRes = jQuery('input[name="captcha_response"]');

        if ($gReCaptcha.length === 0 || $captchaRes.length === 0) {
          reject('Not found required captcha elements.');
          return;
        }

        let CAPTCHA_ACCESS_TOKEN = accessToken;
        let CAPTCHA_SITE_KEY = $gReCaptcha.attr('data-sitekey');
        let CAPTCHA_PAGE_URL = window.location.href;
        let CAPTCHA_USER_AGENT = navigator.userAgent;

        let captcha_id = undefined;
        let captcha_response = "";

        // User's access token.
        bestcaptchasolverapi.set_access_token(CAPTCHA_ACCESS_TOKEN);
        bestcaptchasolverapi.submit_recaptcha({
          // URL on which you encountered the captcha.
          page_url: CAPTCHA_PAGE_URL,
          // ReCaptcha (public) site-key, which can be found in the website's
          // source.
          site_key: CAPTCHA_SITE_KEY,
          // User-Agent used to solve reCAPTCHA.
          user_agent: CAPTCHA_USER_AGENT,
        }).then((id) => {
          captcha_id = id;
          return bestcaptchasolverapi.retrieve_captcha(id);
        }).then((data) => {
          if (data && data.hasOwnProperty('gresponse')) {
            captcha_response = data.gresponse;
            $captchaRes.val(data.gresponse);
          }
          resolve(captcha_response);
        }).catch((err) => {
          reject(err.message || err);
        }).then(() => {
          _this.in_solving = false;
        });
      });
    });
  }

  /**
   * Extracts plain text (without child elements) from a DOM element.
   *
   * @param $element
   * @returns {*|jQuery}
   */
  extractText($element) {
    return $element.contents().filter(function () {
      return parseInt(this.nodeType) === 3;
    }).text();
  }

  /**
   * Stores the text got from the captured figure.
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
