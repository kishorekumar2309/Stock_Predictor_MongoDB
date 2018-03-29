var request = require('request');
var rp = require('request-promise');
var mongoose = require('mongoose');
var History = require('./models/historicalmodel')
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/historical');

var companies = ['TWTR','AMZN', 'GOOG', 'MSFT', 'AAPL', 'FB', 'NVDA', 'WMT', 'TGT', 'SAP'];

var urlRequests = [];

for(let i=0; i<companies.length; i++){
    let temp = {
        uri: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+companies[i]+'&outputsize=full&datatype=json&apikey=67M5HDM0P13NRL8A',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    }
    urlRequests.push(temp);
}


function queryExecutor(urls){
    var index = 0;

    function next(){
        if(index < urls.length){
            rp(urls[index++])
                .then(function (result) {
                    let metadata = result['Meta Data'];
                    let data = result['Time Series (Daily)'];
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            let oneDay = new History();
                            oneDay.company = metadata['2. Symbol'];
                            oneDay.date = key;
                            let details = data[key];
                            oneDay.open = details['1. open'];
                            oneDay.high = details['2. high'];
                            oneDay.low = details['3. low'];
                            oneDay.close = details['4. close'];
                            oneDay.volume = details['5. volume'];
                            oneDay.save().then(function(a){
                            }).catch(function(err){
                                console.log('Data is already present');
                            });
                        }
                    }
                    next();
                })
                .catch(function (err) {
                    console.log('API is currently getting updated');
                });   
        }
        else console.log("Done Uploading data");
    }
    next();
}

queryExecutor(urlRequests);