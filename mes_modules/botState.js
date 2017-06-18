
/* la volatilité qu'on choisit pour acheter - vendre */
const VOL = 0.05;

/* les devises dans lesquelles on veut trader */
const DEVISES = 'XETHZEUR';

/* trader - état binaire : est-ce que j'ai des ETH ou pas */
let ownsETH = false;

/* cours de l'ETH en EUR lors du dernier trade
initial state : 0 */
let dernierTradeValeurETHenEUR = 0;

/* cours de l'ETH en euros */
let coursETHenEUR;

module.exports.VOL = VOL;
module.exports.DEVISES = DEVISES;
module.exports.ownsETH = ownsETH;
module.exports.dernierTradeValeurETHenEUR = dernierTradeValeurETHenEUR;
module.exports.coursETHenEUR = coursETHenEUR;
