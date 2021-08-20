import { MediaBrowserWebSocketChild } from "./rpc/media/MediaBrowserWebSocketChild.js"
import { SimulatorPlaywrightClient } from "./siesta/simulate/SimulatorPlaywright.js"
import { awaitDomReady } from "./util/Helpers.js"
import { delay } from "./util/TimeHelpers.js"


const connect = async (wsPort : number) => {
    await awaitDomReady()

    // const div           = document.getElementById('canvas')
    //
    // div.addEventListener('mousemove', () => console.log("MOUSE ENTER"))

    const port          = SimulatorPlaywrightClient.new()
    const media         = MediaBrowserWebSocketChild.new({ wsHost : '127.0.0.1', wsPort : wsPort })

    port.media          = media

    port.handshakeType  = 'parent_first'

    await port.connect()

    await delay(1000)

    await port.mouseMove([ 50, 50 ])

    await delay(500)
}

console.log("FROM CLIENT")

// @ts-ignore
window.connect = port => {
    connect(port)
}

// // @ts-ignore
// console.log('HAS CONNECT: ', window.connect !== undefined)
//
//
// document.addEventListener('load', () => {
//     // @ts-ignore
//     console.log('HAS CONNECT: ', window.connect !== undefined)
// })
