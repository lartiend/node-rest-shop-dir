const router = require('express')();
const mongoose = require('mongoose');
const Product = require('../models/product');

var notFound = 'No valid entry found.';

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price')
        .exec()
        .then(result => {
            if (result.length < 1) return res.status(200).json({ // check if result collection is empty
                message:'Product archive is empty.',
                request: {
                    type: 'POST',
                    description: 'Create new product item.',
                    url: 'http://localhost:3000/products/',
                    body: {name: 'String', price: 'Number'}
                }
            });
            const response = {
                message: 'Handling GET request to /products',
                count: result.length,
                products: result.map(result => {
                    return {
                        name: result.name,
                        price: result.price,
                        request: {
                            type: 'GET',
                            description: 'Redirect to resource endpoint.',
                            url: 'http://localhost:3000/products/'+result._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => res.status(500).json({error: err}));
});

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save()
        .then(result => {
            const response = {
                message: 'Handling POST request to /products',
                product: {
                        name: result.name,
                        price: result.price,
                        request: {
                            type: 'GET',
                            description: 'Redirect to created resource endpoint.',
                            url: 'http://localhost:3000/products/'+result._id
                        }
                }
            };
            res.status(201).json(response);
        })
        .catch(err => res.status(500).json({error: err}));
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price')
        .exec()
        .then(result => {
            if (!result) return res.status(404).json({message:notFound});
            const response = {
                message: 'Handling GET request to /products/:productId',
                product: {
                        name: result.name,
                        price: result.price,
                        request: {
                            type: 'GET',
                            description: 'Fetch all products',
                            url: 'http://localhost:3000/products/'
                        }
                }
            };
            res.status(200).json(response);
        })
        .catch(err => res.status(500).json({error: err}));
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).exec() // check if product exists
        .then(id => {
                if (!id) return res.status(404).json({message:notFound});
                Product.deleteOne({_id:id})
                .exec()
                .then(result => {
                    const response = {
                        message: 'Handling DELETE request to /products/:productId',
                        request: {
                            type: 'POST',
                            description: 'Create new product item.',
                            url: 'http://localhost:3000/products/',
                            body: {name: 'String', price: 'Number'}
                        }
                    };
                    res.status(200).json(response);
                });
        })
        .catch(err => res.status(500).json({message:err}));
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.findById(id).exec() // check if product exists
        .then(product => {
            if (!product) return res.status(404).json({message:notFound});
            Product.updateOne({_id:id}, {$set: updateOps})
                .then(result => {
                    if (!product) return res.status(404).json({message:notFound});
                    const response = {
                        message: 'Handling PATCH request to /products/:productId',
                        request: {
                            type: 'GET',
                            description: 'Retrieve updated product.',
                            url: 'http://localhost:3000/products/'+product._id
                        }
                    };
                    res.status(200).json(response);
                })
        })
        .catch(err => res.status(500).json({error: err}));
});

module.exports = router;