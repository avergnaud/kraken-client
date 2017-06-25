let krakenPublicMarketData = require('./my-kraken-api/krakenPublicMarketData');
let krakenPrivateUserData = require('./my-kraken-api/krakenPrivateUserData');
let state = require('./globalState');
let krakenConfig = require('./my-kraken-api/krakenConfig')

/* analyse s'il faut vendre */
let etudieVente = function() {

    if (goVente() && isFunded() && typeof state.exchangeLastPrice != 'undefined') {

        /* Si on veut vendre et qu'on a les fonds */
        console.log('sell order ' + amount() + state.BASE_CURRENCY);
        /* 1. ordre de vente */
        krakenPrivateUserData.postRequest('AddOrder', {
                'pair': state.DEVISES,
                'type': 'sell',
                'ordertype': 'market',
                'volume': amount()
            })
            /* 2. order result */
            .then(function(orderResult) {
                if (orderResult.error.length == 0) {
                    state.dernierTradeValeurETHenEUR = parseFloat(state.pairInfo.c[0]);
                }
                console.log(JSON.stringify(orderResult) + ' @market price: ' + state.dernierTradeValeurETHenEUR);
            })
            .catch(rejected => console.log('promise rejected: ' + rejected));
    }
}

/* on veut vendre si le prix a monté de state.VOL */
function goVente() {

    let dernierTradePlusVol = state.dernierTradeValeurETHenEUR + state.VOL * state.dernierTradeValeurETHenEUR;
    let retour = state.exchangeLastPrice >= dernierTradePlusVol;

    console.log('Dernier trade + ' + state.VOL + '% = ' + dernierTradePlusVol);
    console.log('> Vente ? ' + retour.toString());

    // return retour;
    return true;
}

function isFunded() {
    /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
    let fondsEnETH = parseFloat(state.balance.result[state.BASE_CURRENCY]);

    /* je garde toujours 0.05 ETH ~ 15€ sur le compte */
    let retour = fondsEnETH > 0.05;

    return retour;
}

function amount() {
    /* userBalance {"error":[],"result":{"ZEUR":"93.1911","XETH":"0.1580805500"}} */
    let fondsEnETH = parseFloat(state.balance.result[state.BASE_CURRENCY]);
    let montantETH = fondsEnETH - 0.05; /* je garde toujours 0.05 ETH ~ 15€ sur le compte */
    montantETH = montantETH.toFixed(1); /* arrondi */
    return montantETH.toString();
}

module.exports.etudieVente = etudieVente;
