'use strict';
var http = require('http');
var js2xmlparser = require("js2xmlparser");
var port = process.env.PORT || 1337;
var fiveDaySummary;
var forecast;
var meteo;
var meteodata;
var jsonData;
var plantInfo = [
    ["", "SWELLING", "FIRST COLOR", "FULL BLOOM"],
    ["APLLE 10% kill", "-9,4", "-2,2", "-2,2"],
    ["APLLE 90% kill", "-16,7", "-4,4", "-3,9"],
    ["PEACH 10% kill", "-7,8", "-3,9", "-2,8"],
    ["PEACH 90% kill", "-17,2", "-9,4", "-4,4"],
    ["PEAR 10% kill", "-9,4", "-3,9", "-2,2"],
    ["PEAR 90% kill", "-17,8", "-7,2", "-4,4"],
    ["SWEET CHERRY 10% kill", "-8,3", "-2,8", "-2,2"],
    ["SWEET CHERRY 90% kill", "-15,0", "-4,4", "-3,9"],
    ["APRICOT 10% kill", "-9,4", "-4,4", "-2,8"],
    ["APRICOT 90% kill", "N/A", "-10,0", "-5,6"],
    ["SOUR CHERRY 10% kill", "-9,4", "-2,2", "-2,2"],
    ["SOUR CHERRY 90% kill", "-17,8", "-4,4", "-4,4"],
    ["PLUM 10% kill", "-10,0", "-3,3", "-2,2"],
    ["PLUM 90% kill", "-17,8", "-5,6", "-5,0"]
];

const yrno = require('yr.no-forecast')({
    version: '1.9', // this is the default if not provided,
    request: {
        // make calls to locationforecast timeout after 15 seconds
        timeout: 15000
    }
});

const LOCATION = {
    // This is Dublin, Ireland
    lat: 64.0807,
    lon: 21.5343
};

let weatherData = yrno.getWeather(LOCATION).then((weather) => {
    // note `return`
    return Promise.all([weather.getFiveDaySummary()
        , weather.getForecastForTime(new Date())])
});

weatherData
    // `results` is array of `Promise` values returned from `.then()`
    // chained to `yrno.getWeather(LOCATION).then((weather)`
    .then(results => {
        let [fiveDaySummary, forecastForTime] = results;
        console.log('five day summary:', fiveDaySummary, 'current weather:', forecastForTime);
        // note `return` statement, here
        return results
    })
    .catch((e) => {
        console.log('an error occurred!', e);
    });

    // weatherData.then(results => { // do stuff with `results` })

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>AgriAlert</h1>');
    res.write('<h2>Warning data for Reikjavik</h2>');
    res.write('<table width="75%"><tr>');
    console.log('**********************');
    weatherData.then(results => {
        //console.log(results[0]);
        var continut;
        
        for (var i = 0; i < 4; i++) {
            res.write('<td>');
            continut = results[0][i];
            //res.write(continut);
            res.write('<table>');
            res.write('<tr><td>From: </td><td>' + continut['from'] + '</td></tr>');
            res.write('<tr><td>To: </td><td>' + continut['to'] + '</td></tr>');
            res.write('<tr><td>Rain: </td><td>' + continut['rain'] + '</td></tr>');
            res.write('<tr><td>Rain: </td><td>' + continut['temperature'] + '</td></tr>');
            res.write('<tr><td>Temp:</td><td>');
            for (var j = 1; j < 15; j++) {
                for (var k = 1; k < 4; k++) {
                    var temp = '';
                    var temperatura = '';
                    temp = continut['temperature'].split();
                    temperatura = temp.toString().replace(' celsius', '');
                    if (plantInfo[j][k] <= temperatura){
                        res.write('<font color="red"><b>' + plantInfo[j][0] + '</b>');
                    }
                }
            }
            res.write('</td></tr>');
            res.write('</table></td>');
        }
        
        // console.log();
        // jsonData = JSON.parse(JSON.stringify(results[0][1]));
        // res.write(jsonData);
        res.end('</tr></table>');
    });
}).listen(port);
