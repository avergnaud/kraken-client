let bullishTrader = require('./mes_modules/bullishTrader');
let bearishTrader = require('./mes_modules/bearishTrader');
let state = require('./mes_modules/botState');
let cron = require('cron');
let krakenPublicMarketData = require('./mes_modules/my-kraken-api/krakenPublicMarketData');
let krakenPrivateUserData = require('./mes_modules/my-kraken-api/krakenPrivateUserData');
var prompt = require('prompt');

/*
Attention : https://www.kraken.com/help/fees
*/

krakenPublicMarketData.postRequest('Ticker', {
        'pair': state.DEVISES
    })
    .then(function(tickerPairResponseBody) {
        let pairInfo = tickerPairResponseBody.result[state.DEVISES];
        state.coursETHenEUR = parseFloat(pairInfo.c[0]);
        return krakenPrivateUserData.postRequest('Balance', null);
    }, function(error) {
        console.log('error [krakenPublicMarketData.postRequest(Ticker pair)] ' + error);
    })
    .then(function(userBalance) {
        let fondsEnEUR = parseFloat(userBalance.result['ZEUR']);
        let soldeEURConvertiEnETH = fondsEnEUR / state.coursETHenEUR;
        let soldeETH = parseFloat(userBalance.result['XETH']);

        console.log('you have ' + fondsEnEUR + '€ (' + soldeEURConvertiEnETH + 'ETH) and ' + soldeETH + ' ETH');

        state.ownsETH = soldeETH > soldeEURConvertiEnETH;
        let bullishBearish = state.ownsETH ? 'bearish' : 'bullish';

        console.log("Please confirm bot state: {ownsETH=" + state.ownsETH + "} which means you might be " + bullishBearish + " (ok/ko)");
        prompt.start();
        prompt.get('answer', function(err, result) {

            if ('ok' === result.answer) {

                /* run now */
                runBot();

                /* and then every 10 minutes */
                let cronJob = cron.job("0 */2 * * * *", runBot);
                cronJob.start()
                console.log('cronJob started');
            } else {
                console.log('position not expected - stopping');
            }
        });

    }, function(error) {
        console.log('error [krakenPrivateUserData.postRequest(Balance) ' + error);
    });


let orderResult;

function runBot() {
    if (state.ownsETH) {
        orderResult = bearishTrader.etudieVente();
    } else {
        orderResult = bullishTrader.etudieAchat();
    }
    if (typeof orderResult != 'undefined') {
        console.log('orderResult ' + orderResult);
    }
}

/*
TODO régression linéaire...
https://stackoverflow.com/questions/6195335/linear-regression-in-javascript
http://mathworld.wolfram.com/LeastSquaresFitting.html
https://dracoblue.net/dev/linear-least-squares-in-javascript/
*/
