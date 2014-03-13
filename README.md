# conduit-chrome

Chrome extension and app to connect webpages hosting serial code
drivers implemented in javascript to serial devices connected to your
computer.

Basic idea is that after installing an extension, a webpage can upload
data from a device connected to the computer to Tidepool.

### install

```bash
$ git clone git@github.com:tidepool-org/conduit-chrome.git
cd conduit-chrome
npm install
```
###### Install chrome app and extension
This is for development purposes only.

I usually create a profile just for development activities on
extensions like these.  You can do that by pressing `magic-shift-m`
and selecting create new user for this purpose.

1. visit chrome://extensions
1. turn on `Developer mode`
1. click `Load unpacked extension`
  1. select `backend/`
1. click `Load unpacked extension`
  1. select `extension/`

###### Run example server

```bash
./node_modules/.bin/docpad run -p 4554

```
Then visit: http://localhost:5445/

### Chrome `packaged app`

The app acts more like an extension.  Chrome's permissions allow
`packaged apps` to pass messages to webpages and extensions, as well
as talk to serial devices, local filesystems, etc.

`packaged app`'s are intended to run all the time, whether or not you
browsing web pages.  A `packaged app` has no idea what webpage the
user is currently visiting.

#### src: `backend/`

The application obtains permission for `chrome` `usb` and `serial`
apis.  It waits for an long lived connections:
  * sends list serial devices to the `extension`
  * when the connection comes from a webpage, and the name of the
    connection is `device`, forward all serial port traffic to and
    from that message passing api

### Chrome `extension/`
The `extension` acts more like an `app`.
When the user visits Tidepool approved websites, when the
`tidepool-device-connect` microformat is present on the page, connect
the webpage's own javascript code to a message passing interface that
allows communicating to the serial port.

`extensions` are allowed install/monitor activity of other
applications, as well as current browsing behavior.

#### src: `extension/`

This extension notices when the origin of a website indicates that it
is approved for uploading data to Tidepool, and ensures that the web
page can connect with the `backend`.

The operation of the `extension` is to interact with the upload
microformat present on Tidepool whitelisted pages implemented by a
`content script`, `content.js`.

### Example site

There is an example static site for development/debug purposes.
It's implemented using docpad.
For development, use this:
`./node_modules/.bin/docpad run -p 4554`

Then visit: `http://localhost:5445/`

### Caveats

This was written solely in the interest of seeing some data on a page
as quickly as possible with a bunch of newish apis.

* lots of commented code
* use of `console.log`
* several other things


## License

BSD-2-Clause
