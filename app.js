var express = require('express'),
    path = require('path'),
    async = require('async'),
    bodyParser = require('body-parser'),
    SensorTag = require('sensortag');

var app = express();

var sensorList = [];
var roomOne = {
    id: '247189e06f86',
    name: 'One',
    available: false
};
var roomTwo = {
    id: '247189e87a05',
    name: 'Two',
    available: false
};

// Duplicates allowed -> Reconnect possible
SensorTag.SCAN_DUPLICATES = true;

function displayStatus(room, lux) {
    if (lux >= 10) room.available = false;
    else room.available = true;

    var message = '\tRoom ' + room.name + ' is ';
    message += room.available ? 'available. ' : 'NOT available. ';
    message += 'Lux ' + lux.toFixed(1);
    console.log(message)
}

// discover using the list of device IDs
SensorTag.discoverAll(function (sensorTag) {
    console.log('discovered ' + sensorTag);
    sensorList.push(sensorTag);
});

// wait 5 seconds before set up
// because setting up while discovering might not work
setTimeout(function () {
    async.eachSeries(sensorList, function (sensorTag, callback) {
        async.series([
            function (cb) {
                console.log('connectAndSetUp');
                sensorTag.connectAndSetUp(cb);
            },
            function (cb) {
                console.log('enableLuxometer');
                sensorTag.enableLuxometer(cb);
            },
            function (cb) {
                setTimeout(cb, 2000);
            },
            function (cb) {
                sensorTag.on('luxometerChange', function (lux) {
                    if (sensorTag.id == roomOne.id) {
                        displayStatus(roomOne, lux);
                    } else if (sensorTag.id == roomTwo.id) {
                        displayStatus(roomTwo, lux)
                    }
                });

                console.log('setLuxometer');
                sensorTag.setLuxometerPeriod(2000, function (error) {
                    console.log('notifyLuxometer');
                    sensorTag.notifyLuxometer();
                });
                cb();
            }
        ], function (err, results) {
            callback();
        });
    }, function (err, results) {
        console.log("Finished")
    });
}, 3000);


// Web API
app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(2828, function () {
    console.log('Sensorbot app listening on port 2828!')
});