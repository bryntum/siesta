import { MediaBrowserWebSocketChild } from "../../src/rpc/media/MediaBrowserWebSocketChild.js"
import { Dashboard } from "../../src/siesta/ui/Dashboard.js"


// TODO move this inside the dashboard itself ?
const connect = async (wsPort : number) => {
    const dashboard     = Dashboard.new()

    const port          = dashboard.connector

    const media         = MediaBrowserWebSocketChild.new({ wsHost : '127.0.0.1', wsPort : wsPort })

    port.media          = media

    port.handshakeType  = 'parent_first'

    await port.connect()
}

connect(Number(new URL(location.href).searchParams.get('port')))
