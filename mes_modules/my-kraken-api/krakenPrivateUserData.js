let request = require('request');
let crypto = require('crypto');
let querystring	= require('querystring');
let krakenConfig = require('./krakenConfig')

let config = krakenConfig.config;

let postRequest = function(krakenActionKeyWord, params) {

    params = params || {};

    params.nonce = new Date() * 1000; // spoof microsecond

    let path	= '/' + config.version + '/private/' + krakenActionKeyWord;

    let signature = getMessageSignature(path, params, params.nonce);

    let headers = {
      'User-Agent': 'Kraken Javascript API Client',
			'API-Key': config.key,
			'API-Sign': signature
		};

    let options = {
        url: config.url + path,
        method: 'POST',
        headers: headers,
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

/**
 * This method returns a signature for a request as a Base64-encoded string
 * @param  {String}  path    The relative URL path for the request
 * @param  {Object}  request The POST body
 * @param  {Integer} nonce   A unique, incrementing integer
 * @return {String}          The request signature
 */
function getMessageSignature(path, request, nonce) {
  var message	= querystring.stringify(request);
  var secret	= new Buffer(config.secret, 'base64');
  var hash	= new crypto.createHash('sha256');
  var hmac	= new crypto.createHmac('sha512', secret);

  var hash_digest	= hash.update(nonce + message).digest('binary');
  var hmac_digest	= hmac.update(path + hash_digest, 'binary').digest('base64');

  return hmac_digest;
}

module.exports.postRequest = postRequest;
