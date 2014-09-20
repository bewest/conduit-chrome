
var Duplex = require('readable-stream').Duplex;
var util = require('util');
var Buffer = require('buffer').Buffer;

var port = 0;
var endpoint = 0x00;
 
var connect = function (device, callback) {
  chrome.permissions.getAll(function(p) {
    if (p.permissions.indexOf('usb') >= 0) {
 
      //construct permission object for our device
      var obj = { usbDevices: [device] };
 
      //now request the permissions
      chrome.permissions.request({ permissions: [obj] }, function(granted) {
        if (granted) {
          chrome.usb.findDevices(device, function(devices) {
            if (devices && devices.length > 0) {
              //use the first found device
              var foundDevice = devices[0];
              //now lets reset the device
              console.log('found', foundDevice, arguments);
              // chrome.usb.getConfiguration(foundDevice, function(config) {
                //perform some error checking to make sure we reset the device
                if ( ! chrome.runtime.lastError) {
                  //now claim the interface using the port we specified
                  chrome.usb.claimInterface(foundDevice, port, function() {
                    if ( ! chrome.runtime.lastError) {
                        chrome.usb.listInterfaces(foundDevice, function (ifaces) {
                          console.log('ifaces', ifaces);
                          ifaces.forEach(function (iface) {
                            if (iface.endpoints) {
                            }
                          });
                          console.log("SUCCESS ENUMERATING HANDLE");
                          callback(foundDevice);
                        });
                    } else {
                      throw chrome.runtime.lastError.message;    
                    } 
                  });
                } else {
                  throw chrome.runtime.lastError.message;
                }
              // });
 
            } else {
              console.warn("Device not found!");
            }
          });
        } else {
          console.warn("USB Permission not granted.")
        }
      });
 
    } else {
      console.warn("No USB permissions granted.");
    }
  });
}

function UsbSimpleDuplex (device) {
  var opts = { highWaterMark: 0 };
  Duplex.call(this, opts);
  this.device = device;
  this.initialized = false;
  return this;
}
util.inherits(UsbSimpleDuplex, Duplex);

function describe_permit (device) {
  var dev = device ? device : default_device;
  var permit = { permissions: [
        {'usbDevices': [{'vendorId': dev.vendorId, "productId": dev.productId}] }
  ] };
  return permit;
}

UsbSimpleDuplex.prototype.onGranted = function  (grant) {
  if (this._open_cb && this._open_cb.call) {
    this._open_cb(grant);
  }
};
var outTransfer = {
  'direction': 'out',
  'endpoint': 1,
  'data': new Buffer('')
};

var inTransfer = {
  "direction": "in",
  "endpoint": 2,
  "length": 64
};
UsbSimpleDuplex.prototype.list_interfaces = function list (cb) {
  console.log('connect', this.conn);
  chrome.usb.listInterfaces(this.conn, cb);
};

UsbSimpleDuplex.prototype.open = function open_usb (cb) {
  // console.log("OPENING USB XX");
  var permit = describe_permit(this.device);
  var self = this;
  this._open_cb = cb;
  var granted = function grant (ev) {
    self.emit('granted', ev, this);
  };
  this.on('granted', function (ev) {
    console.log('ev granted', ev);
    scan(this.device, function (devices) {
      self.scanned = devices;
      self.conn = devices[0];
      console.log('conn', self.conn);
      self.list_interfaces(function (ifaces ) {
        console.log('xxx list interfaces', arguments);
        ifaces.forEach(function (iface) {
          if (iface.endpoints) {
            chrome.usb.claimInterface(self.conn, iface.interfaceNumber, function ( ) {
              console.log("Iface claimed!", arguments, iface);
              self.initialized = true;
              console.log('initialized', self);
              self.onGranted.call(self, arguments);
            });
          }
        });
      });
    });
  });
  // chrome.permissions.request(permit, granted);
  connect(this.device || default_device, function ready (device, handle) {
              self.conn = device;
              self.initialized = true;
              console.log('initialized', self);
              self.onGranted.call(self, arguments);
  });
  /*
  this.device.open( );
  this.ep0 = find_endpoints(this.device);
  this.iface = this.device.interfaces[0];
  if (this.iface.isKernelDriverActive( )) {
    this.iface.detachKernelDriver( );
  }
  this.iface.claim( );
  this.epIN = this.iface.endpoint(this.ep0.in.address);
  this.epOUT = this.iface.endpoint(this.ep0.out.address);
  this.initialized = true;

  var self = this;
  this.epIN.startStream(2, 64);
  this.epIN.on('data', function (data) {
    self.push(data);
  });
  */
  this.on('end', function ( ) {
    console.log("END USB", "XX");
  });
  this.on('close', function ( ) {
    console.log("CLOSE USB", "XX");
  });
};
function makeControl (direction) {
  var T = {
    'direction': 'out',
    'endpoint': 0,
    'data': chunk.buffer
  };
  return T;
}

UsbSimpleDuplex.prototype._write = function write_usb (chunk, enc, cb) {
  // console.log('USB WRITING', chunk);
  chunk = new Buffer(chunk);
  var T = {
    'direction': 'out',
    'endpoint': 1,
    'data': chunk.slice(0).buffer
  };
  console.log('writing', chunk.length, T);
  var self = this;
  function onTX (ev) {
    console.log('in done', chunk.length, T, ev);
    if (ev.resultCode == 0) {
      cb(null, chunk.length);
      self.frame( );
    } else {
      if (chrome.runtime.lastError) {
        throw chrome.runtime.lastError;
      }
      cb(ev, "Failed");
    }
  }
  try {
    chrome.usb.bulkTransfer(this.conn, T, onTX);
  } catch (e) {
    console.error(e);
    throw e;
  }

};

UsbSimpleDuplex.prototype.frame = function  ( ) {
  var T = {
    'direction': 'in',
    'endpoint': 2,
    'length': 64
  };
  var self = this;
  chrome.usb.bulkTransfer(this.conn, T, function (ev) {
    console.log('frame done', ev, ev.data.byteLength);
    var data = new Buffer(new Uint8Array(ev.data));
    console.log('frame done DATA', data.toString('hex'));
    self.push(data);
  });
};

UsbSimpleDuplex.prototype._read = function read_usb (n) {
  console.log('ATTEMPT _read', n, this._readableState);
  if (false && n == 0) {
    return;
  }
  return;
  console.log('ATTEMPT _read', n, this._readableState);
  var transfer = {
    'direction': 'in',
    'endpoint': 1,
    'length': 64
  };
  var self = this;
  chrome.usb.bulkTransfer(this.conn, transfer, function (ev) {
    console.log('in done', ev);
    var data = new Buffer(new Uint8Array(ev.data));
    self.push(data);
  });
};

UsbSimpleDuplex.prototype.close = function close_usb ( ) {
  // console.log("CLOSING USB");

  this.end( );

};

function find_endpoints (device) {
  var ifaces = device.interfaces[0];
  var ep0 = {
    in : ifaces.endpoints[1]
  , out: ifaces.endpoints[0]
  };
  return ep0;
}

var default_device = {
    vendorId: 0x0a21
  , productId: 0x8001
};

function scan (device, cb) {
  var dev = device ? device : default_device;
  return chrome.usb.findDevices(
            {"vendorId": dev.vendorId, "productId": dev.productId}, cb);
}

function permitted (device, cb) {
  var dev = device ? device : default_device;
  var permit = describe_permit(dev);

  return chrome.permissions.contains(permit, cb);
}

function request_permit (device, cb) {
  var dev = device ? device : default_device;
  var permit = describe_permit(dev);

  console.log('requesting permit', permit);
  return chrome.permissions.request(permit, cb);
}
function create (device) {
  return new create.UsbSimpleDuplex(device);
}

create.scan = scan;
create.permitted = permitted;
create.request_permit = request_permit;
create.default_device = default_device;
create.UsbSimpleDuplex = UsbSimpleDuplex;
module.exports = create;


