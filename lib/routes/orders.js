/**
 * Handle orders requests
 */

// Dependencies
const _data = require('../data');
const { verifyToken } = require('./tokens');
const { createRandomString } = require('../helpers');


// Container for the order submethods 
let _orders = {};

// Orders - post (Create Order)
// Required data: cartId, token
_orders.post = (data, callback) => {
    const cartId = typeof (data.payload.cartId) == 'string' && data.payload.cartId.trim().length == 20 ? data.payload.cartId.trim() : false;
    // Get the token from the header
    const token = typeof (data.headers.token) == 'string' ? data.headers.token.trim() : false;

    if(cartId) {
        // Look up the token
        _data.read('tokens', token, (err, tokenData) => {
            if(!err && tokenData) {
                // Verify the token
                verifyToken(token, tokenData.email, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // Start making order
                        /**
                         * customer
                         * cart
                         * orderTotal
                         * payment
                         */

                    } else {
                        callback(403, { 'Error': 'Invalid Token' })
                    }
                });
            } else {
                callback(400, {'Error' : 'Token does not exist'});
            }
        });
    } else {
        callback(400, {'Error' : 'Missing required info'})
    }

};

// Export the module
module.exports = _orders;