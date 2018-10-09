const morgan = require('morgan');
const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://root:'+ process.env.MONGO_ATLAS_PW +'@node-rest-shop-fqrp6.mongodb.net/test?retryWrites=true',
{
    useNewUrlParser: true
});

app.use(morgan('dev')); // logger
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//routes
const productRoute = require('./api/routes/product');
const orderRoute = require('./api/routes/order');

app.use('/products', productRoute);
app.use('/orders', orderRoute);

/*
Below error handling methods: Hindi ko gets itong error handling. Bakit dalawa ang ginawa?
Bakit gumagana kapag isa sa kanila ay wala?
*/

// Handles na scenario wherein no resource endpoint is available.
// If walang endpoint available then set err.status to 404 and pass the err object to the next function
app.use((req, res, next) => {
    const err = new Error('Endpoint not available!');
    err.status = 404;
    next(err);
});

// err object is now the first argument 
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


module.exports = app;