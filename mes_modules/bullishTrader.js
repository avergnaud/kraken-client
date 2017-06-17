let krakenPublicMarketData = require('./my-kraken-api/krakenPublicMarketData');
let krakenPrivateUserData = require('./my-kraken-api/krakenPrivateUserData');

/* cours de l'ETH en EUR lors du dernier trade */
let dernierTradeValeurETHenEUR = 0;

let coursETHenEUR;

/* analyse s'il faut acheter */
let etudieAchat = function(VOL, DEVISES) {
    /* a priori on achète pas */
    let go = false;

    /* 1. get ETHEUR info */
    krakenPublicMarketData.postRequest('Ticker', {
            'pair': DEVISES
        })
    /* 2. is bullish ? */
        .then(function(tickerPairResponseBody) {
            return isBullish(tickerPairResponseBody, DEVISES, VOL);
        }, function(error) { console.log('error ' + error); })
    /* 3. get balance */
        .then(function(bullish) {
            console.log('bullish ' + bullish);
            if (bullish) { go = true; }
            return krakenPrivateUserData.postRequest('Balance', null);
        }, function(error) { console.log('error ' + error); })
    /* 4. place order = buy ETH */
        .then(function(userBalance) {
            console.log('userBalance ' + JSON.stringify(userBalance));
            if (go && isFundedEUR(userBalance)) {
                console.log('go ' + go);
                if (typeof coursETHenEUR != 'undefined') {
                  return krakenPrivateUserData.postRequest('AddOrder', {
                    'pair': DEVISES,
                    'type': 'buy',
                    'ordertype': 'market',
                    'volume': ETHamount(userBalance)
                  });
                } else {
                  return 'coursETHenEUR undefined';
                }
            }

        }, function(error) { console.log('error ' + error); })
    /* 5. log order result */
        .then(function(orderResult) {
            return orderResult; /* maintenant j'ai des ETH */
        }, function(error) { console.log('error ' + error); });
}

function isBullish(tickerPairResponseBody, DEVISES, VOL) {
    let pairInfo = tickerPairResponseBody.result[DEVISES];
    coursETHenEUR = parseFloat(pairInfo.c[0]);
    /* 1er appel uniquement initial state : moyenne2jours - VOL * moyenne2jours */
    if (dernierTradeValeurETHenEUR == 0) {
        let moyenne2jours = (parseFloat(pairInfo.p[0]) + parseFloat(pairInfo.p[1])) / 2;
        dernierTradeValeurETHenEUR = moyenne2jours;
    }
    let dernierTradeMoinsVol = dernierTradeValeurETHenEUR - VOL * dernierTradeValeurETHenEUR;
    return coursETHenEUR <= dernierTradeMoinsVol;
    // return true;
}

function isFundedEUR(userBalance) {
  /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
  let fondsEnEUR = parseFloat(userBalance.result['ZEUR']);
  return fondsEnEUR > 15;/* je garde toujours 0.05 ETH ~ 15€ sur le compte */
}

function ETHamount(userBalance) {
  /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
  let fondsEnEUR = parseFloat(userBalance.result['ZEUR']);
  let montantETH = fondsEnEUR / coursETHenEUR - 0.05; /* je garde toujours 0.05 ETH ~ 15€ sur le compte */
  return montantETH.toString();
}

module.exports.etudieAchat = etudieAchat;
