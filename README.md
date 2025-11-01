# nCore - Halloween

This browser extension is designed for interacting with the nCore platform during "SpOoKy DaYz" events.  
It automates and enhances the user experience by:

- Watching for special event popups (`#spo0kyD` container).
- Extracting text messages and unique identifiers (UUIDs).
- Clicking event images automatically (simulating human-like behavior with small jitter).
- Saving collected data locally using Chrome storage with deduplication and maintenance.
- Providing reliable observation using MutationObserver with polling fallback.


## Installation & Usage

1. Clone or download this repository.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right corner).
4. Click **Load unpacked** and select the project folder.
5. The extension will now appear in your extensions list and run automatically on nCore.

When active, the extension will automatically detect SpOoKy DaYz popups, extract messages, and click the event images.

## Features

- Automatic element visibility handling.
- Human-like randomized click positions.
- Audible captcha detection alert: plays a short sound when a Google reCAPTCHA is detected after a human-like click (debounced).
- Popup content monitoring and text extraction.
- Deduplication of collected messages by UUID.
- Local storage of up to 2000 recent entries.
- Export captured data as CSV (including timestamp, UUID, message, image URL, and page URL).

## TODO

- Captcha handling: occasionally nCore displays a captcha to verify the user is not a script.

## Technical details

- Written in JavaScript.
- Uses `MutationObserver` to detect popup creation and changes.
- Falls back to polling when observers are not triggered.
- Uses Chrome extension APIs for persistent storage.

## Disclaimer

This project is for educational purposes only. It is not affiliated with or endorsed by nCore.  
Use at your own risk.
