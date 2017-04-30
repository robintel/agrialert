'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var fiveDaySummary;
var forecast;
var meteo;
var meteodata;

const yrno = require('yr.no-forecast')({
    version: '1.9', // this is the default if not provided,
    request: {
        // make calls to locationforecast timeout after 15 seconds
        timeout: 15000
    }
});

const LOCATION = {
    // This is Dublin, Ireland
    lat: 53.3478,
    lon: 6.2597
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
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    console.log('**********************');
    weatherData.then(results => {
        console.log(results[0]);
        res.write(JSON.stringify(results[0]));
        res.end('Hello World\n');
    });
}).listen(port);
