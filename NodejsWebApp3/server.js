'use strict';
var http = require('http');
var js2xmlparser = require("js2xmlparser");
var port = process.env.PORT || 1337;
var fiveDaySummary;
var forecast;
var meteo;
var meteodata;
var jsonData;
var htmlStyle = 'body { background: #F4F4F4; margin: 0; } #container { width: 1024px; margin: 0 auto; background: #FFFFFF; } #header { padding: 45px 0 20px 40px; } #header a { color: #121212; text-decoration: none; font-size: 30px; font-family: \"Myriad Pro\", \"Arial Narrow\"; } #menu { background-color: #3b7687; padding: 6px 0 6px 40px; } #menu a { color: #c5d6db; text-decoration: none; font-size: 14px; font-family: \"Arial Narrow\", \"Myriad Pro\"; } #menu a:hover { color: #ecf2f3; } #sidebar { float: left; width: 120px; padding: 30px 0 0 40px; margin: 0; } h1 { margin: 0px; color: #869843; font-size:24px; font-family: \"Arial Narrow\", \"Myriad Pro\"; font-weight: normal; } h2 { color: #3b7687; font-size: 15px; margin: 20px 0 5px 0; } #main { margin: 0 0 0 180px; padding: 35px 40px 30px 0; color: #444444; font-family: \"Georgia\"; font-size: 13px; line-height: 18px; text-align: justify; } #main a { color: #3b7687; text-decoration: none; } #main a:hover { color: #444444; } #footer { padding: 6px 40px 6px 40px; background: #d6d6d6; font-family: \"Lucida Sans Unicode\"; color: #444444; font-size: 11px; text-align: right; } #footer a { text-decoration: none; color: #262626; } #footer a:hover { color: #666666; } .separator { font-size:11px; color:#FFFFFF; }';
var htmlDocument = '<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\"> <html xmlns=\"http://www.w3.org/1999/xhtml\"> <head> <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" /> <meta name=\"author\" content=\"realitysoftware.ca\" /> <title>AgriAlert</title> <link rel=\"stylesheet\" type=\"text/css\" href=\"css/style.css\"/><style>' + htmlStyle + '</style></head> <body> <div id=\"container\"> <div id=\"header\"> <a href=\"#\">AgriAlert</a> </div> <div id=\"menu\"> <a href=\"#\">ALERT</a> &nbsp; &nbsp; &nbsp; &nbsp; <a href=\"#\">ABOUT US</a> &nbsp; &nbsp; &nbsp; &nbsp; <a href=\"#\">SERVICES</a> &nbsp; &nbsp; &nbsp; &nbsp; <a href=\"#\">PRICING</a> &nbsp; &nbsp; &nbsp; &nbsp; <a href=\"#\">CONTACTS</a> </div> <div id=\"sidebar\"> <h1>Welcome</h1> </div> <div id=\"main\"> <p>AgriAlert is your tool to provide you with information on how temperatures affect your crops.</p>';
var htmlDocument2 = '</div> <div id=\"footer\"> &copy;2017 AgriAlert &nbsp;<span class=\"separator\">|</span>&nbsp; Design by <a href=\"http://www.realitysoftware.ca\" title=\"Website Design\">Reality Software</a> </div> </div> </body> </html>';
var plantInfo = [
    ["", "SWELLING", "FIRST COLOR", "FULL BLOOM"],
    ["APPLE 10% kill", "-9,4", "-2,2", "-2,2"],
    ["APPLE 90% kill", "-16,7", "-4,4", "-3,9"],
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
    res.write(htmlDocument);
    res.write('<h1>AgriAlert</h1>');
    res.write('<h2>Warning data for Chesky, Russian</h2>');
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
            res.write('<tr><td valign="top"><b>From: </b></td><td valign="top">' + continut['from'] + '</td></tr>');
            res.write('<tr><td valign="top"><b>To: </b></td><td valign="top">' + continut['to'] + '</td></tr>');
            res.write('<tr><td valign="top"><b>Rain: </b></td><td valign="top">' + continut['rain'] + '</td></tr>');
            res.write('<tr><td valign="top"><b>Temp: </b></td><td valign="top">' + continut['temperature'] + '</td></tr>');
            res.write('<tr><td valign="top" colspan="2"><b>Affected Crops: </b><br /><font size="-3"><ul style ="padding:0">');
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
            res.write('</ul></font></td></tr>');
            res.write('</table></td>');
        }
        res.end('</tr></table>' + htmlDocument2);
    });
}).listen(port);
