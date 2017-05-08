var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    SensorTag = require('sensortag');

var app = express();

function onDiscover(sensorTag) {
    console.log('Discovered SensorTag:', sensorTag);
}


app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000, function () {
    console.log('Sensorbot app listening on port 3000!')
});