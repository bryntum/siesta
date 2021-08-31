/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { calculate, field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { parse, stringify } from "typescript-serializable-mixin/index.js"
import { siestaPackageRootUrl } from "../../../index.js"
import minimatch from "../../../web_modules/minimatch.js"
import { ChronoGraphJSX, ElementSource } from "../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../chronograph-jsx/Component.js"
import { ComponentElement } from "../../chronograph-jsx/ElementReactivity.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../iterator/Iterator.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { buffer } from "../../util/TimeHelpers.js"
import { awaitDomInteractive } from "../../util_browser/Dom.js"
import { LUID } from "../common/LUID.js"
import { DashboardConnectorClient } from "../launcher/DashboardConnector.js"
import { LauncherDescriptor } from "../launcher/Launcher.js"
import { LauncherDescriptorNodejs } from "../launcher/LauncherDescriptorNodejs.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { ConsoleXmlRenderer } from "../reporter/ConsoleXmlRenderer.js"
import { TestReporterParent } from "../test/port/TestReporter.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { individualCheckInfoForTestResult, SubTestCheckInfo, TestNodeResultReactive } from "../test/TestResult.js"
import { Splitter } from "./components/Splitter.js"
import { ProjectPlanComponent, TestDescriptorComponent } from "./ProjectPlanComponent.js"
import { RippleEffectManager } from "./RippleEffectManager.js"
import { LaunchInfoComponent } from "./test_result/LaunchInfoComponent.js"
import { TestOverlay } from "./test_result/TestOverlay.js"
import { TestNodeResultComponent } from "./test_result/TestResult.js"
import { TestGroupLaunchInfo, TestLaunchInfo } from "./TestLaunchInfo.js"

ChronoGraphJSX

TestReporterParent
LauncherDescriptorNodejs

//---------------------------------------------------------------------------------------------------------------------
type DashboardPersistentData = {
    currentTestUrl      : string
    filterValue         : string
    domContainerWidth   : number
    projectPlanWidth    : number

    projectPlanItems    : Map<string, ProjectPlanItemPersistentData>
}

type ProjectPlanItemPersistentData = {
    checked             : boolean
    expanded            : 'collapsed' | 'expanded'
}


//---------------------------------------------------------------------------------------------------------------------
export class DashboardRenderer extends Mixin(
    [ ConsoleXmlRenderer ],
    (base : ClassUnion<typeof ConsoleXmlRenderer>) =>

    class DashboardRenderer extends base {
        dashboard           : Dashboard         = undefined


        getMaxLen () : number {
            return 250
        }


        async setupTheme () {
            this.styles         = (await import(`../reporter/styling/theme_${ this.dashboard.launcherDescriptor.theme }.js`)).styles
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class Dashboard extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class Dashboard extends base {
        @field()
        currentTest                 : TestDescriptor            = undefined

        @field()
        filterBox                   : string                    = undefined

        @field()
        testDescriptorFiltered      : TestDescriptorFiltered    = undefined

        domContainerWidthBox        : Box<number>               = Box.new(400)
        projectPlanWidthBox         : Box<number>               = Box.new(300)

        triggerSavePersistentData   : () => void                = buffer(() => this.savePersistentState(), 150)

        projectData                 : ProjectSerializableData                   = undefined

        launcherDescriptor          : LauncherDescriptorNodejs                  = LauncherDescriptorNodejs.new()

        projectPlanLaunchInfo       : TestGroupLaunchInfo                       = undefined
        resultsGroups               : Map<TestDescriptor, TestGroupLaunchInfo>  = new Map()
        results                     : Map<TestDescriptor, TestLaunchInfo>       = new Map()
        mapping                     : Map<LUID, TestLaunchInfo>                 = new Map()

        renderer                    : DashboardRenderer         = DashboardRenderer.new({ dashboard : this })

        connector                   : DashboardConnectorClient  = DashboardConnectorClient.new({ dashboard : this })


        get projectPlan () : TestDescriptor {
            return this.projectData.projectPlan
        }


        collectPersistentState () : DashboardPersistentData {
            return {
                currentTestUrl      : this.currentTest?.urlAbs,
                filterValue         : this.filterBox,

                domContainerWidth   : this.domContainerWidthBox.read(),
                projectPlanWidth    : this.projectPlanWidthBox.read(),

                projectPlanItems    : CI(this.projectPlan.traverseGen(true))
                    .map(item => {
                        if (item.isLeaf()) {
                            const info      = this.results.get(item)

                            return [ item.titleIdentifier, { checked : info.checked, expanded : null }  ]
                        } else {
                            const info      = this.resultsGroups.get(item)

                            return [ item.titleIdentifier, { checked : info.checked, expanded : info.expandedState }  ]
                        }
                    })
                    .toMap()
            }
        }


        getProjectPlanIndex () : Map<string, TestDescriptor> {
            return CI(this.projectPlan.traverseGen(true))
                .map(item => [ item.titleIdentifier, item ])
                .toMap()
        }


        applyPersistentState (state : DashboardPersistentData) {
            this.filterBox      = state.filterValue || ''

            state.domContainerWidth && this.domContainerWidthBox.write(state.domContainerWidth)
            state.projectPlanWidth && this.projectPlanWidthBox.write(state.projectPlanWidth)

            if (state.currentTestUrl) {
                this.projectPlan.traverse(desc => {
                    if (desc.urlAbs === state.currentTestUrl) {
                        this.currentTest    = desc

                        return false
                    }
                })
            }

            const index         = this.getProjectPlanIndex()

            state.projectPlanItems?.forEach((itemInfo, titleIdentifier) => {
                const item      = index.get(titleIdentifier)

                if (item) {
                    if (item.isLeaf()) {
                        this.results.get(item).checked   = itemInfo.checked
                    } else {
                        const groupInfo     = this.resultsGroups.get(item)

                        groupInfo.checked           = itemInfo.checked
                        groupInfo.expandedState     = itemInfo.expanded
                    }
                }
            })
        }


        get persistenceKey () : string {
            return `siesta-dashboard-${ this.projectPlan.title }`
        }


        loadPersistentState () : DashboardPersistentData {
            const str           = localStorage.getItem(this.persistenceKey)

            return parse(str)
        }


        savePersistentState () {
            localStorage.setItem(this.persistenceKey, stringify(this.collectPersistentState()))
        }


        bindStatePersistence () {
            [
                this.$.filterBox,
                this.$.currentTest,
                this.domContainerWidthBox,
                this.projectPlanWidthBox
            ].forEach(box => box.commitValueOptimisticHook.on(this.triggerSavePersistentData))

            this.el.addEventListener('treecomponent-expand-click', this.triggerSavePersistentData)
        }


        tweakTheHead () {
            const metas         = Array.from(document.head.getElementsByTagName('meta'))

            if (!metas.some(meta => /viewport/i.test(meta.name))) {
                const meta      = document.createElement('meta')

                meta.setAttribute('name', 'viewport')
                meta.setAttribute('content', 'width=device-width, initial-scale=1')

                document.head.appendChild(meta)
            }

            //------------------
            const links         = Array.from(document.head.getElementsByTagName('link'))

            if (!links.some(link => /resources\/styling\/browser\/css\/styling\.css/.test(link.href))) {
                const linkEl        = document.createElement('link')

                linkEl.setAttribute('type', 'text/css')
                linkEl.setAttribute('rel', 'stylesheet')
                linkEl.setAttribute('href', `${ siestaPackageRootUrl }resources/styling/browser/css/styling.css`)

                document.head.appendChild(linkEl)
            }

            if (!links.some(link => /icon/.test(link.rel))) {
                const linkEl        = document.createElement('link')

                linkEl.setAttribute('type', 'image/svg+xml')
                linkEl.setAttribute('rel', 'icon')
                linkEl.setAttribute('href', `${ siestaPackageRootUrl }resources/styling/browser/images/logo_on_transparent.svg`)

                document.head.appendChild(linkEl)
            }

        }


        async setup () {
            this.projectPlanLaunchInfo  = TestGroupLaunchInfo.new({
                descriptor  : this.projectData.projectPlan,
                dashboard   : this
            })

            await Promise.all([ awaitDomInteractive(), this.renderer.setupTheme() ])
        }


        async start () {
            await this.setup()

            //-----------------
            const persistentState       = this.loadPersistentState()

            persistentState && this.applyPersistentState(persistentState)

            this.bindStatePersistence()

            //-----------------
            const rippleEffectManager   = RippleEffectManager.new()

            rippleEffectManager.start()

            //-----------------
            this.tweakTheHead()

            document.body.appendChild(this.el)

            if (this.currentTest) {
                globalGraph.commit()

                const selected  = this.el.querySelector('.is-selected')

                if (selected) selected.scrollIntoView({ block : 'center', inline : 'center' })
            }
        }


        $overlay : TestOverlay          = undefined

        get overlay () : TestOverlay {
            if (this.$overlay !== undefined) return this.$overlay

            const overlay       = TestOverlay.new()

            document.body.appendChild(overlay.el)

            return this.$overlay = overlay
        }


        clearFilter () {
            this.filterBox  = ''

            const el        = this.el.querySelector('.filter-input') as HTMLInputElement

            el.value        = ''
        }


        render () : Element {
            return <div
                onmousedown = { e => this.onMouseDown(e) }
                onclick     = { e => this.onClick(e) }
                ondblclick  = { e => this.onDoubleClick(e) }
                class       = 'is-flex is-align-items-stretch' style='height: 100%;'
            >
                <div class="is-flex is-flex-direction-column" style="min-width: 100px" style:width={ () => this.projectPlanWidthBox.read() + 'px' }>
                    <div class='tbar is-flex' style="height: 2.7em">
                        <input
                            value   = { String(this.filterBox || '').replace(/^\*\*\//, '') }
                            oninput = { buffer((e : InputEvent) => this.onFilterInput(e), 200) }
                            class   = 'filter-input input' type="text" placeholder="Include glob"
                        />
                        <span class="icon ripple is-medium" onclick={ () => this.clearFilter() }>
                            <i class="fas fa-times"></i>
                        </span>
                    </div>

                    {
                        () => <ProjectPlanComponent
                            dashboard       = { this }
                            selectedTestBox = { this.$.currentTest as Box<TestDescriptor> }
                            testDescriptor  = { this.testDescriptorFiltered }
                            style           = "flex: 1"
                        >
                        </ProjectPlanComponent>
                    }

                    <div class='tbar is-flex'>
                        <span class="icon ripple icon-play-checked is-large" onclick={ () => this.runChecked() }>
                            <i class="fas fa-lg fa-play"></i>
                            <span class="icon is-small"><i class="fas fs-sm fa-check"></i></span>
                        </span>
                        <span class="icon ripple icon-play-all is-large" onclick={ () => this.runAll() }>
                            <i class="fas fa-lg fa-play"></i>
                            <span class="icon is-large"><i class="fas fa-lg fa-play"></i></span>
                        </span>
                    </div>
                </div>

                <Splitter mode="horizontal" style="width: 8px" sizeBox={ this.projectPlanWidthBox }></Splitter>

                {
                    () => {
                        if (!this.currentTest) return this.noSelectionContent()

                        const launchInfo            = this.getTestLaunchInfo(this.currentTest)

                        return <LaunchInfoComponent
                            dashboard               = { this }
                            launchInfo              = { launchInfo }
                            domContainerWidthBox    = { this.domContainerWidthBox }
                        ></LaunchInfoComponent>
                    }
                }
            </div>
        }


        noSelectionContent () : ElementSource {
            return <div class="s-dashboard-no-selection is-flex is-justify-content-center is-align-items-center" style="flex: 1; height: 100%">
                <div>
                    <div>No test selected</div>
                    <div>Click a test to select it</div>
                    <div>Double click a test to launch it</div>
                    <div>Double click a folder to launch all tests in it</div>
                </div>
            </div>
        }


        getTestDescriptorComponentFromMouseEvent (e : MouseEvent) : TestDescriptor | undefined {
            const testPlanItemTitle : Element = (e.target as Element).closest('.project-plan-test-title, .project-plan-folder-title')

            if (!testPlanItemTitle) return undefined

            const testPlanItem : ComponentElement<TestDescriptorComponent> = testPlanItemTitle.closest('.project-plan-test, .project-plan-folder')

            return testPlanItem ? testPlanItem.comp.testDescriptor.descriptor : undefined
        }


        getTestResultComponentFromMouseEvent (e : MouseEvent) : TestNodeResultReactive | undefined {
            const testResult : ComponentElement<TestNodeResultComponent> = (e.target as Element).closest('.test-file-comp, .subtest-comp')

            return testResult ? testResult.comp.testNode : undefined
        }


        onMouseDown (e : MouseEvent) {
            const desc      = this.getTestDescriptorComponentFromMouseEvent(e)

            // prevent the text selection on double click only (still works for mouse drag)
            if (desc && e.detail > 1) e.preventDefault()
        }


        onClick (e : MouseEvent) {
            const desc      = this.getTestDescriptorComponentFromMouseEvent(e)

            if (desc && desc.isLeaf()) {
                this.currentTest    = desc
            }
        }


        onDoubleClick (e : MouseEvent) {
            const desc      = this.getTestDescriptorComponentFromMouseEvent(e)

            if (desc) {
                this.launchContinuously(desc.leavesAxis())
            }

            // TODO move this to `LaunchInfoComponent`
            const result    = this.getTestResultComponentFromMouseEvent(e)

            if (result) {
                this.launchContinuouslyWithCheckInfo(this.currentTest, individualCheckInfoForTestResult(result))
            }
        }


        runChecked () {
            const toLaunch          = Array.from(
                flattenFilteredTestDescriptor(this.testDescriptorFiltered)
                    .map(desc => this.getTestLaunchInfo(desc))
                    .filter(info => info.checked)
                    .map(info => info.descriptor)
            )

            this.launchContinuously(toLaunch)
        }


        runAll () {
            this.launchContinuously(flattenFilteredTestDescriptor(this.testDescriptorFiltered))
        }


        async launchContinuously (projectPlanItemsToLaunch : TestDescriptor[]) : Promise<any> {
            projectPlanItemsToLaunch.forEach(desc => this.getTestLaunchInfo(desc).schedulePendingTestLaunch())

            this.connector.launchContinuously(projectPlanItemsToLaunch)
        }


        async launchContinuouslyWithCheckInfo (desc : TestDescriptor, checkInfo : SubTestCheckInfo) {
            this.connector.launchContinuouslyWithCheckInfo(desc, checkInfo)
        }


        onFilterInput (e : InputEvent) {
            const filter        = (e.target as HTMLInputElement).value

            this.filterBox      = filter ? filter.replace(/^(\*\*\/)?/, '**/') : ''
        }


        @calculate('testDescriptorFiltered')
        calculateTestDescriptorFiltered () {
            return filterTestDescriptor(this.projectPlan, this.filterBox, desc => {
                this.resultsGroups.get(desc).expandedState   = 'expanded'
            })
        }


        getTestLaunchInfo (desc : TestDescriptor) : TestLaunchInfo {
            return this.results.get(desc)
        }


        getTestMostRecentResult (desc : TestDescriptor) : TestNodeResultReactive | undefined {
            const launchInfo            = this.getTestLaunchInfo(desc)

            return launchInfo?.mostRecentResult
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export type TestDescriptorFiltered = {
    descriptor          : TestDescriptor,
    filteredChildren?   : TestDescriptorFiltered[]
}


export const filterTestDescriptor = (desc : TestDescriptor, glob : string, expandGroup? : (desc : TestDescriptor) => void) : TestDescriptorFiltered | undefined => {
    if (desc.isLeaf())
        return !glob || minimatch(desc.urlAbs, glob, { matchBase : true }) ? { descriptor : desc } : undefined
    else {
        const filteredChildren   = desc.childNodes.map(child => filterTestDescriptor(child, glob, expandGroup)).filter(el => Boolean(el))

        if (!glob || filteredChildren.length > 0) {
            glob && expandGroup && expandGroup(desc)

            return { descriptor : desc, filteredChildren }
        } else {
            return undefined
        }
    }
}

export const flattenFilteredTestDescriptor = (desc : TestDescriptorFiltered, res : TestDescriptor[] = []) : TestDescriptor[] => {
    if (desc) {
        if (!desc.filteredChildren)
            res.push(desc.descriptor)
        else
            desc.filteredChildren.forEach(child => flattenFilteredTestDescriptor(child, res))
    }

    return res
}
