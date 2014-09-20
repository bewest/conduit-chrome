var lib = require('lib');
var $ = require('jquery');
var vID = 0x0a21;
var pID = 0x8001;
var VENDOR_ID = vID;
var PRODUCT_ID = pID;
console.log('hello');
// console.log(lib);
// lib.request_permit(Object.create(lib.default_device), console.log.bind(console, 'XXX request'));
// lib.permitted(null, console.log.bind(console, 'permitted?'));
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
$(window).on('load', function ( ) {
  console.log("READY");
  lib.serial.scan('.*USB.*', function (err, scanned) {
    console.log(arguments);
    var cloned = $('.devices .template').clone(true).removeClass('.template');
    scanned.ports.forEach(function (match) {
      console.log('iter match', match);
      var item = cloned.clone(true);
      item.find('.raw').text(JSON.stringify(match));
      $('.devices').append(item);
      $.data(item.find('.chat')[0], {connect: match});
      item.find('.endpoint').text(match);
      item.find('.raw').text(JSON.stringify(match));
      console.log('last item', item);
    });
  });

  $('#scanner').on('click', function (ev) {
    lib.serial.scan('.*USB.*', function (matched) {
      var cloned = $('.devices .template').clone(true)
      cloned.removeClass('template');
      matched.ports.forEach(function (match) {
        console.log('iter match', match);
        var item = cloned.clone(true);
        console.log('has endpoint', item.find('.endpoint'));
        $('.devices').append(item);
        $.data(item.find('.chat')[0], {connect: match});
        item.find('.endpoint').text(match);
        item.find('.chat').text(match)
        item.find('.raw').text(JSON.stringify(match));
        console.log('last item', item);
      });
    });
  });
  $('.chat').on('click', function (ev) {
    var target = $(ev.target);
    var dev = $.data(target);
    var end = target.parents('.description').find('.endpoint').text( );
    console.log('button', target, dev, dev.connect, end);
    chat(end);
  });
});


function chat (device) {
    var stream = lib.serial(device);
    console.log(stream);
    console.log('howdy', "let's talk to a serial port", stream);
    stream.open(function opened ( ) {
      console.log('OPEN INIT READY', arguments);
      var sess = comlink(stream);
      sess.uart.open(console.log.bind(console, "OPENED AND STARTED"))
        .stats(console.log.bind(console, 'STATUS'))
        .status(console.log.bind(console, 'STATUS'))
      ;
    });

}
