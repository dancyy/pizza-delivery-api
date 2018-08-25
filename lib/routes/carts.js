/**
 * Handle carts requests
 */

// Dependencies
const _data = require('../data');
const { verifyToken } = require('./tokens');
const { createRandomString } = require('../helpers');


// Container for the users submethods 
let _carts = {};

// Carts - post (Create Cart)
// Required data: email, productId, quantity, token
_carts.post = (data, callback) => {
    // Check that all required fields are filled out
    const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    const productId = typeof (data.payload.productId) == 'string' && data.payload.productId.trim().length > 0 ? data.payload.productId.trim() : false;
    const quantity = typeof (data.payload.quantity) == 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;

    // Get the token from the header
    const token = typeof (data.headers.token) == 'string' ? data.headers.token.trim() : false;

    if (email && productId && quantity) {
        // Verify the token
        verifyToken(token, email, (tokenIsValid) => {
            if(tokenIsValid) {
                // Look up the user 
                _data.read('users', email, (err, userData) => {
                    if (!err && userData) {

                        // Look up the product
                        _data.read('menu-items', productId, (err, productData) => {
                            if(!err && productData) {
                                // figure out how to construct this damm cart
                                // Create cart
                                const userCart = typeof (userData.cart) == 'object' && userData.cart instanceof Array ? userData.cart : [];

                                // Make sure the user only has one cart
                                if(userCart.length < 1) {
                                    const products = {};
                                    productData.quantity = quantity;
                                    products[productData.name] = productData;
                                    
                                    // create the cartId
                                    const cartId = createRandomString(20);
                    
                                    // Construct the cart object
                                    const cartObject = {
                                        cartId,
                                        email,
                                        products
                                    };
                    
                                    // Create the cart in the carts dir
                                    _data.create('carts', cartId, cartObject, (err) => {
                                        if(!err) {
                                            // Add the cartId to the user's object
                                            userData.cart = userCart;
                                            userData.cart.push(cartId);
                    
                                            // Save the new user data
                                            _data.update('users', email, userData, function (err) {
                                                if (!err) {
                                                    // Return the data about the new check
                                                    callback(200, cartObject);
                                                } else {
                                                    callback(500, { 'Error': 'Could not update the user with the new check.' });
                                                }
                                            });
                                        } else {
                                            callback(500, { 'Error': 'Could not create the new cart' });
                                        }
                                    });
                                } else {
                                    callback(400, {'Error' : 'Cart already created.'});
                                }
                            } else {
                                callback(404, {'Error' : 'Menu item does not exist'});
                            }
                        });
                    } else {
                        callback(500, { 'Error' : 'Error looking up user'});
                    }
                });
            } else {
                callback(403, {'Error' : 'Invalid token'});
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Carts - get
// Required data: cartId, token
_carts.get = (data, callback) => {
    
    // Check that all required fields are filled out
    const cartId = typeof (data.queryStringObject.cartId) == 'string' && data.queryStringObject.cartId.trim().length > 0 ? data.queryStringObject.cartId.trim() : false;

    // Get the token from the header
    const token = typeof (data.headers.token) == 'string' ? data.headers.token.trim() : false;
    if(cartId) {
        // Look up the cart
        _data.read('carts', cartId, (err, cartData) => {
            if(!err && cartData) {
                // Verify the token
                verifyToken(token, cartData.email, (tokenIsValid) => {
                    if(tokenIsValid) {
                        callback(200, cartData);
                    } else {
                        callback(403, {'Error' : 'Invalid token'});
                    }
                });
            } else {
                callback(404, {'Error' : 'This cart does not exist'});
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }

};

// Carts - put
// Required data: cartId, productId, action, token
_carts.put = (data, callback) => {
    const cartId = typeof (data.payload.cartId) == 'string' && data.payload.cartId.trim().length == 20 ? data.payload.cartId.trim() : false;
    const action = typeof (data.payload.action) == 'string' && ['add', 'delete'].indexOf(data.payload.action) > -1  ? data.payload.action.trim() : false;
    const productId = typeof (data.payload.productId) == 'string' && data.payload.productId.trim().length > 0 ? data.payload.productId.trim() : false;
    const quantity = typeof (data.payload.quantity) == 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;

    // Get the token from the header
    const token = typeof (data.headers.token) == 'string' ? data.headers.token.trim() : false;
    if(cartId && action && productId && quantity) {
        // Look up the cart
        _data.read('carts', cartId, (err, cartData) => {
            if(!err && cartData) {
                // Verify the token
                verifyToken(token, cartData.email, (tokenIsValid) => {
                    if(tokenIsValid) {
                        // Look up item
                        _data.read('menu-items', productId, (err, productData) => {
                            if (!err && productData) {
                                
                                // Add Item to cart
                                if(action == 'add') {
                                    if (cartData.products[productData.name]) {
                                        cartData.products[productData.name].quantity += quantity;
                                    } else {
                                        productData.quantity = quantity;
                                        cartData.products[productData.name] = productData;
                                    }
                                }

                                // Delete Item from cart
                                if(action == 'delete') {
                                    if (cartData.products[productData.name]){
                                        cartData.products[productData.name].quantity -= quantity;
                                        if (cartData.products[productData.name].quantity <= 0) {
                                            delete cartData.products[productData.name];
                                        }
                                    }
                                }

                                // Save change to cart
                                _data.update('carts', cartId, cartData, (err) => {
                                if(!err) {
                                        callback(200, cartData);
                                    } else {
                                        callback(500, {'Error' : 'Could not update the cart'});
                                    }
                                });
                            } else {
                                callback(404, {'Error' : 'Could not find menu-item'});
                            }
                        });
                    } else {
                        callback(403, {'Error' : 'Missing or invalid token'});
                    }
                });
            } else {
                callback(404, {'Error' : 'Cart does not exist'});
            }
        });
    } else {
        callback(400, {'Error' : 'Missing required fields'});
    }
};

// Carts - delete
// Required data: cartId, token
_carts.delete = (data, callback) => {
    // Check that all required fields are filled out
    const cartId = typeof (data.payload.cartId) == 'string' && data.payload.cartId.trim().length == 20 ? data.payload.cartId.trim() : false;
    // Get the token from the header
    const token = typeof (data.headers.token) == 'string' ? data.headers.token.trim() : false;
    if(cartId) {
        // Look up the token
        _data.read('tokens', token, (err, tokenData) => {
            if(!err && tokenData) {
                // Verify the token
                verifyToken(token, tokenData.email, (tokenIsValid) => {
                    if(tokenIsValid) {
                        // Delete cart
                        _data.delete('carts', cartId, (err) => {
                            if(!err) {
                                // Look up user
                                _data.read('users', tokenData.email, (err, userData) => {
                                    if(!err && userData) {
                                        delete userData.cart;

                                        // Update the userData
                                        _data.update('users', tokenData.email, userData, (err) => {
                                            if(!err) {
                                                callback(200);
                                            } else {
                                                callback(500, {'Error' : 'Could not update the user'})
                                            }
                                        });
                                    } else {
                                        callback(404, {'Error' : 'User not found'});
                                    }
                                });
                            } else {
                                callback(500, {'Error' : 'Could not delete cart'});
                            }
                        });
                    } else {
                        callback(403, {'Error' : 'Invalid token'})
                    }
                });
            } else {
                callback(400, {'Error' : 'Could not find token'})
            }
        });
    } else {
        callback(400, {'Error' : 'Missing required info'})
    }
};

// Export the module
module.exports = _carts;

