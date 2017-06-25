let acheteur = require('./mes_modules/acheteur');
let vendeur = require('./mes_modules/vendeur');
let cron = require('cron');
let state = require('./mes_modules/globalState')
let krakenPublicMarketData = require('./mes_modules/my-kraken-api/krakenPublicMarketData');
let krakenPrivateUserData = require('./mes_modules/my-kraken-api/krakenPrivateUserData');

// run();

let cronJob = cron.job("0 */2 * * * *", run);
cronJob.start();
console.log('cronJob started');

function run() {
    /* 1. Récupération des informations sur les state.DEVISES */
    krakenPublicMarketData.postRequest('Ticker', {
            'pair': state.DEVISES
        })
        /* 2. Récupération du solde */
        .then(function(tickerPairResponseBody) {

            state.pairInfo = tickerPairResponseBody.result[state.DEVISES];
            state.exchangeLastPrice = parseFloat(state.pairInfo.c[0]);
            if (typeof state.botLastTradePrice == 'undefined') {
                /* 1er appel uniquement initial state : botLastTradePrice = moyenne2jours */
                let moyenne2jours = (parseFloat(state.pairInfo.p[0]) + parseFloat(state.pairInfo.p[1])) / 2;
                state.botLastTradePrice = moyenne2jours;
            }
            return krakenPrivateUserData.postRequest('Balance', null);
        })
        /* Décision : envisager un achat ou une vente */
        .then(function(balance) {

            state.balance = balance;
            let fondsEnEUR = parseFloat(balance.result[state.QUOTE_CURRENCY]);
            let exchangeLastPrice = parseFloat(state.pairInfo.c[0]);
            let soldeEURConvertiEnCrypto = fondsEnEUR / exchangeLastPrice;
            let soldeCrypto = parseFloat(balance.result[state.BASE_CURRENCY]);

            console.log('--------------------------------------------------------------');
            console.log(fondsEnEUR + '€ (' + soldeEURConvertiEnCrypto + state.BASE_CURRENCY + ') | ' + soldeCrypto + state.BASE_CURRENCY);

            if (soldeCrypto > soldeEURConvertiEnCrypto) {
                state.botLastTradePrice = vendeur.etudieVente();
            } else {
                state.botLastTradePrice = acheteur.etudieAchat();
            }
        })
        .catch(rejected => console.log(rejected + ' call failure'));
}
