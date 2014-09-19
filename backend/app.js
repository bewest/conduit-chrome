var lib = require('lib');
var vID = 0x0a21;
var pID = 0x8001;
var VENDOR_ID = vID;
var PRODUCT_ID = pID;
console.log('hello');
console.log(lib);
// lib.request_permit(Object.create(lib.default_device), console.log.bind(console, 'XXX request'));
lib.permitted(null, console.log.bind(console, 'permitted?'));
// lib.scan(null, console.log.bind(console, 'XXX scan'));
// lib.permitted(null, console.log.bind(console, 'permitted?'));

var comlink = require('comlink2');
var stream;
var requestButton = document.getElementById("requestPermission");
requestButton.addEventListener('click', function() {
  console.log('asking');
  lib.request_permit(lib.default_device, function (result) {
    console.log('requested permit', result, arguments);
    stream = lib(lib.default_device);
    console.log(stream);
    stream.open(function opened ( ) {
      console.log('OPEN', arguments);
      var sess = comlink(stream);
      sess.uart.open(console.log.bind(console, "OPENED"))
        .stats(console.log.bind(console, 'STATUS'))
        .status(console.log.bind(console, 'STATUS'))
      ;
    });
    // console.log(stream);
  });
});

var findDev = document.getElementById("findDevices");
findDev.addEventListener('click', function() {
        chrome.usb.findDevices(
            {"vendorId": VENDOR_ID, "productId": PRODUCT_ID},
           function (devices) {
             console.log("FOUND", devices, arguments);
             console.log('err', chrome.runtime.lastError());
           })
           ;
});

var inspect = document.getElementById("inspect");
inspect.addEventListener('click', function() {
        chrome.usb.getDevices(
            {"vendorId": VENDOR_ID, "productId": PRODUCT_ID},
           function (devices) {
             console.log("getDevices", devices, arguments);
             console.log('err', chrome.runtime.lastError());
           })
           ;
});
