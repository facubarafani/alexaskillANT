'use strict';

var https = require('https');

exports.handler = function (event, context){
    try {
        var request = event.request;
    
        /*
            i) LaunchRequest      Ex: "Open greeter"
            ii) IntentRequest     Ex: "Say hello to john" or "ask greeter to say hello to John"
            iii) SessionEndedRequest Ex: "exit" or error
        */
    
        if (request.type==="LaunchRequest") {
            let options = {};
            options.speechText = "Bienvenido a Precio dolar. Con esta skill podra saber el precio del dolar actualizado.";
            options.repromptText = "Quiere saber el precio del dolar? Pregunte cual es el precio del dolar.";
            options.endsession = false;
            context.succeed(buildResponse(options));
        } 
        else if (request.type === "IntentRequest"){
            let options = {};
            if (request.intent.name === "PriceIntent"){
                options.speechText = `El precio del dolar es `;
                convertCurrency(1, 'USD', 'ARS', function(err, amount) {
                    if (err){
                        context.fail(err);
                    }else{
                        options.speechText += amount;
                        options.speechText += ' pesos.';
                        options.endsession = true;
                        context.succeed(buildResponse(options));
                    }
                 });
            } else {
                throw "Unknown intent";
            }
        } 
        else if (request.type === "SessionEndedRequest"){
        } 
        else {
            throw "Unknown intent";
        }
       } catch(e){
           context.fail("Exception: "+e);
       }
    };
    
    function buildResponse(options) {
        var response = {
            version: "1.0",
            response: {
                outputSpeech: {
                    type: "SSML",
                    ssml: '<speak>'+options.speechText+'</speak>'
                },
                shouldEndSession: options.endsession
            }
        };
        if (options.repromptText) {
            response.response.reprompt = {
                outputSpeech: {
                    type: "SSML",
                    ssml: '<speak>'+options.repromptText+'</speak>'
                }
            };
        }
        return response;
    }

    function convertCurrency(amount, fromCurrency, toCurrency, cb) {
        var apiKey = 'f255431f3901fe85c5c1';
      
        fromCurrency = encodeURIComponent(fromCurrency);
        toCurrency = encodeURIComponent(toCurrency);
        var query = fromCurrency + '_' + toCurrency;
      
        var url = 'https://free.currencyconverterapi.com/api/v6/convert?q='
                  + query + '&compact=ultra&apiKey=' + apiKey;
      
        https.get(url, function(res){
            var body = '';
      
            res.on('data', function(chunk){
                body += chunk;
            });
      
            res.on('end', function(){
                try {
                  var jsonObj = JSON.parse(body);
      
                  var val = jsonObj[query];
                  if (val) {
                    var total = val * amount;
                    cb(null, Math.round(total * 100) / 100);
                  } else {
                    var err = new Error("Value not found for " + query);
                    console.log(err);
                    cb(err);
                  }
                } catch(e) {
                  console.log("Parse error: ", e);
                  cb(e);
                }
            });
        }).on('error', function(e){
              console.log("Got an error: ", e);
              cb(e);
        });
      }
      
    // //   //way to use
      
    //    convertCurrency(1, 'USD', 'ARS', function(err, amount) {
    //      //console.log(amount);
    //   });