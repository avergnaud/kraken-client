let krakenPublicMarketData = require('./my-kraken-api/krakenPublicMarketData');
let krakenPrivateUserData = require('./my-kraken-api/krakenPrivateUserData');
let state = require('./globalState');
let krakenConfig = require('./my-kraken-api/krakenConfig')

/* analyse s'il faut acheter */
let etudieAchat = function() {

    if (goAchat() && isFundedEUR() && typeof state.exchangeLastPrice != 'undefined') {
        /* Si on veut acheter et si on a les fonds */
        console.log('buy order ' + amount() + state.BASE_CURRENCY);
        /* 1. Ordre d'achat */
        krakenPrivateUserData.postRequest('AddOrder', {
                'pair': state.DEVISES,
                'type': 'buy',
                'ordertype': 'market',
                'volume': amount() /* all in */
            })
            /* 2. order result */
            .then(function(orderResult) {
                /* exemples :
                  {"error":[],"result":{"descr":{"order":"sell 0.35123729 ETHEUR @ market"},"txid":["OMTCOD-MFPQB-AOOCT7"]}}
                  {"error":["EOrder:Insufficient funds"]} */
                if (orderResult.error.length == 0) {
                    state.dernierTradeValeurETHenEUR = parseFloat(state.pairInfo.c[0]);
                }
                console.log(JSON.stringify(orderResult) + ' @market price: ' + state.dernierTradeValeurETHenEUR);
            })
            .catch(rejected => console.log('promise rejected: ' + rejected));
    }
}

/* on veut acheter si le prix a baissé de state.VOL */
function goAchat() {

    let dernierTradeMoinsVol = state.dernierTradeValeurETHenEUR *(1 - state.VOL);
    let retour = state.exchangeLastPrice <= dernierTradeMoinsVol;

    console.log('Dernier trade - ' + state.VOL + '% = ' + dernierTradeMoinsVol);
    console.log('> Achat ? ' + retour.toString());

    // return retour;
    return true;
}

/* Est-ce qu'on a encore des EUR */
function isFundedEUR() {
    /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
    let fondsEnEUR = parseFloat(state.balance.result[state.QUOTE_CURRENCY]);

    /* je garde toujours 0.05 ETH ~ 15€ sur le compte */
    let retour = fondsEnEUR > 15;

    // return retour;
    return true;
}

/* Dépense tout le solde */
function amount() {
    /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
    let fondsEnEUR = parseFloat(state.balance.result[state.QUOTE_CURRENCY]);
    let montantETH = fondsEnEUR / state.exchangeLastPrice - 0.05; /* je garde toujours 0.05 ETH ~ 15€ sur le compte */
    return montantETH.toString();
}

module.exports.etudieAchat = etudieAchat;
