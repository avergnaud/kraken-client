var balance = require('./mes_modules/balance');
var etheur = require('./mes_modules/etheur');
var trader = require('./mes_modules/trader')
var krakenPublicMarketData = require('./mes_modules/my-kraken-api/krakenPublicMarketData');

// Display user's balance
// balance.get();

// Get Ticker Info
// etheur.getPairInfo();

//trade test
trader.etudieTrade();

/*
TODO régression linéaire...
https://stackoverflow.com/questions/6195335/linear-regression-in-javascript
http://mathworld.wolfram.com/LeastSquaresFitting.html
https://dracoblue.net/dev/linear-least-squares-in-javascript/
*/

// krakenPublicMarketData.postRequest('Ticker', 'XETHZEUR')
//   .then(function(responseBody) {
//     // console.log(responseBody.result);
//     console.log(responseBody);
//   }, function(error) {
//     console.log('error ' + error);
//   });

/*
Attention :
https://www.kraken.com/help/fees

Spéc :
  toutes les 10 (?) minutes :
    'Ticker', {"pair": 'ETHEUR'}
    { XETHZEUR:
       { a: [ '303.97485', '84', '84.000' ],
         b: [ '302.00002', '33', '33.000' ],
         c: [ '303.97485', '0.07564252' ],
         v: [ '127523.49385798', '293829.35426797' ],
         p: [ '288.15134', '306.29407' ],
         t: [ 16792, 45956 ],
         l: [ '261.28828', '261.28828' ],
         h: [ '315.00000', '344.69999' ],
         o: '309.60468' } }
    { ZEUR: '3.8583', XETH: '0.4580805500' }

    5% VOL:
    297 - 15 = 282
    297 + 15 = 312

*/
