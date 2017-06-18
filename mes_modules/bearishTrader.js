let krakenPublicMarketData = require('./my-kraken-api/krakenPublicMarketData');
let krakenPrivateUserData = require('./my-kraken-api/krakenPrivateUserData');
let state = require('./botState');
let krakenConfig = require('./my-kraken-api/krakenConfig')

/* analyse s'il faut vendre */
let etudieVente = function() {

    /* 1. get ETHEUR info */
    krakenPublicMarketData.postRequest('Ticker', {
            'pair': state.DEVISES
        })
        /* 2. is bearish ? */
        .then(function(tickerPairResponseBody) {
            if (isBearish(tickerPairResponseBody)) {
                return krakenPrivateUserData.postRequest('Balance', null);
            } else {
                return Promise.reject('not bearish');
            }
        })
        /* 3. try to place order = sell ETH */
        .then(function(userBalance) {
            if (isFundedETH(userBalance)) {
                if (typeof state.coursETHenEUR != 'undefined') {
                    console.log('sell order ' + ETHamount(userBalance) + ' ETH');

                    return krakenPrivateUserData.postRequest('AddOrder', {
                        'pair': state.DEVISES,
                        'type': 'sell',
                        'ordertype': 'market',
                        'volume': ETHamount(userBalance)
                    });
                } else {
                    return Promise.reject('coursETHenEUR undefined');
                }
            }

        })
        /* 4. log order result */
        .then(function(orderResult) {
            if (orderResult.error.length == 0) {
                state.ownsETH = false;
                state.dernierTradeValeurETHenEUR = state.coursETHenEUR; /* state.coursETHenEUR valorisé dans isBearish */
                console.log('state.ownsETH ' + state.ownsETH);
            }
        })
        /* catch des Promise.reject */
        .catch(rejected => console.log('promise rejected: ' + rejected));
}

function isBearish(tickerPairResponseBody) {
    let pairInfo = tickerPairResponseBody.result[state.DEVISES];
    state.coursETHenEUR = parseFloat(pairInfo.c[0]);
    /* 1er appel uniquement initial state : dernierTradeValeurETHenEUR = moyenne2jours */
    if (state.dernierTradeValeurETHenEUR == 0) {
        let moyenne2jours = (parseFloat(pairInfo.p[0]) + parseFloat(pairInfo.p[1])) / 2;
        state.dernierTradeValeurETHenEUR = moyenne2jours;
    }
    let dernierTradePlusVol = state.dernierTradeValeurETHenEUR + state.VOL * state.dernierTradeValeurETHenEUR;

    console.log('---');
    console.log('dernierTradeValeurETHenEUR ' + state.dernierTradeValeurETHenEUR);
    console.log('dernierTradePlusVol ' + dernierTradePlusVol);
    console.log('bearish? ' + state.coursETHenEUR >= dernierTradePlusVol);

    return state.coursETHenEUR >= dernierTradePlusVol;
    // return true;
}

function isFundedETH(userBalance) {
    /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
    let fondsEnETH = parseFloat(userBalance.result['XETH']);

    console.log('fondsEnETH ' + fondsEnETH);
    console.log('isFundedETH? ' + fondsEnETH > 0.05);

    return fondsEnETH > 0.05; /* je garde toujours 0.05 ETH ~ 15€ sur le compte */
}

function ETHamount(userBalance) {
    /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
    let fondsEnETH = parseFloat(userBalance.result['XETH']);
    let montantETH = fondsEnETH - 0.05; /* je garde toujours 0.05 ETH ~ 15€ sur le compte */
    return montantETH.toString();
}

module.exports.etudieVente = etudieVente;
