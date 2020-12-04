/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expectAssignable, expectType } from "tsd";

import {
    MiddlewareInterface,
    RequestHandler,
    RequestHandlerInterface,
    Server,
    ServerBuilder,
    ServerBuilderInterface,
    ServerInterface,
    StartupInterface
} from ".";
import {
    RequestInterface,
    ResponseInterface,
    RequestFactory,
    UrlFactory,
    ResponseStatus,
    ResponseFactory,
    ResponseFactoryInterface,
    StreamFactory
} from "@moonwalkingbits/apollo-http";
import { Logger } from "@moonwalkingbits/apollo-log";
import { Configuration } from "@moonwalkingbits/apollo-configuration";
import { createServer } from "http";

class Middleware implements MiddlewareInterface {
    process(request: RequestInterface, requestHandler: RequestHandlerInterface): Promise<ResponseInterface> {
        return requestHandler.handle(request);
    }
}

const requestHandler = new RequestHandler();

expectAssignable<RequestHandlerInterface>(requestHandler);
expectType<RequestHandler>(requestHandler.addMiddleware(new Middleware()));

const server = new Server(
    createServer(),
    requestHandler,
    new RequestFactory(new UrlFactory()),
    new Logger([])
);

expectAssignable<ServerInterface>(server);
server.start();
server.start(3000);
server.stop();

class Startup implements StartupInterface {
    async configure() {}
}

const serverBuilder = new ServerBuilder();
expectAssignable<ServerBuilderInterface>(serverBuilder);
expectType<ServerBuilder>(serverBuilder.useServerFactory(createServer));
expectType<ServerBuilder>(serverBuilder.useStartupClass(Startup));
expectType<ServerBuilder>(serverBuilder.useConfiguration(new Configuration()));
expectType<ServerBuilder>(serverBuilder.useLogger(new Logger([])));
expectType<Server>(await serverBuilder.build());
