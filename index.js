/**
 * Primary File fo API
 */

// The Assignment (Scenario):

// You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager:

// [x] 1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.

// [x] 2. Users can log in and log out by creating or destroying a token.

// [x] 3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).

// [ ] 4. A logged-in user should be able to fill a shopping cart with menu items

// [ ] 5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards

// [ ] 6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account


// Dependencies 
const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const { users, tokens, menus, carts, notFound } = require('./lib/handlers');
 
// Intantiate the HTTP server
var httpServer = http.createServer((req, res) => {
    
    // Get the Url and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the pathname
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;
    
    // Get the method
    const method = req.method.toLowerCase();

    // Get the headers
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to. If path does not exist route to not found
        const chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : notFound;

        // Construct the data object to be sent to the handler
        const data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer ? JSON.parse(buffer) : {}
        };

        // Route the request to the the appropiate handler
        chooseHandler(data, (statusCode, payload) => {
            // Use the status code called back by the user or default to 200
            statusCode = typeof(statusCode) =='number' ? statusCode : 200;
            // Use the payload called back by the handler of default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload to a string
            const payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning this response :', statusCode, payloadString);
        });
    });
 });

// Start the HTTP Server
httpServer.listen(config.httpPort, () => {
    console.log(`The Server is running on port ${config.httpPort}`)
});

 // Define the request router
 const router = {
     'users' : users,
     'tokens' : tokens,
     'menus' : menus,
     'carts' : carts
 };