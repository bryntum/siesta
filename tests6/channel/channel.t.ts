// import { it } from "../../main.js"
// import { local, remote } from "../../src/port/Port.js"
// import { PortSameContext } from "../../src/port/PortSameContext.js"
//
// it('Same context channel should work', async t => {
//     class Server extends PortSameContext {
//
//         @remote()
//         sum : (arg1 : number, arg2 : number) => Promise<number>
//
//         @local()
//         async multiply (arg1 : number, arg2 : number) : Promise<number> {
//             return arg1 * arg2
//         }
//     }
//
//     class Worker extends PortSameContext {
//
//         @remote()
//         multiply : (arg1 : number, arg2 : number) => Promise<number>
//
//         @local()
//         async sum (arg1 : number, arg2 : number) : Promise<number> {
//             return arg1 + arg2
//         }
//     }
//
//     const server    = new Server()
//     const worker    = new Worker()
//
//     server.media    = worker
//     worker.media    = server
//
//     await server.connect()
//     await worker.connect()
//
//     t.is(await worker.sum(1, 1), 2)
//     t.is(await worker.multiply(1, 3), 3)
//
//     t.is(await server.sum(1, 1), 2)
//     t.is(await server.multiply(1, 3), 3)
//
//     await server.disconnect()
//     await worker.disconnect()
//
//     t.is(await worker.sum(1, 1), 2)
//     t.is(await server.multiply(1, 3), 3)
//
//     try {
//         t.is(await worker.multiply(1, 3), 3)
//
//         t.fail("Should not reach here")
//     } catch (e) {
//         t.like(e + '', "Not connected")
//     }
// })
//
//
// it('Should handle exceptions in remote calls', async t => {
//     class Server extends PortSameContext {
//         @local()
//         async multiply (arg1 : number, arg2 : number) : Promise<number> {
//             throw new Error("exception")
//         }
//     }
//
//     class Worker extends PortSameContext {
//         @remote()
//         multiply : (arg1 : number, arg2 : number) => Promise<number>
//     }
//
//     const server    = new Server()
//     const worker    = new Worker()
//
//     server.media    = worker
//     worker.media    = server
//
//     await server.connect()
//     await worker.connect()
//
//     try {
//         t.is(await worker.multiply(1, 3), 3)
//
//         t.fail("Should not reach here")
//     } catch (e) {
//         t.like(e + '', "exception")
//     }
// })
