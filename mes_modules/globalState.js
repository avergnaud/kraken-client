
/* la volatilité qu'on choisit pour acheter - vendre */
const VOL = 0.05;

const DEVISES = 'XETHZEUR';
const BASE_CURRENCY = 'XETH';
const QUOTE_CURRENCY = 'ZEUR';

let pairInfo;
let balance;
let dernierTradeValeurETHenEUR;
let exchangeLastPrice;

module.exports.VOL = VOL;
module.exports.DEVISES = DEVISES;
module.exports.BASE_CURRENCY = BASE_CURRENCY;
module.exports.QUOTE_CURRENCY = QUOTE_CURRENCY;
module.exports.pairInfo = pairInfo;
module.exports.balance = balance;
module.exports.dernierTradeValeurETHenEUR = dernierTradeValeurETHenEUR;
module.exports.exchangeLastPrice = exchangeLastPrice;
