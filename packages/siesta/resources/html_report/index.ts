import { parse } from "typescript-serializable-mixin/index.js"
import { Environment } from "../../src/siesta/common/Environment.js"
import { HTMLReportData, TestLaunchResult } from "../../src/siesta/launcher/TestLaunchResult.js"
import { ProjectSerializableData } from "../../src/siesta/project/ProjectDescriptor.js"
import { TestDescriptor } from "../../src/siesta/test/TestDescriptor.js"
import { TestDescriptorBrowser } from "../../src/siesta/test/TestDescriptorBrowser.js"
import { TestDescriptorDeno } from "../../src/siesta/test/TestDescriptorDeno.js"
import { TestDescriptorNodejs } from "../../src/siesta/test/TestDescriptorNodejs.js"
import { expanderMappingVisitSymbol, TestNodeResultReactive } from "../../src/siesta/test/TestResultReactive.js"
import { HTMLReportDashboard } from "../../src/siesta/ui/html_report/HTMLReportDashboard.js"

TestDescriptor
TestDescriptorNodejs
TestDescriptorBrowser
TestDescriptorDeno
TestLaunchResult
TestNodeResultReactive
ProjectSerializableData
Environment

const fetchData = async () => {
    // make the url expression, so that bundler does not try to bundle it
    const text              = await (await fetch(new URL("" + "../../report_data.json", import.meta.url).href)).text()
    const data              = parse(text, { mappingVisitSymbol : expanderMappingVisitSymbol }) as HTMLReportData

    const dashboard                 = HTMLReportDashboard.new()

    dashboard.projectData           = data.projectData
    dashboard.launcherDescriptor    = data.launcherDescriptor
    dashboard.launchResult          = data.launchResult

    await dashboard.start()
}

fetchData()
