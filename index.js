/**
 * Primary File fo API
 */

 // Dependencies 
 const http = require('http');
 const url = require('url');
 const { StringDecoder } = require('string_decoder');
 const config = require('./config');
 

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
    var decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to. If handler does not exist route to not found
        const chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to be sent to the handler
        const data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
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

 // Define the handlers
 let handlers = {};

 // hello handler
 handlers.users = (data, callback) => {
     callback(200, {'message' : 'Hello World'})
 };

 // Not Found handler
 handlers.notFound = (data, callback) => {
    callback(404, {'Error' : 'This page does not exist'});
 };


 // Define the request router
 const router = {
     'users' : handlers.users 
 };