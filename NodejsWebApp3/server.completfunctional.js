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
    ["APRICOT 90% kill", "-10,0", "-10,0", "-5,6"],
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
    // This is Reikjavik
    // lat: 64.0807,
    // lon: 21.5343
    // This is Novosibiirks
    // lat: 55.018803,
    // lon: 82.933952
    // Aboa
    // lat: -73.05,
    // lon: -13.416667
    // Lago Escondido
    // lat: -54.533333, 
    // lon: -67.2
    //
    // lat: - 55.833, 
    // lon: -67.433
    // 
    // lat: -63.398333,
    // lon: -56.996111
    // Chersky, Russian F.
    lat: 68.766667,
    lon: 161.333333
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
    res.write('');
    res.write('<h1>AgriAlert</h1>');
    res.write('<h2>Warning data for Reikjavik</h2>');
    res.write('<table width="100%"><tr>');
    console.log('**********************');
    weatherData.then(results => {
        //console.log(results[0]);
        var continut;
        
        for (var i = 0; i < 4; i++) {
            res.write('<td valign="top">');
            continut = results[0][i];
            //res.write(continut);
            res.write('<table border="0">');
            res.write('<tr><td valign="top">From: </td><td valign="top">' + continut['from'] + '</td></tr>');
            res.write('<tr><td valign="top">To: </td><td valign="top">' + continut['to'] + '</td></tr>');
            res.write('<tr><td valign="top">Rain: </td><td valign="top">' + continut['rain'] + '</td></tr>');
            res.write('<tr><td valign="top">Temp: </td><td valign="top">' + continut['temperature'] + '</td></tr>');
            res.write('<tr><td valign="top">Affected:</td><td valign="top"><ul>');
            for (var j = 14; j > 0; j--) {
                for (var k = 3; k > 0; k--) {
                    var temp = '';
                    var temperatura = '';
                    temp = continut['temperature'];
                    temperatura = temp.toString().replace(' celsius', '');
                    if (parseFloat(temperatura) < parseFloat(plantInfo[j][k])) {
                        res.write('<li><font color="red"><b>' + plantInfo[0][k] + ' ' + plantInfo[j][0] + '</b></li>');
                        j -= 1;
                    }
                }
            }
            res.write('</ul></td></tr>');
            res.write('</table></td>');
        }
        
        // console.log();
        // jsonData = JSON.parse(JSON.stringify(results[0][1]));
        // res.write(jsonData);
        res.end('</tr></table>');
    });
}).listen(port);
