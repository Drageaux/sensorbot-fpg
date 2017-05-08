var express = require('express'),
    path = require('path'),
    async = require('async'),
    bodyParser = require('body-parser'),
    SensorTag = require('sensortag');

var app = express();


// Timeout Variables
// Discovering is limited to timeoutVar
var timeoutVar = 60000;
var timeoutID;
var timeoutCleared = true;
// Duplicates allowed -> Reconnect possible
SensorTag.SCAN_DUPLICATES = true;

// For each discovered Tag
function onDiscover(sensorTag) {
    console.log('Discovered: ' + sensorTag);
    stopScan();

    async.series([
        function (callback) {
            console.log('connectAndSetUp');
            sensorTag.connectAndSetUp(function () {
                startScan();
                callback();
            });
        },
        function (callback) {
            console.log('enableLuxometer');
            sensorTag.enableLuxometer(callback);
        },
        function (callback) {
            setTimeout(callback, 2000);
        },
        function (callback) {
            sensorTag.on('luxometerChange', function (lux) {
                console.log('\tlux = %d', lux.toFixed(1));
            });

            console.log('setLuxometer');
            sensorTag.setLuxometerPeriod(2000, function (error) {
                console.log('notifyLuxometer');
                sensorTag.notifyLuxometer();
            });
            callback();
        }
    ]);
}

function startScan() {
    console.log('Start discovering');
    timeoutCleared = false;
    SensorTag.discoverAll(onDiscover);
    timeoutID = setTimeout(function () {
        stopScan();
    }, timeoutVar);
    SensorTag.discoverAll(onDiscover);
}

function stopScan() {
    SensorTag.stopDiscoverAll(onDiscover);
    timeoutCleared = true;
    console.log('Stop discovering');
    clearTimeout(timeoutID);
}

startScan();

// Web API
app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(2828, function () {
    console.log('Sensorbot app listening on port 2828!')
});