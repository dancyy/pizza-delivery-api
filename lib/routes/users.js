/**
 * Handle users requests
 */

// @TODO: Add user_id to user's object
// Dependencies
const _data = require('../data');
const { hash } = require('../helpers');
const { verifyToken } = require('./tokens');

// Container for the users submethods 
let _users = {};

// Users - post
// Required data: firstName, lastName, email address, and street address.
_users.post = (data, callback) => {
    // Check that all required fields are filled out
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? hash(data.payload.password.trim()) : false;
    const streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;
    const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && email && password && streetAddress && tosAgreement) {
        // Make sure user does not already exist
        _data.read('users', email, (err, userData) => {
            // if user does not exist
            if (err) {
                // Create the user object
                const userObject = { firstName, lastName, email, password, streetAddress, tosAgreement };

                // Store the user
                _data.create('users', email, userObject, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error': 'Could not create the new user' });
                    }
                });
            } else {
                // User alread exists
                callback(400, { 'Error': 'A user with that email already exists' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Users - get
// Required data:  email address.
_users.get = (data, callback) => {
    // Check that all required fields are filled out
    const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;

    // Get the token from the header
    const token = typeof(data.headers.token) == 'string' ? data.headers.token.trim() : false;
    
    if (email) {
        // Verify the token
        verifyToken(token, email, (tokenIsValid) => {
            if(tokenIsValid) {
                // Look up the user
                _data.read('users', email, (err, userData) => {
                    if (!err && userData) {
                        delete userData.password;
                        callback(200, userData)
                    } else {
                        callback(404, { 'Error': 'User does not exist' });
                    }
                });
            } else {
                callback(403, { "Error": "Missing required token in header, or token is invalid." });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Users - put
// Required data: email address
_users.put = (data, callback) => {
    // Check that all required fields are filled out
    const email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

    // Optional fields
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const newEmail = typeof (data.payload.newEmail) == 'string' && data.payload.newEmail.trim().length > 0 ? data.payload.newEmail.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? hash(data.payload.password.trim()) : false;
    const streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;

    // Get the token from the header
    const token = typeof (data.headers.token) == 'string' ? data.headers.token.trim() : false;

    if (email) {
        if (firstName || lastName || password || streetAddress || newEmail) {
            verifyToken(token, email, (tokenIsValid) => {
                if(tokenIsValid) {
                    // Look up the user
                    _data.read('users', email, (err, userData) => {
                        if (!err && userData) {
                            // Update the user
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (newEmail) {
                                userData.email = newEmail;
                            }
                            if (password) {
                                userData.password = password;
                            }
                            if (streetAddress) {
                                userData.streetAddress = streetAddress;
                            }
                            // Store the updated userData
                            _data.update('users', email, userData, (err) => {
                                if (!err) {
                                    if (newEmail) {
                                        // Rename the file
                                        _data.rename('users', email, newEmail, (err) => {
                                            if (!err) {
                                                callback(200);
                                            } else {
                                                callback('Could not rename');
                                            }
                                        });
                                    } else {
                                        callback(200);
                                    }
                                } else {
                                    callback(500, { 'Error': 'Could not update the user' });
                                }
                            });
                        } else {
                            callback(404, { 'Error': 'User does not exist' });
                        }
                    });
                } else {
                    callback(403, { "Error": "Missing required token in header, or token is invalid." });
                }
            });
        } else {
            callback(400, { 'Error': 'Missing field(s) to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Users - delete
// Required data:  email address.
_users.delete = (data, callback) => {
    // Check that all required fields are filled out
    const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;

    // Get the token from the header
    const token = typeof (data.headers.token) == 'string' ? data.headers.token.trim() : false;

    if (email) {
        verifyToken(token, email, (tokenIsValid) => {
            if(tokenIsValid) {
                // Look up the user
                _data.read('users', email, (err, userData) => {
                    if (!err && userData) {
                        // Delete the token
                        _data.delete('tokens', token, (err) => {
                            if(!err) {
                                // Delete the user
                                _data.delete('users', email, (err) => {
                                    if (!err) {
                                        callback(200, { 'Success': 'User successfully deleted' });
                                    } else {
                                        callback(500, { 'Error': 'Could not delete the specified user' });
                                    }
                                });
                            } else {
                                callback(500, { 'Error': 'Error while deleting user token' });
                            }
                        });
                    } else {
                        callback(404, { 'Error': 'User does not exist' });
                    }
                });
            } else {
                callback(403, { "Error": "Missing required token in header, or token is invalid." });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Export the module
module.exports = _users;