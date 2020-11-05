import { local, remote } from "../../src/channel/Channel.js"
import { ChannelSameContext } from "../../src/channel/ChannelSameContext.js"

declare const StartTest : any

StartTest(t => {

    t.it('Same context channel should work', async t => {
        class Server extends ChannelSameContext {

            @remote()
            sum : (arg1 : number, arg2 : number) => Promise<number>

            @local()
            async multiply (arg1 : number, arg2 : number) : Promise<number> {
                return arg1 * arg2
            }
        }

        class Worker extends ChannelSameContext {

            @remote()
            multiply : (arg1 : number, arg2 : number) => Promise<number>

            @local()
            async sum (arg1 : number, arg2 : number) : Promise<number> {
                return arg1 + arg2
            }
        }

        const server    = new Server()
        const worker    = new Worker()

        server.connect(worker)
        worker.connect(server)

        t.is(await worker.sum(1, 1), 2)
        t.is(await worker.multiply(1, 3), 3)

        t.is(await server.sum(1, 1), 2)
        t.is(await server.multiply(1, 3), 3)

        server.disconnect()
        worker.disconnect()

        t.is(await worker.sum(1, 1), 2)
        t.is(await server.multiply(1, 3), 3)

        try {
            t.is(await worker.multiply(1, 3), 3)

            t.fail("Should not reach here")
        } catch (e) {
            t.like(e + '', "Not connected")
        }
    })


    t.it('Should handle exceptions in remote calls', async t => {
        class Server extends ChannelSameContext {
            @local()
            async multiply (arg1 : number, arg2 : number) : Promise<number> {
                throw new Error("exception")
            }
        }

        class Worker extends ChannelSameContext {
            @remote()
            multiply : (arg1 : number, arg2 : number) => Promise<number>
        }

        const server    = new Server()
        const worker    = new Worker()

        server.connect(worker)
        worker.connect(server)

        try {
            t.is(await worker.multiply(1, 3), 3)

            t.fail("Should not reach here")
        } catch (e) {
            t.like(e + '', "exception")
        }
    })

})


