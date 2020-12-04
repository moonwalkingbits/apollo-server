/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare type Logger = import("@moonwalkingbits/apollo-log").Logger;
declare type NetServer = import("net").Server;
declare type NetServerFactory = () => NetServer;
declare type RequestFactoryInterface = import("@moonwalkingbits/apollo-http").RequestFactoryInterface;
declare type RequestInterface = import("@moonwalkingbits/apollo-http").RequestInterface;
declare type ConfigurationInterface = import("@moonwalkingbits/apollo-configuration").ConfigurationInterface;
declare type LoggerInterface = import("@moonwalkingbits/apollo-log").LoggerInterface;
declare type ResponseInterface = import("@moonwalkingbits/apollo-http").ResponseInterface;
declare type Constructor<T = any> = new (...parameters: Array<any>) => T;

/**
 * Represents a startup class.
 */
declare interface StartupInterface {
    /**
     * Configure given parameters.
     *
     * @param ...parameters Parameters to configure.
     * @return Promise resolving when the method is done.
     */
    configure(...parameters: Array<any>): Promise<void>;
}

/**
 * Represents a server request handler.
 */
declare interface RequestHandlerInterface {
    /**
     * Handle incomming request and produce a server response.
     *
     * @param request Incomming request.
     * @return Server response.
     */
    handle(request: RequestInterface): Promise<ResponseInterface>;
}

/**
 * Represents a server request middleware.
 */
declare interface MiddlewareInterface {
    /**
     * Handle incomming request and produce a server response.
     *
     * @param request Incomming request.
     * @param requestHandler Next request handler in queue.
     * @return Server response.
     */
    process(request: RequestInterface, requestHandler: RequestHandlerInterface): Promise<ResponseInterface>;
}

/**
 * Middleware based request handler.
 */
declare class RequestHandler implements RequestHandlerInterface {
    /**
     * Create a new request handler instance.
     */
    public constructor();

    /**
     * Add given middleware to queue.
     *
     * @param middleware Server request middleware.
     * @return Same instance for method chaining.
     */
    public addMiddleware(middleware: MiddlewareInterface): this;

    /**
     * Handle incomming request and produce a server response.
     *
     * @param request Incomming request.
     * @return Server response.
     */
    public handle(request: RequestInterface): Promise<ResponseInterface>;
}

/**
 * A server instance serves as an abstraction around a node server.
 */
declare interface ServerInterface {
    /**
     * Start the server.
     *
     * @param port Port to bind the server to.
     */
    start(port?: number): void;

    /**
     * Stop the server.
     */
    stop(): void;
}

/**
 * A server instance serves as an abstraction around a node server.
 */
declare class Server implements ServerInterface {
    /**
     * Create a new server instance.
     *
     * @param nodeServer Node server instance.
     * @param requestHandler Request handler implementation.
     * @param requestFactory Request factory instance.
     * @param logger Application logger.
     */
    public constructor(
        nodeServer: NetServer,
        requestHandler: RequestHandlerInterface,
        requestFactory: RequestFactoryInterface,
        logger: Logger
    );

    /**
     * Start the server.
     *
     * @param port Port to bind the server to.
     */
    public start(port?: number): void;

    /**
     * Stop the server.
     */
    public stop(): void;
}

/**
 * Has the ability to create server instances.
 */
declare interface ServerBuilderInterface {
    /**
     * Build a new server instance.
     *
     * @return Configured server instance.
     */
    build(): Promise<ServerInterface>;

    /**
     * Use given server factory when creating the server.
     *
     * @param serverFactory Node server factory.
     * @return Same instance for method chaining.
     */
    useServerFactory(serverFactory: NetServerFactory): this;

    /**
     * Use given startup class when configuring container.
     *
     * @param constructor Startup class constructor.
     * @return Same instance for method chaining.
     */
    useStartupClass(constructor: Constructor<StartupInterface>): this;

    /**
     * Use application configuration.
     *
     * @param configuration Application configuration.
     * @return Same instance for method chaining.
     */
    useConfiguration(configuration: ConfigurationInterface): this;

    /**
     * Use application logger.
     *
     * @param logger Application logger.
     * @return Same instance for method chaining.
     */
    useLogger(logger: LoggerInterface): this;
}

/**
 * Has the ability to create server instances.
 */
declare class ServerBuilder implements ServerBuilderInterface {
    /**
     * Build a new server instance.
     *
     * @return Configured server instance.
     */
    public build(): Promise<ServerInterface>;

    /**
     * Use given server factory when creating the server.
     *
     * @param serverFactory Node server factory.
     * @return Same instance for method chaining.
     */
    public useServerFactory(serverFactory: NetServerFactory): this;

    /**
     * Use given startup class when configuring container.
     *
     * @param constructor Startup class constructor.
     * @return Same instance for method chaining.
     */
    public useStartupClass(constructor: Constructor<StartupInterface>): this;

    /**
     * Use application configuration.
     *
     * @param configuration Application configuration.
     * @return Same instance for method chaining.
     */
    public useConfiguration(configuration: ConfigurationInterface): this;

    /**
     * Use application logger.
     *
     * @param logger Application logger.
     * @return Same instance for method chaining.
     */
    public useLogger(logger: LoggerInterface): this;
}

export {
    MiddlewareInterface,
    RequestHandler,
    RequestHandlerInterface,
    Server,
    ServerBuilder,
    ServerBuilderInterface,
    ServerInterface,
    StartupInterface
};
