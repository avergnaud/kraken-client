var kraken = require('./kraken-ids');

/*
my balances
*/

var get = function() {
  kraken.client.api('Balance', null, function(error, data) {
      if(error) {
          console.log(error);
      }
      else {
          console.log(data.result);
      }
  });
};

module.exports.get = get;
