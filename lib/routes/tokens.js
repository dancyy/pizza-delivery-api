/**
 * Handle tokens requests
 */

// Dependencies
const _data = require('../data');
const { hash, createRandomString } = require('../helpers');

// Container for the users submethods 
let _tokens = {};

// Tokens - post
// Required data: email address, password.
_tokens.post = (data, callback) => {
    // Check that all required fields are filled out
    const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? hash(data.payload.password.trim()) : false;

    if (email && password) {
        // Look up the user
        _data.read('users', email, (err, userData) => {
            if(!err && userData) {
                // Compare passed in password with one in database
                if(password === userData.password) {
                    // create the token
                    const token = createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    // Construct the token object
                    const tokenObject = {
                        tokenId : token,
                        email,
                        expires
                    };

                    // Store the token
                    _data.create('tokens', token, tokenObject, (err) => {
                        if(!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error' : 'Could not save token'});
                        }
                    });
                } else {
                    callback(403, {'Error' : 'Incorrect password or email'});
                }

            } else {
                callback(404, {'Error' : 'User does not exist'});
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Tokens - get
// Required data: token id
_tokens.get = (data, callback) => {
    // Check that all required fields are filled out
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        // Look up the token by id
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, { 'Error': 'Token does not exist' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Tokens - put
// Required data: token id, extend.
_tokens.put = (data, callback) => {
    // Check that all required fields are filled out
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? data.payload.extend : false;

    if (id && extend) {
        
        // Look up the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                
                // Make sure the token is not expired
                if(tokenData.expires > Date.now()) {
                    
                    // Update the expiration time of the token by an hour
                    tokenData.expires = Date.now() + 1000 * 60 *60;

                    // Save the new tokenData
                    _data.update('tokens', id, tokenData, (err) => {
                        if(!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error' : 'Could not extend the token'});
                        }
                    });
                } else {
                    callback(403, {'Error' : 'This token has expired'});
                }
            } else {
                callback(404, { 'Error': 'User does not exist' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Tokens - delete
// Required data: token id
_tokens.delete = (data, callback) => {
    // Check that all required fields are filled out
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        // Look up the token by id
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Delete the token
                _data.delete('tokens', id, (err) => {
                    if(!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error' : 'Could not delete the token'});
                    }
                });
            } else {
                callback(404, { 'Error': 'Token does not exist' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Verify that a given token is currently valid for the user
_tokens.verifyToken = (tokenId, email, callback) => {
    // Look up the token
    _data.read('tokens', tokenId, (err, tokenData) => {
        if(!err && tokenData) {
            // Check that the token is for the user and has not expired
            if(tokenData.email == email && tokenData.expires > Date.now()){
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};



// Export the module 
module.exports = _tokens;