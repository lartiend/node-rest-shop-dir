const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find().populate('productId', 'name').exec()
        .then(result => {
            if (result.length < 1) return res.status(200).json({
                message:'Order archive is empty.',
                request: {
                    type: 'POST',
                    description: 'Create new product item.',
                    url: 'http://localhost:3000/orders/',
                    body: {productId: 'ID of the product item', quantity: 'Number'}
                }
            });
            const response = {
                message: 'Handling GET request to /orders',
                count: result.length,
                orders: result.map(order => {
                    return {
                        productId: order,
                        request: {
                            type: 'GET',
                            description: 'Redirect to resource endpoint.',
                            url: 'http://localhost:3000/orders/'+order._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => res.status(500).json({error: err}));
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
        .then(data => { 
            if (!data) return res.status(404).json({error: 'Product does not exist.'});
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                productId: req.body.productId
            });
            return order.save();
        })
        .then(result => {
                const response = {
                    message: 'Handling POST request to /orders',
                    product: {
                            productId: result.productId,
                            quantity: result.quantity,
                            request: {
                                type: 'GET',
                                description: 'Redirect to created resource endpoint.',
                                url: 'http://localhost:3000/orders/'+result._id
                            }
                    }
                };
                res.status(201).json(response);
            })
        .catch(err => res.status(500).json({error: err}));
});

router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId).populate('productId', 'name')
        .then(order=> {
            if (!order) return res.status(404).json({error: 'Order does not exist.'});
            const response = {
                order: {
                    productId: order.productId,
                    quantity: order.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            }
            res.status(200).json(response);
        })
        .catch(err => res.status(500).json({error: err}));
});

router.patch('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id).exec()
        .then(data => {
            if (!data) return res.status(404).json({error: 'Order does not exist.'});
            Order.updateOne({_id:id}, {$set:{quantity:req.body.quantity}})
                .then(order => {
                    const response = {
                        message: 'Handling PATCH request to /orders/:orderId',
                        request: {
                            type: 'GET',
                            description: 'Retrieve updated order.',
                            url: 'http://localhost:3000/orders/'+id
                        }
                    };
                    res.status(200).json(response);
                })
        })
        .catch(err => res.status(500).json({error: err}));
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .then(data => {
            if (!data) return res.status(404).json({error: 'Order does not exist.'});
            return Order.deleteOne({_id:id});
        })
        .then(()=> {
            const response = {
                message: 'Handling DELETE request to /orders/:orderId',
                request: {
                    type: 'POST',
                    description: 'Create new order.',
                    url: 'http://localhost:3000/orders/',
                    body: {productId: 'productId', quantity: 'Number'}
                }
            }
            res.status(200).json(response);
        })
        .catch(err => res.status(500).json({error: err}));

});

// router.delete('/', (req, res, next) => {
//     Order.deleteMany({})
//     .then(()=> res.status(200).json(message: 'Order archive is cleaned.'))
//     .catch(err => res.status(500).json({error: err}));
// });


module.exports = router;
