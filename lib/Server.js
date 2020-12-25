/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Server as HttpsServer } from "https";

/**
 * A server instance serves as an abstraction around a node server.
 */
class Server {
    /**
     * Create a new server instance.
     *
     * @public
     * @param {net.Server} nodeServer Node server instance.
     * @param {RequestHandlerInterface} requestHandler Request handler implementation.
     * @param {@moonwalkingbits/apollo-http.RequestFactory} requestFactory Request factory instance.
     * @param {@moonwalkingbits/apollo-log.Logger} logger Application logger.
     */
    constructor(nodeServer, requestHandler, requestFactory, logger) {
        /**
         * Node server instance.
         *
         * @private
         * @type {net.Server}
         */
        this.nodeServer = nodeServer;

        /**
         * Request handler implementation.
         *
         * @private
         * @type {RequestHandlerInterface}
         */
        this.requestHandler = requestHandler;

        /**
         * Request factory instance.
         *
         * @private
         * @type {@moonwalkingbits/apollo-http.RequestFactory} requestFactory Request factory instance.
         */
        this.requestFactory = requestFactory;

        /**
         * Application logger.
         *
         * @private
         * @type {@moonwalkingbits/apollo-log.Logger} logger Application logger.
         */
        this.logger = logger;

         /**
          * URL scheme used by server messages.
          *
          * @private
          * @type {string}
          */
        this.urlScheme = this.nodeServer instanceof HttpsServer ? "https" : "http";

        this.nodeServer.on("listening", () => {
            this.logger.info("server is listening on port {port}", this.nodeServer.address());
        });
        this.nodeServer.on("close", () => {
            this.logger.info("server is shutting down");
        });
        this.nodeServer.on("request", this.handleRequest.bind(this));
    }

    /**
     * Start the server.
     *
     * @public
     * @param {?number} port Port to bind the server to.
     */
    start(port) {
        this.nodeServer.listen(port);
    }

    /**
     * Stop the server.
     *
     * @public
     */
    stop() {
        this.nodeServer.close();
    }

    /**
     * Handle the node request event and send response.
     *
     * @private
     * @async
     * @param {http.IncommingMessage} req Incomming request.
     * @param {http.ServerResponse} res Server response.
     */
    async handleRequest(req, res) {
        let request = this.requestFactory.createRequest(
            req.method,
            `${this.urlScheme}://${req.headers.host}${req.url}`
        ).withBody(req);

        for (let i = 0; i < req.rawHeaders.length; i += 2) {
            request = request.withHeader(req.rawHeaders[i], req.rawHeaders[i + 1]);
        }

        const response = await this.requestHandler.handle(request);

        response.body.pipe(res);
        res.writeHead(
            response.statusCode,
            response.reasonPhrase,
            Object.entries(response.headers).reduce((headers, [name, values]) => ({
                ...headers,
                [name]: values.join(",")
            }), {})
        );
    }
}

export default Server;
