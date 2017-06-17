var bullishTrader = require('./mes_modules/bullishTrader')

const VOL = 0.05;
const DEVISES = 'XETHZEUR';
/* trader - état binaire : long ETH ou pas.
initial state : longETH false = j'ai pas d'ETH */
let longETH = false;

/* analyse s'il faut faire un trade */

if (longETH) {
    /* long ETH position */
    etudieVente();
} else {
    let orderResult = bullishTrader.etudieAchat(VOL, DEVISES);
    // TODO confirmer longETH=false selon orderResult
}


/*
TODO régression linéaire...
https://stackoverflow.com/questions/6195335/linear-regression-in-javascript
http://mathworld.wolfram.com/LeastSquaresFitting.html
https://dracoblue.net/dev/linear-least-squares-in-javascript/
*/

/*
Attention :
https://www.kraken.com/help/fees

TODO appel CRON
*/
