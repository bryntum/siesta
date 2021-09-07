import { it } from "../../index.js"
import { MediaSameContextScoped } from "../../src/rpc/media/MediaSameContext.js"
import { local, Port, remote } from "../../src/rpc/port/Port.js"
import { isNumber } from "../../src/util/Typeguards.js"

type RecursiveNumberArray       = (number | RecursiveNumberArray)[]

it('Same context channel should work', async t => {
    let received    = undefined

    class Server extends Port {
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

    class Client extends Port {
        @remote()
        sum : (array : RecursiveNumberArray) => Promise<number>
    }

    const client            = new Client()
    const server            = new Server()

    const serverMedia       = server.media = new MediaSameContextScoped()
    const clientMedia       = client.media = new MediaSameContextScoped()

    serverMedia.targetMedia = clientMedia
    clientMedia.targetMedia = serverMedia

    await server.connect()
    await client.connect()

    //--------------------------
    const arr1      = [ 1, 1 ]

    t.is(await client.sum(arr1), 2)

    const received1 = received

    //--------------------------
    const arr2      = [ 1, arr1 ]

    t.is(await client.sum(arr2), 3)

    const received2 = received

    //--------------------------
    t.is(received2[ 1 ], received1)
})

