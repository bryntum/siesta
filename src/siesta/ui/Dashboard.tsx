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
import { TextJSX } from "../../jsx/TextJSX.js"
import { awaitDomInteractive } from "../../util/Helpers.js"
import { buffer } from "../../util/TimeHelpers.js"
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


        collectPersistentState () : DashboardPersistentData {
            return {
                // TODO should use `urlRel`
                currentTestUrl      : this.currentTest?.urlAbs,
                filterValue         : this.filterBox,

                domContainerWidth   : this.domContainerWidthBox.read(),
                projectPlanWidth    : this.projectPlanWidthBox.read()
            }
        }


        applyPersistentState (state : DashboardPersistentData) {
            this.filterBox      = state.filterValue || ''

            state.domContainerWidth && this.domContainerWidthBox.write(state.domContainerWidth)
            state.projectPlanWidth && this.projectPlanWidthBox.write(state.projectPlanWidth)

            if (state.currentTestUrl) {
                this.launcher.projectData.projectPlan.traverse(desc => {
                    if (desc.urlAbs === state.currentTestUrl) {
                        this.currentTest    = desc

                        return false
                    }
                })
            }
        }


        get persistenceKey () : string {
            return `siesta-dashboard-${ this.launcher.projectData.projectPlan.title }`
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
                            class   = "input" type="text" placeholder="Include glob"
                        />
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
            const dispatcher        = this.launcher.dispatcher

            this.launcher.launchContinuously(flattenFilteredTestDescriptor(this.testDescriptorFiltered))
        }


        onFilterInput (e : InputEvent) {
            const filter        = (e.target as HTMLInputElement).value

            this.filterBox      = filter ? filter.replace(/^(\*\*\/)?/, '**/') : ''
        }


        @calculate('testDescriptorFiltered')
        calculateTestDescriptorFiltered () {
            return filterTestDescriptor(this.launcher.projectData.projectPlan, this.filterBox)
        }

    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export type TestDescriptorFiltered = {
    descriptor          : TestDescriptor,
    filteredChildren?   : TestDescriptorFiltered[]
}


export const filterTestDescriptor = (desc : TestDescriptor, glob : string) : TestDescriptorFiltered | undefined => {
    if (desc.isLeaf())
        return !glob || minimatch(desc.urlAbs, glob, { matchBase : true }) ? { descriptor : desc } : undefined
    else {
        const filteredChildren   = desc.childNodes.map(child => filterTestDescriptor(child, glob)).filter(el => Boolean(el))

        return !glob || filteredChildren.length > 0 ? { descriptor : desc, filteredChildren } : undefined
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
