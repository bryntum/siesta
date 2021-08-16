/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
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
import { awaitDomInteractive } from "../../util/Helpers.js"
import { buffer } from "../../util/TimeHelpers.js"
import { Dispatcher } from "../launcher/Dispatcher.js"
import { Launcher } from "../launcher/Launcher.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { individualCheckInfoForTestResult, TestNodeResultReactive } from "../test/TestResult.js"
import { Splitter } from "./components/Splitter.js"
import { ProjectPlanComponent, TestDescriptorComponent } from "./ProjectPlanComponent.js"
import { RippleEffectManager } from "./RippleEffectManager.js"
import { LaunchInfoComponent } from "./test_result/LaunchInfoComponent.js"
import { TestNodeResultComponent } from "./test_result/TestResult.js"

ChronoGraphJSX

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
export class Dashboard extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class Dashboard extends base {
        launcher            : Launcher                      = undefined

        @field()
        currentTest         : TestDescriptor                = undefined

        @field()
        filterBox           : string                        = undefined

        @field()
        testDescriptorFiltered : TestDescriptorFiltered     = undefined

        domContainerWidthBox    : Box<number>               = Box.new(400)
        projectPlanWidthBox     : Box<number>               = Box.new(300)


        get projectPlan () : TestDescriptor {
            return this.launcher.projectData.projectPlan
        }

        get dispatcher () : Dispatcher {
            return this.launcher.dispatcher
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
                            const info      = this.dispatcher.results.get(item)

                            return [ item.titleIdentifier, { checked : info.checked, expanded : null }  ]
                        } else {
                            const info      = this.dispatcher.resultsGroups.get(item)

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
                        this.dispatcher.results.get(item).checked   = itemInfo.checked
                    } else {
                        const groupInfo     = this.dispatcher.resultsGroups.get(item)

                        groupInfo.checked           = itemInfo.checked
                        groupInfo.expandedState     = itemInfo.expanded
                    }
                }
            })
        }


        get persistenceKey () : string {
            return `siesta-dashboard-${ this.projectPlan.title }`
        }


        retrievePersistentState () : DashboardPersistentData {
            const str           = localStorage.getItem(this.persistenceKey)

            return parse(str)
        }


        savePersistentState () {
            localStorage.setItem(this.persistenceKey, stringify(this.collectPersistentState()))
        }


        bindStatePersistence () {
            const savePersistentState   = buffer(() => this.savePersistentState(), 150);

            [
                this.$.filterBox,
                this.$.currentTest,
                this.domContainerWidthBox,
                this.projectPlanWidthBox
            ].forEach(box => box.commitValueOptimisticHook.on(savePersistentState))
        }


        async start () {
            await awaitDomInteractive()

            const persistentState       = this.retrievePersistentState()

            persistentState && this.applyPersistentState(persistentState)

            this.bindStatePersistence()

            const rippleEffectManager   = RippleEffectManager.new()

            rippleEffectManager.start()

            //------------------
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

            document.body.appendChild(this.el)
        }


        clearFilter () {
            this.filterBox  = ''

            const el        = this.el.querySelector('.filter-input') as HTMLInputElement

            el.value        = ''
        }


        render () : Element {
            const dispatcher        = this.launcher.dispatcher

            return <div
                onmousedown = { e => this.onMouseDown(e) }
                onclick     = { e => this.onClick(e) }
                ondblclick  = { e => this.onDoubleClick(e) }
                class       = 'is-flex is-align-items-stretch' style='height: 100%;'
            >
                <div class="is-flex is-flex-direction-column" style="min-width: 100px" style:width={ () => this.projectPlanWidthBox.read() + 'px' }>
                    <div class='tbar is-flex' style="height: 2.7em">
                        <input
                            value   = { String(this.filterBox).replace(/^\*\*\//, '') }
                            oninput = { buffer((e : InputEvent) => this.onFilterInput(e), 200) }
                            class   = 'filter-input input' type="text" placeholder="Include glob"
                        />
                        <span class="icon ripple is-medium" onclick={ () => this.clearFilter() }>
                            <i class="fas fa-times"></i>
                        </span>
                    </div>

                    {
                        () => <ProjectPlanComponent
                            dispatcher      = { this.launcher.dispatcher }
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

                        const launchInfo            = dispatcher.getTestLaunchInfo(this.currentTest)

                        return <LaunchInfoComponent
                            dispatcher              = { this.launcher.dispatcher }
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
                this.launcher.launchContinuously(desc.leavesAxis())
            }

            // TODO move this to `LaunchInfoComponent`
            const result    = this.getTestResultComponentFromMouseEvent(e)

            if (result) {
                this.launcher.launchContinuouslyWithCheckInfo(this.currentTest, individualCheckInfoForTestResult(result))
            }
        }


        runChecked () {
            const dispatcher        = this.launcher.dispatcher

            const toLaunch          = Array.from(
                flattenFilteredTestDescriptor(this.testDescriptorFiltered)
                    .map(desc => dispatcher.getTestLaunchInfo(desc))
                    .filter(info => info.checked)
                    .map(info => info.descriptor)
            )

            this.launcher.launchContinuously(toLaunch)
        }


        runAll () {
            this.launcher.launchContinuously(flattenFilteredTestDescriptor(this.testDescriptorFiltered))
        }


        onFilterInput (e : InputEvent) {
            const filter        = (e.target as HTMLInputElement).value

            this.filterBox      = filter ? filter.replace(/^(\*\*\/)?/, '**/') : ''
        }


        @calculate('testDescriptorFiltered')
        calculateTestDescriptorFiltered () {
            return filterTestDescriptor(this.projectPlan, this.filterBox, desc => {
                this.dispatcher.resultsGroups.get(desc).expandedState   = 'expanded'
            })
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
