import { it } from "../../index.js"
import { MediaSameContext } from "../../src/rpc/media/MediaSameContext.js"
import { local, Port, remote } from "../../src/rpc/port/Port.js"

it('Same context channel should work', async t => {
    class Server extends Port {
        @remote()
        sum : (arg1 : number, arg2 : number) => Promise<number>

        @local()
        async multiply (arg1 : number, arg2 : number) : Promise<number> {
            return arg1 * arg2
        }
    }

    class Worker extends Port {
        @remote()
        multiply : (arg1 : number, arg2 : number) => Promise<number>

        @local()
        async sum (arg1 : number, arg2 : number) : Promise<number> {
            return arg1 + arg2
        }
    }

    const server            = new Server()
    const worker            = new Worker()

    const serverMedia       = server.media = new MediaSameContext()
    const workerMedia       = worker.media = new MediaSameContext()

    serverMedia.targetMedia = workerMedia
    workerMedia.targetMedia = serverMedia

    await server.connect()
    await worker.connect()

    t.is(await worker.sum(1, 1), 2)
    t.is(await worker.multiply(1, 3), 3)

    t.is(await server.sum(1, 1), 2)
    t.is(await server.multiply(1, 3), 3)

    await server.disconnect()
    await worker.disconnect()

    t.is(await worker.sum(1, 1), 2)
    t.is(await server.multiply(1, 3), 3)

    try {
        t.is(await worker.multiply(1, 3), 3)

        t.fail("Should not reach here")
    } catch (e) {
        t.like(e + '', "Not connected")
    }
})


it('Should handle exceptions in remote calls', async t => {
    class Server extends Port {
        @local()
        async multiply (arg1 : number, arg2 : number) : Promise<number> {
            throw new Error("exception")
        }
    }

    class Worker extends Port {
        @remote()
        multiply : (arg1 : number, arg2 : number) => Promise<number>
    }

    const server            = new Server()
    const worker            = new Worker()

    const serverMedia       = server.media = new MediaSameContext()
    const workerMedia       = worker.media = new MediaSameContext()

    serverMedia.targetMedia = workerMedia
    workerMedia.targetMedia = serverMedia

    await server.connect()
    await worker.connect()

    try {
        t.is(await worker.multiply(1, 3), 3)

        t.fail("Should not reach here")
    } catch (e) {
        // `Error` in Firefox, `exception` elsewhere
        t.like(e + '', /exception|Error/)
    }
})
