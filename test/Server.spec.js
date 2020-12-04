/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Server } from "@moonwalkingbits/apollo-server";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { expect } = require("chai");
const { spy, stub } = require("sinon");

describe("Server", () => {
    const objectProxy = new Proxy(() => {}, {get: () => objectProxy});

    let nodeServerSpy;
    let server;

    beforeEach(() => {
        nodeServerSpy = spy({
            listen() {},
            close() {},
            on() {}
        });
        server = new Server(
            nodeServerSpy,
            objectProxy,
            objectProxy,
            objectProxy
        );
    });

    describe("#start", () => {
        it("should start node server", () => {
            server.start();

            expect(nodeServerSpy.listen.calledOnce).to.be.true;
        });

        it("should start node server on given port", () => {
            const port = 3000;

            server.start(port);

            expect(nodeServerSpy.listen.getCall(0).args[0]).to.eql(port);
        });
    });

    describe("#stop", () => {
        it("should stop node server", () => {
            server.stop();

            expect(nodeServerSpy.close.calledOnce).to.be.true;
        });
    });
});
