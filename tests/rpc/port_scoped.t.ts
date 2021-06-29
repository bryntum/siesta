import { it } from "../../index.js"
import { MediaSameContextScoped } from "../../src/rpc/media/MediaSameContext.js"
import { local, Port, remote } from "../../src/rpc/port/Port.js"
import { isNumber } from "../../src/util/Typeguards.js"

type RecursiveNumberArray       = (number | RecursiveNumberArray)[]

it('Same context channel should work', async t => {
    class Server extends Port {
        @remote()
        sum : (array : RecursiveNumberArray) => Promise<number>
    }

    let received    = undefined

    class Worker extends Port {
        @local()
        async sum (array : RecursiveNumberArray) : Promise<number> {
            received        = array

            return this.doSum(array)
        }

        doSum (array : RecursiveNumberArray) : number {
            let sum         = 0

            array.forEach(el => {
                if (isNumber(el))
                    sum += el
                else
                    sum += this.doSum(el)
            })

            return sum
        }
    }

    const server            = new Server()
    const worker            = new Worker()

    const serverMedia       = server.media = new MediaSameContextScoped()
    const workerMedia       = worker.media = new MediaSameContextScoped()

    serverMedia.targetMedia = workerMedia
    workerMedia.targetMedia = serverMedia

    await server.connect()
    await worker.connect()

    //--------------------------
    const arr1      = [ 1, 1 ]

    t.is(await worker.sum(arr1), 2)

    const received1 = received

    //--------------------------
    const arr2      = [ 1, arr1 ]

    t.is(await worker.sum(arr2), 3)

    const received2 = received

    //--------------------------
    t.is(received2[ 1 ], received1)
})

