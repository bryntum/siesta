import playwright from "playwright"
import ws from "ws"
import { MediaNodeWebSocketParent } from "../src/rpc/media/MediaNodeWebSocketParent.js"
import { ServerNodeWebSocket } from "../src/rpc/server/ServerNodeWebSocket.js"
import { SimulatorPlaywrightServer } from "../src/siesta/simulate/SimulatorPlaywright.js"


const run = async () => {
    const browser           = await playwright.firefox.launch({ headless : false, /*devtools : true, */args : [ '--window-size maximized' ] })

    const wsServer          = new ServerNodeWebSocket()

    const wsPort            = await wsServer.startWebSocketServer()

    const awaitConnection   = new Promise<ws>(resolve => wsServer.onConnectionHook.once((self, socket) => resolve(socket)))

    const page              = await browser.newPage({ viewport : null })

    page.on('console', async msg => {
        for (let i = 0; i < msg.args().length; i++)
            console.log(`${ i }: ${ await msg.args()[ i ].jsonValue() }`)
        }
    )

    page.on('pageerror', e => console.log(e))

    const port              = SimulatorPlaywrightServer.new({ page })
    const media             = MediaNodeWebSocketParent.new()

    port.media              = media

    await page.goto('http://localhost:8000/src/index.html')

    await page.waitForLoadState('load')

    // // @ts-ignore
    // await page.waitForFunction(() => window.connect !== undefined)

    console.log("GOTO DONE")

    await page.evaluate(`window.connect(${ wsPort })`)

    console.log("EVAL DONE")

    media.socket            = await awaitConnection

    port.handshakeType      = 'parent_first'

    await port.connect()

    console.log("CONNECTED")
}

run()
