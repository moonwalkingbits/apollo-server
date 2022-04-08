/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Represents a server request middleware.
 *
 * @interface MiddlewareInterface
 */

/**
 * Handle incoming request and produce a server response.
 *
 * @function
 * @name MiddlewareInterface#process
 * @param {@moonwalkingbits/apollo-http.Request} request Incoming request.
 * @param {RequestHandlerInterface} requestHandler Next request handler in queue.
 * @return {Promise.<@moonwalkingbits/apollo-http.Response>} Server response.
 */

/**
 * Middleware based request handler.
 *
 * @implements {RequestHandlerInterface}
 */
class RequestHandler {
    /**
     * Create a new request handler instance.
     *
     * @public
     */
    constructor() {
        /**
         * List of middleware to process incoming request.
         *
         * @private
         * @type {Array.<MiddlewareInterface>}
         */
        this.middleware = [];
    }

    /**
     * Add given middleware to queue.
     *
     * @public
     * @param {MiddlewareInterface} middleware Server request middleware.
     * @return {this} Same instance for method chaining.
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);

        return this;
    }

    /**
     * Handle the incoming server request.
     *
     * @public
     * @param {@moonwalkingbits/apollo-http.Request} request Incoming server request.
     * @return {Promise.<@moonwalkingbits/apollo-http.Response>} Server response.
     */
    handle(request) {
        return this.handleRequest(request, this.middleware.slice());
    }

    /**
     * Process given request using middleware.
     *
     * @private
     * @param {@moonwalkingbits/apollo-http.Request} request Incoming server request.
     * @param {Array.<MiddlewareInterface>} middleware Middleware queue.
     * @return {Promise.<@moonwalkingbits/apollo-http.Response>} Server response.
     */
    async handleRequest(request, middleware) {
        if (middleware.length === 0) {
            throw new Error("No middleware available to process request");
        }

        return await middleware.shift().process(
            request,
            this.createRequestHandler(request => this.handleRequest(request, middleware))
        );
    }

    /**
     * Create a proxy object for the given handler function.
     *
     * @private
     * @param {Function} handlerFunction Handler function to wrap.
     * @return {Proxy} Proxy object for handler function.
     */
    createRequestHandler(handlerFunction) {
        return new Proxy(handlerFunction, {get: target => target});
    }
}

export default RequestHandler;
