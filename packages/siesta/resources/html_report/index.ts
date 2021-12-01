import { parse } from "typescript-serializable-mixin/index.js"
import { MediaBrowserWebSocketChild } from "../../src/rpc/media/MediaBrowserWebSocketChild.js"
import { Environment } from "../../src/siesta/common/Environment.js"
import { HTMLReportData, TestLaunchResult } from "../../src/siesta/launcher/TestLaunchResult.js"
import { ProjectSerializableData } from "../../src/siesta/project/ProjectDescriptor.js"
import { TestDescriptor } from "../../src/siesta/test/TestDescriptor.js"
import { TestDescriptorBrowser } from "../../src/siesta/test/TestDescriptorBrowser.js"
import { TestDescriptorDeno } from "../../src/siesta/test/TestDescriptorDeno.js"
import { TestDescriptorNodejs } from "../../src/siesta/test/TestDescriptorNodejs.js"
import { expanderMappingVisitSymbol, TestNodeResultReactive } from "../../src/siesta/test/TestResultReactive.js"
import { Dashboard } from "../../src/siesta/ui/Dashboard.js"

TestDescriptor
TestDescriptorNodejs
TestDescriptorBrowser
TestDescriptorDeno
TestLaunchResult
TestNodeResultReactive
ProjectSerializableData
Environment

const fetchData = async () => {
    const text              = await (await fetch(new URL("./report_data.json", import.meta.url).href)).text()
    const data              = parse(text, { mappingVisitSymbol : expanderMappingVisitSymbol }) as HTMLReportData

    const dashboard                 = Dashboard.new()

    dashboard.projectData           = data.projectData
    dashboard.launcherDescriptor    = data.launcherDescriptor

    await dashboard.start()
}

fetchData()


//
//
//
// const connect = async (wsPort : number) => {
//     const dashboard     = Dashboard.new()
//
//     // TODO move this inside the dashboard itself ?
//     const port          = dashboard.connector
//
//     const media         = MediaBrowserWebSocketChild.new({ wsHost : '127.0.0.1', wsPort : wsPort })
//
//     port.media          = media
//
//     port.handshakeType  = 'parent_first'
//
//     await port.connect()
// }
//
// connect(Number(new URL(location.href).searchParams.get('port')))
