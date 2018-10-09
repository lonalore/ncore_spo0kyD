import jQuery from 'jquery';
import Storage from './includes/storage';

/**
 * Class Content.
 */
export default class Content {

  /**
   * Constructor.
   */
  constructor() {
    this.browser = chrome || browser;
  }

  /**
   * Init.
   */
  init() {
    if (typeof this.browser === "undefined") {
      return;
    }

    this.run();
  }

  run() {
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
                  // console.log(text);
                  // TODO storage
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

}

// Run content script.
const content = new Content();
content.init();
