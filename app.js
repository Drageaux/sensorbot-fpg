var express = require('express'),
    path = require('path'),
    async = require('async'),
    bodyParser = require('body-parser'),
    SensorTag = require('sensortag');

var app = express();


function onDiscover(sensorTag) {
    console.log('discovered: ' + sensorTag);

    async.series([
        function (callback) {
            console.log('connectAndSetUp');
            sensorTag.connectAndSetUp(callback);
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


function handleError(err) {
    console.log(err);
}

SensorTag.discoverAll(onDiscover);


app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(2828, function () {
    console.log('Sensorbot app listening on port 2828!')
});