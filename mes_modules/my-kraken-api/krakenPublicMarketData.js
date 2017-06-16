let request = require('request');
let krakenConfig = require('./krakenConfig')

let config = krakenConfig.config;

let postRequest = function(krakenActionKeyWord, pair) {

    let options = {
        url: config.url + '/' + config.version + '/public/' + krakenActionKeyWord,
        method: 'POST',
        headers: {'User-Agent': 'Kraken Javascript API Client'},
        form: {"pair": pair},
        timeout: config.timeoutMS
    };

    return new Promise(function(onSuccess, onError) {
        request.post(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                let jsonBody = JSON.parse(body);
                onSuccess(jsonBody.result[pair]);
            } else {
                onError(error);
            }
        });

    });
}

module.exports.postRequest = postRequest;
