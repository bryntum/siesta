import { MediaBrowserWebSocketChild } from "../../src/rpc/media/MediaBrowserWebSocketChild.js"
import { Dashboard } from "../../src/siesta/ui/Dashboard.js"
import { awaitDomReady } from "../../src/util/Helpers.js"


const connect = async (wsPort : number) => {
    await awaitDomReady()

    const port          = Dashboard.new()

    // TODO move this inside the dashboard itself
    const media         = MediaBrowserWebSocketChild.new({ wsHost : '127.0.0.1', wsPort : wsPort })

    port.media          = media

    port.handshakeType  = 'parent_first'

    await port.connect()
}

connect(Number(new URL(location.href).searchParams.get('port')))
