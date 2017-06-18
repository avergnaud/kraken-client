let krakenPublicMarketData = require('./my-kraken-api/krakenPublicMarketData');
let krakenPrivateUserData = require('./my-kraken-api/krakenPrivateUserData');
let state = require('./botState');
let krakenConfig = require('./my-kraken-api/krakenConfig')

/* analyse s'il faut acheter */
let etudieAchat = function() {

    /* 1. get ETHEUR info */
    krakenPublicMarketData.postRequest('Ticker', {
            'pair': state.DEVISES
        })
        /* 2. is bullish ? */
        .then(function(tickerPairResponseBody) {
            if (isBullish(tickerPairResponseBody)) {
                return krakenPrivateUserData.postRequest('Balance', null);
            } else {
                return Promise.reject('not bullish');
            }
        })
        /* 3. try to place order = buy ETH */
        .then(function(userBalance) {
            if (isFundedEUR(userBalance)) {
                if (typeof state.coursETHenEUR != 'undefined') {
                    console.log('buy order ' + ETHamount(userBalance) + ' ETH');

                    return krakenPrivateUserData.postRequest('AddOrder', {
                        'pair': state.DEVISES,
                        'type': 'buy',
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
            /* exemples :
              {"error":[],"result":{"descr":{"order":"sell 0.35123729 ETHEUR @ market"},"txid":["OMTCOD-MFPQB-AOOCT7"]}}
              {"error":["EOrder:Insufficient funds"]} */
            if (orderResult.error.length == 0) {
                state.ownsETH = true;
                state.dernierTradeValeurETHenEUR = state.coursETHenEUR; /* state.coursETHenEUR valorisé dans isBullish */
                console.log('state.ownsETH ' + state.ownsETH);
            }
        })
        /* catch des Promise.reject */
        .catch(rejected => console.log('promise rejected: ' + rejected));
}

function isBullish(tickerPairResponseBody) {
    let pairInfo = tickerPairResponseBody.result[state.DEVISES];
    state.coursETHenEUR = parseFloat(pairInfo.c[0]);
    /* 1er appel uniquement initial state : moyenne2jours - VOL * moyenne2jours */
    if (state.dernierTradeValeurETHenEUR == 0) {
        let moyenne2jours = (parseFloat(pairInfo.p[0]) + parseFloat(pairInfo.p[1])) / 2;
        state.dernierTradeValeurETHenEUR = moyenne2jours;
    }
    let dernierTradeMoinsVol = state.dernierTradeValeurETHenEUR - state.VOL * state.dernierTradeValeurETHenEUR;

    console.log('---');
    console.log('dernierTradeValeurETHenEUR ' + state.dernierTradeValeurETHenEUR);
    console.log('dernierTradeMoinsVol ' + dernierTradeMoinsVol);
    console.log('bullish? ' + state.coursETHenEUR <= dernierTradeMoinsVol);

    return state.coursETHenEUR <= dernierTradeMoinsVol;
    // return true;
}

function isFundedEUR(userBalance) {
    /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
    let fondsEnEUR = parseFloat(userBalance.result['ZEUR']);

    console.log('fondsEnEUR ' + fondsEnEUR);
    console.log('isFundedEUR? ' + fondsEnEUR > 15);

    return fondsEnEUR > 15; /* je garde toujours 0.05 ETH ~ 15€ sur le compte */
}

function ETHamount(userBalance) {
    /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
    let fondsEnEUR = parseFloat(userBalance.result['ZEUR']);
    let montantETH = fondsEnEUR / state.coursETHenEUR - 0.05; /* je garde toujours 0.05 ETH ~ 15€ sur le compte */
    return montantETH.toString();
}

module.exports.etudieAchat = etudieAchat;
