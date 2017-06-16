var kraken = require('./kraken-ids');

/*
market infos for ETH / EUR pair
*/

var getPairInfo = function(fn) {
    kraken.client.api('Ticker', {
        "pair": 'ETHEUR'
    }, fn);
};

module.exports.getPairInfo = getPairInfo;
