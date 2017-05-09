var express = require('express'),
    path = require('path'),
    async = require('async'),
    bodyParser = require('body-parser'),
    SensorTag = require('sensortag');

var app = express();

var sensorList = [];
var roomOne = {
    id: '247189e96f86',
    name: 'One',
    available: false
};
var roomTwo = {
    id: '247189e87a05',
    name: 'Two',
    available: false
};

function displayStatus(room, lux) {
    if (lux >= 10) room.available = false;
    else room.available = true;

    var message = '\tRoom ' + room.name + ' is ';
    message += room.available ? 'available. ' : 'NOT available. ';
    message += 'Lux ' + lux.toFixed(1);
    console.log(message)
}

function onDiscover(sensorTag) {
    console.log('discovered ' + sensorTag);
    stopTimed();
    async.series([
        function (cb) {
            console.log('connectAndSetUp ' + sensorTag);
            sensorTag.connectAndSetUp(cb);
        },
        function (cb) {
            console.log('enableLuxometer ' + sensorTag);
            sensorTag.enableLuxometer(cb);
        },
        function (cb) {
            sensorTag.on('luxometerChange', function (lux) {
                if (sensorTag.id == roomOne.id) {
                    displayStatus(roomOne, lux);
                } else if (sensorTag.id == roomTwo.id) {
                    displayStatus(roomTwo, lux)
                }
            });

            console.log('setLuxometer ' + sensorTag);
            sensorTag.setLuxometerPeriod(2000, function (error) {
                console.log('notifyLuxometer ' + sensorTag);
                sensorTag.notifyLuxometer();
                cb();
            });
        }
    ], function (err, results) {
        scanTimed();
    });
}


// Timeout Variables
// Discovering is limited to timeoutVar
var timeoutVar = 60000;
var timeoutID;
var timeoutCleared = true;

// Duplicates allowed -> Reconnect possible
SensorTag.SCAN_DUPLICATES = true;

function scanTimed() {
    console.log('Start discovering');
    timeoutCleared = false;
    SensorTag.discoverAll(onDiscover);
    timeoutID = setTimeout(function () {
        stopTimed();
    }, timeoutVar);
}

//Stop timer and discovering
function stopTimed() {
    SensorTag.stopDiscoverAll(onDiscover);
    timeoutCleared = true;
    console.log('Stop discovering');
    clearTimeout(timeoutID);
}

// Start discovering
scanTimed();


// Web API
app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(2828, function () {
    console.log('Sensorbot app listening on port 2828!')
});