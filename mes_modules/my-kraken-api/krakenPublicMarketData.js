let request = require('request');
let krakenConfig = require('./krakenConfig')

let config = krakenConfig.config;

let postRequest = function(krakenActionKeyWord, params) {

    let options = {
        url: config.url + '/' + config.version + '/public/' + krakenActionKeyWord,
        method: 'POST',
        headers: {'User-Agent': 'Kraken Javascript API Client'},
        form: params,
        timeout: config.timeoutMS
    };

    return new Promise(function(onSuccess, onError) {
        request.post(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                let jsonBody = JSON.parse(body);
                onSuccess(jsonBody);
            } else {
                onError(error);
            }
        });

    });
}

module.exports.postRequest = postRequest;
