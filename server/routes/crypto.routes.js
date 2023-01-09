const express = require('express');
const app = express();
const cc = require('cryptocompare');
const dotenv = require("dotenv");
dotenv.config();

cc.setApiKey(process.env.API_KEY);
let data = require('../constants/data.json');
data = Object.assign(data.data.reverse());


const getTokens = () => {
    let token_list = [];

    for (let i = 0; i < data.length; i++) {
        if (token_list.indexOf(data[i].type) === -1) token_list.push(data[i].type);
    }

    return token_list;
}

const tokens = getTokens();

// @param 
//      token: token name (if not setted, all tokens)
//      date: timestamp (if not setted, today's timestamp)
const getTokenSum = (token, date = new Date().getTime()) => {
    let sum = 0;
    let localData = data.filter(item => item.type.trim().toUpperCase() === token && item.timestrap * 1000 <= date);

    for (let i = 0; i < localData.length; i++) {
        sum += localData[i].amount * localData[i].flag;
    }
    
    return sum;
}

// @param
//      token: token name
const isTokenExist = (token) => {
    return tokens.indexOf(token.trim().toUpperCase()) === -1 ? false : true;
}

// @param
//      token: token name
//      date: timestamp
const getPriceHistorical = async (token, date) => {
    let result;

    await cc.priceHistorical(token, ['USD'], date)
        .then(price => {
            result = price;
        }).catch(err => console.log(err));

    return result;
}

// @param
//      token: token name
const getLatestTokenPrice = async (token) => {
    let result;

    await cc.price([token], ['USD']).then(price => {
        result = price;
    }).catch(err => console.log(err));

    return result;
}

// @param
//      token: token names (array)
const getLatestMultiTokenPrice = async (toke_list) => {
    let result;
    
    await cc.priceMulti(toke_list, ['USD']).then(prices => {
        result = prices;
    }).catch(err => console.log(err));

    return result;
}


// @route    GET /token/:token name
// @desc     GET given token balance and prices until today
// @access   Public
app.get('/', async (req, res) => {
    let prices = await getLatestMultiTokenPrice(tokens);
    let result = [];
    
    for (item in prices) {
        result.push(new Object({
            'token': item,
            'price': prices[item].USD
        }))
    }

    res.send(result);
})


// @route    GET /token/:token name
// @desc     GET given token balance and price until today
// @access   Public
app.get('/token/:name', async (req, res) => {
    
    if ( !isTokenExist(req.params.name) ) {
        res.send('Only BTC, ETH, XRP are Available');
        return;
    }
    
    let price = await getLatestTokenPrice(req.params.name);
    res.send(
        {
            'token': req.params.name,
            'balance:' : getTokenSum(req.params.name.trim().toUpperCase()),
            'price': price.USD,
        }
    )
});


// @route    GET /date/:date
// @desc     GET registered tokens's prices and balances until given date
// @access   Public
app.get('/date/:date', async (req, res) => {
    let result = [];
    
    for (let i = 0; i < tokens.length; i++) {
        let price = await getPriceHistorical(tokens[i], new Date(req.params.date * 1000))
        
        result.push(
            {
                'token': tokens[i], 
                'balance'  : getTokenSum(tokens[i].trim().toUpperCase(), req.params.date * 1000), 
                'price': price.USD
            }
        )
    }
    res.send(result);
});

// @route    GET /token_date/:token/:date
// @desc     GET given tokens's prices and balances until given date
// @access   Public
app.get('/token_date/:token/:date', async (req, res) => {
    let result = [];

    if ( !isTokenExist(req.params.token) ) {
        res.send('Only BTC, ETH, XRP are Available');
        return;
    }
    
    let price = await getPriceHistorical(req.params.token.trim().toUpperCase(), new Date(req.params.date * 1000))
    result.push(
        {
            'token': req.params.token, 
            'balance'  : getTokenSum(req.params.token.trim().toUpperCase(), req.params.date * 1000), 
            'price': price.USD
        }
    )
    res.send(result);
})

module.exports = app;