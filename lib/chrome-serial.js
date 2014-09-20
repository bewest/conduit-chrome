

var Duplex = require('readable-stream').Duplex;
var util = require('util');
var Buffer = require('buffer').Buffer;

function SerialDuplex (device) {
  var opts = { highWaterMark: 0 };
  Duplex.call(this, opts);
  this.device = device;
  this.initialized = false;
  return this;
}
util.inherits(SerialDuplex, Duplex);
SerialDuplex.prototype.open = function open_usb (cb) {
  var connInfo;
  var self = this;
  chrome.serial.connect(this.device, {bitrate: 9600}, function (info) {
    console.log("CONNECTED");
    self.handle = info;
    connInfo = info;
    cb(null, this);
    chrome.serial.onReceive.addListener(onRX);
  });
  function onRX (info) {
    console.log('onRX', arguments);
    if (info.connectionId == self.handle.connectionId) {
      var data = new Buffer(info.data);
      var v = new Uint8Array(info.data);
      var view = Array.prototype.slice.apply(v);
      console.log('view', view, new Buffer(view));
      console.log('data from serial', info, info.data.byteLength, data, data.length, data.toString('hex'));
      self.push(new Buffer(view));
      return;
      /*
      var blob = new Blob([info.data]);
      var url = URL.createObjectURL(blob);
      var v = new Uint8Array(info.data);
      var view = Array.prototype.slice.apply(v);
      console.log('data from serial', v, view, info.data.byteLength);
      port.postMessage({type: 'data',  data: view, url: false});
      */
    }
  }
};
SerialDuplex.prototype._write = function write_usb (chunk, enc, cb) {
  console.log('toSerial', chunk);
  chrome.serial.send(this.handle.connectionId, chunk.buffer, function (info) {
    console.log('finish writing', info);
    cb(null);
  });
}
SerialDuplex.prototype._read = function read_usb (n) {
  console.log('ATTEMPT _read', n, this._readableState);
  if (false && n == 0) {
    return;
  }
  return;
}

function scan (matches, callback) {
  if (!callback && matches && matches.call) {
    callback = matches;
    matches = null;
  }
  var r = new RegExp(matches || ".*");
  console.log("MATCHES?", matches, r);
  function whitelist (elem) {
    console.log(elem);
    return elem.match(r) ? elem : null;
  }
  function paths (elem) {
    return elem.path ? elem.path : null;
  }
  chrome.serial.getDevices(function devices (devices) {
    console.log('getDevices', devices);
    var matched = devices.map(paths).filter(whitelist);
    callback(null, {ports: matched});
  });
}

function acquire (device, cb) {
  var serial = create(device);
  serial.open(opened);
  function opened ( ) {
    cb(serial);
  }
  return serial;
}

function create (device) {
  var serial = new create.SerialDuplex(device);
  return serial;
}
create.SerialDuplex = SerialDuplex;
create.scan = scan;
create.acquire = acquire;

module.exports = create;
