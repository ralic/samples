/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';
// This is a basic test file for use with testling.
// The test script language comes from tape.
/* jshint node: true */
var test = require('tape');

var webdriver = require('selenium-webdriver');
var seleniumHelpers = require('../../../../../test/selenium-lib');

test('Fake device selection and check video tag dimensions in ' +
    'input-output demo', function(t) {
  // FIXME: use env[SELENIUM_BROWSER] instead?
  var driver = seleniumHelpers.buildDriver();

  var webrtcDetectedBrowser = null;

  driver.get('file://' + process.cwd() +
      '/src/content/devices/input-output/index.html')
  .then(function() {
    t.pass('Page loaded');
    return driver.executeScript('return webrtcDetectedBrowser;');
  })
  .then(function(browser) {
    webrtcDetectedBrowser = browser;
    // Making sure we can select the 1st audio device.
    // TODO: Select more devices if Firefox adds a 2nd fake A&V device and
    // Chrome adds another fake video device.
    t.pass('Selecting 1st audio device');
    return driver.wait(webdriver.until.elementLocated(
        webdriver.By.css('#audioSource>option')));
  })
  .then(function(element) {
    return new webdriver.ActionSequence(driver).
        doubleClick(element).perform();
  })
  // Check enumerateDevices has returned an id.
  .then(function() {
    return driver.findElement(webdriver.By.css(
        '#audioSource>option')).getAttribute('value');
  })
  .then(function(deviceId) {
    t.ok(deviceId, 'Device/source id: ' + deviceId);
  })
  .then(function() {
    // Making sure we can select the 1st video device.
    // TODO: Select more devices if Firefox adds a 2nd fake A/V device and
    // Chrome adds another fake video device.
    t.pass('Selecting 1st video device');
    return driver.wait(webdriver.until.elementLocated(
        webdriver.By.css('#videoSource>option')));
  })
  .then(function(element) {
    return new webdriver.ActionSequence(driver).
        doubleClick(element).perform();
  })
  // Check enumerateDevices has returned an id.
  .then(function() {
    return driver.findElement(webdriver.By.css(
        '#videoSource>option')).getAttribute('value');
  })
  .then(function(deviceId) {
    t.ok(deviceId !== '', 'Device/source id: ' + deviceId);
  })
  .then(function() {
    // Make sure the stream is ready.
    return driver.wait(function() {
      return driver.executeScript('return window.stream !== undefined;');
    }, 30 * 1000);
  })
   // Check for a fake audio device label (Chrome only).
  .then(function() {
    return driver.executeScript('return stream.getAudioTracks()[0].label');
  })
  .then(function(deviceLabel) {
    // TODO: Improve this once Firefox has added labels for fake devices.
    var fakeAudioDeviceName = (webrtcDetectedBrowser === 'chrome') ?
        'Fake Audio 1' : '';
    t.ok(fakeAudioDeviceName === deviceLabel, 'Fake audio device found with ' +
        'label: ' + deviceLabel);
  })
  // Check for a fake video device label (Chrome only).
  .then(function() {
    return driver.executeScript('return stream.getVideoTracks()[0].label');
  })
  .then(function(deviceLabel) {
    // TODO: Improve this once Firefox has added labels for fake devices.
    var fakeVideoDeviceName = (webrtcDetectedBrowser === 'chrome') ?
        'fake_device_0' : '';
    // TODO: Remove match() method once http://crbug.com/526633 is fixed.
    t.ok(fakeVideoDeviceName === deviceLabel.match(fakeVideoDeviceName)[0],
        'Fake video device found with label: ' +
        deviceLabel.match(fakeVideoDeviceName)[0]);
  })
  // Check that there is a video element and it is displaying something.
  .then(function() {
    return driver.findElement(webdriver.By.id('video'));
  })
  .then(function(videoElement) {
    t.pass('Found video element');
    var width = 0;
    var height = 0;
    return new webdriver.promise.Promise(function(resolve) {
      videoElement.getAttribute('videoWidth').then(function(w) {
        width = w;
        t.pass('Got videoWidth ' + w);
        if (width && height) {
          resolve([width, height]);
        }
      });
      videoElement.getAttribute('videoHeight').then(function(h) {
        height = h;
        t.pass('Got videoHeight ' + h);
        if (width && height) {
          resolve([width, height]);
        }
      });
    });
  })
  .then(function(dimensions) {
    t.pass('Got video dimensions ' + dimensions.join('x'));
  })
  .then(function() {
    t.end();
  })
  .then(null, function(err) {
    t.fail(err);
    t.end();
  });
});
