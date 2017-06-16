var krakenPublicMarketData = require('./my-kraken-api/krakenPublicMarketData');

/*
trader - état binaire :
  a acheté = doitVendre
  ou
  a vendu = doitAcheter
*/

let VOL = 0.05;

/* initial state bearish : true */
let doitAcheter = true;

/* cours de l'ETH en EUR lors du dernier trade
initial state moyenne2jours - VOL * moyenne2jours */
let dernierTradeValeurETHenEUR = 0;

/*
analyse si il faut faire un trade
*/
let etudieTrade = function() {
  if(doitAcheter) {
    etudieAchat();
  } else {
    etudieVente();
  }
};

/*
analyse si il faut acheter
*/
let etudieAchat = function() {
  /* Achète si
      le cours est inférieur à p = volume weighted average price array(<today>, <last 24 hours>) - 5%.p
      ET si
      le cours est inférieur à dernierTradeValeurETHenEUR - 5%.dernierTradeValeurETHenEUR (évite le cas major upturn - hors périmètre)
    OU si
      le cours est inférieur à dernierTradeValeurETHenEUR - 5%.dernierTradeValeurETHenEUR */



    let pairInfo;
    let cours;
    let moyenne2jours;
    let achat;

    krakenPublicMarketData.postRequest('Ticker', 'XETHZEUR')
      .then(function(responseBody) {
        pairInfo = responseBody;
        cours = parseFloat(pairInfo.c[0]);
        // console.log('moyenne 2 jours ' + moyenne2jours);

        //1er appel uniquement
        if(dernierTradeValeurETHenEUR == 0) {
          moyenne2jours = (parseFloat(pairInfo.p[0]) + parseFloat(pairInfo.p[1])) / 2;
          dernierTradeValeurETHenEUR = moyenne2jours;
        }

        let dernierTradeMoinsVol = dernierTradeValeurETHenEUR - 0.05 * dernierTradeValeurETHenEUR;

        achat = cours <= dernierTradeMoinsVol;

        // console.log('cours ' + cours);
        // console.log('moyenne2jours ' + moyenne2jours);
        // console.log('dernierTradeMoinsVol ' + dernierTradeMoinsVol);
        // console.log('achat ' + achat);

        // achat = true;

        // return achat;

      }, function(error) {
        console.log('error ' + error);
        // return 0;
      })
      .then(function() {
        console.log('achat ' + achat);
      });

    // let cours = pairInfo.c;
    // let moyenne2jours = (parseFloat(pairInfo.p[0]) + parseFloat(pairInfo.p[1])) / 2;
    // let limite = moyenne2jours - 0.05 * moyenne2jours;
    // console.log(' cours : ' + cours);
    // console.log('limite : ' + limite);
    // console.log('dernierTradeValeurETHenEUR : ' + dernierTradeValeurETHenEUR);
}

/*
analyse si il faut vendre
*/
var etudieVente = function() {
  /* Vend si le cours est supérieur à p = volume weighted average price array(<today>, <last 24 hours>) + 5%.p
    et si
    le cours est supérieur à dernierTradeValeurETHenEUR + 5%.dernierTradeValeurETHenEUR (évite le cas major downturn - hors périmètre)
    OU si
    le cours est supérieur à dernierTradeValeurETHenEUR + 5%.dernierTradeValeurETHenEUR */

}

module.exports.doitAcheter = doitAcheter;
module.exports.etudieTrade = etudieTrade;
