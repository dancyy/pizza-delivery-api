/**
 * Handle menu requests
 */

// Dependencies
const _data = require('../data');
const { verifyToken } = require('./tokens');

// Container for the users submethods 
let _menus = {};

// Menus - get
// Required data: menu, email
_menus.get = (data, callback) => {
    // Check that all required fields are filled out
    const menu = typeof (data.queryStringObject.menu) == 'string' && data.queryStringObject.menu.trim().length > 0 ? data.queryStringObject.menu.trim() : false;
    const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;

    // Get the token from the header
    const token = typeof (data.headers.token) == 'string' ? data.headers.token.trim() : false;

    if (menu && email) {
        // Verify the token
        verifyToken(token, email, (tokenIsValid) => {
            if(tokenIsValid) {
                // Look up the token by id
                _data.read('menus', menu, (err, menuData) => {
                    if (!err && menuData) {
                        callback(200, menuData);
                    } else {
                        callback(404, { 'Error': 'Menu does not exist' });
                    }
                });
            } else {
                callback(403, {'Error' : 'Token is missing or invalid'});
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fields or they were invalid' });
    }
};

// Export the module
module.exports = _menus
