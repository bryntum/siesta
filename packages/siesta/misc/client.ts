import { MediaBrowserWebSocketChild } from "../src/rpc/media/MediaBrowserWebSocketChild.js"
import { SimulatorPlaywrightClient } from "../src/siesta/simulate/SimulatorPlaywright.js"
import { delay } from "../src/util/TimeHelpers.js"
import { awaitDomReady } from "../src/util_browser/Dom.js"


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

    await port.simulateMouseMove([ 50, 50 ])

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
