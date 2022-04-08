/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import RequestHandler from "./RequestHandler.js";
import Server from "./Server.js";
import { ConfigurationBuilder } from "@moonwalkingbits/apollo-configuration";
import { Container } from "@moonwalkingbits/apollo-container";
import { LoggerBuilder } from "@moonwalkingbits/apollo-log";
import { RequestFactory, ResponseFactory, StreamFactory, UrlFactory } from "@moonwalkingbits/apollo-http";

/**
 * Node server factory.
 *
 * @callback NodeServerFactory
 * @return {net.Server}
 */

/**
 * Represents a server request handler.
 *
 * @interface RequestHandlerInterface
 */

/**
 * Handle incoming request and produce a server response.
 *
 * @function
 * @name RequestHandlerInterface#handle
 * @param {@moonwalkingbits/apollo-http.Request} request Incoming request.
 * @return {Promise.<@moonwalkingbits/apollo-http.Response>} Server response.
 */

/**
 * Has the ability to create server instances.
 */
class ServerBuilder {
    /**
     * Create a new server builder instance.
     *
     * @public
     */
    constructor() {
        /**
         * Node server factory.
         *
         * @private
         * @type {NodeServerFactory}
         */
        this.serverFactory;

        /**
         * Startup class constructor.
         *
         * @private
         * @type {Function}
         */
        this.startupClass;

        /**
         * Application configuration.
         *
         * @private
         * @type {@moonwalkingbits/apollo-configuration.Configuration}
         */
        this.configuration;

        /**
         * Application logger.
         *
         * @private
         * @type {@moonwalkingbits/apollo-log.Logger}
         */
        this.logger;
    }

    /**
     * Build a new server instance.
     *
     * @public
     * @async
     * @return {Server} Configured server instance.
     */
    async build() {
        const container = new Container();

        container.bindInstance("container", container);
        container.bindInstance("serverBuilder", this);
        container.bindInstance("requestHandler", this.createRequestHandler());
        container.bindInstance("configuration", await this.createConfiguration());
        container.bindInstance("logger", this.createLogger());

        Object.entries(ServerBuilder.httpFactoryBindings).forEach(([ name, constructor ]) => {
            container.bindConstructor(name, constructor);
        });

        if (this.startupClass) {
            const startupInstance = container.construct(this.startupClass);

            await container.invoke(startupInstance.configure.bind(startupInstance), {}, startupInstance.configure);
        }

        if (!this.serverFactory) {
            throw new Error("No server factory provided");
        }

        const server = container.construct(Server, {
            nodeServer: this.serverFactory()
        });

        container.bindInstance("server", server);

        return server;
    }

    /**
     * Use given server factory when creating the server.
     *
     * @public
     * @param {NodeServerFactory} serverFactory Node server factory.
     * @return {this} Same instance for method chaining.
     */
    useServerFactory(serverFactory) {
        this.serverFactory = serverFactory;

        return this;
    }

    /**
     * Use given startup class when configuring container.
     *
     * @public
     * @param {Function} constructor Startup class constructor.
     * @return {this} Same instance for method chaining.
     */
    useStartupClass(constructor) {
        this.startupClass = constructor;

        return this;
    }

    /**
     * Use application configuration.
     *
     * @public
     * @param {@moonwalkingbits/apollo-configuration.Configuration} configuration Application configuration.
     * @return {this} Same instance for method chaining.
     */
    useConfiguration(configuration) {
        this.configuration = configuration;

        return this;
    }

    /**
     * Use application logger.
     *
     * @public
     * @param {@moonwalkingbits/apollo-log.Logger} logger Application logger.
     * @return {this} Same instance for method chaining.
     */
    useLogger(logger) {
        this.logger = logger;

        return this;
    }

    /**
     * Create application configuration.
     *
     * @private
     * @async
     * @return {@moonwalkingbits/apollo-configuration.Configuration} Application configuration.
     */
    async createConfiguration() {
        return this.configuration ?? await new ConfigurationBuilder().build();
    }

    /**
     * Create application logger.
     *
     * @private
     * @return {@moonwalkingbits/apollo-log.Logger} Application logger.
     */
    createLogger() {
        return this.logger ?? new LoggerBuilder().build();
    }

    /**
     * Create server request handler.
     *
     * @private
     * @return {RequestHandlerInterface} Server request handler.
     */
    createRequestHandler() {
        return new RequestHandler();
    }
}

/**
 * List of HTTP factories to bind to the container.
 *
 * @private
 * @static
 * @constant
 * @type {Object.<string, Function>}
 */
ServerBuilder.httpFactoryBindings = {
    "requestFactory": RequestFactory,
    "responseFactory": ResponseFactory,
    "streamFactory": StreamFactory,
    "urlFactory": UrlFactory
};

export default ServerBuilder;
