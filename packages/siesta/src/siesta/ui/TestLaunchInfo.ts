import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { calculate, Entity, field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../iterator/Iterator.js"
import { ContextBrowserIframe } from "../context/ContextBrowserIframe.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { Exception, TestNodeResultReactive } from "../test/TestResult.js"
import { Dashboard } from "./Dashboard.js"

//---------------------------------------------------------------------------------------------------------------------
export type LaunchState =
    | 'noinfo'          // no previous/future launches
    | 'pending'         // has future launch scheduled
    | 'started'         // launch started on launcher side
    | 'running'         // first result from test side received
    | 'completed'       // launch completed

export type TestViewState           = 'noinfo' | 'pending' | 'started' | 'running' | 'exception' | 'failed' | 'passed'

export type TestGroupViewState      = 'noinfo' | 'pending' | 'running' | 'failed' | 'passed'


//---------------------------------------------------------------------------------------------------------------------
export class TestLaunchInfo extends Mixin(
    [ Entity, Base ],
    (base : ClassUnion<typeof Entity, typeof Base>) =>

    class TestLaunchInfo extends base {
        dashboard           : Dashboard                 = undefined

        descriptor          : TestDescriptor            = undefined

        // the only possible type of context to be here is `ContextBrowserIframe`
        // it indicates the iframe created by the dashboard
        @field()
        context             : ContextBrowserIframe      = undefined

        @field()
        mostRecentResult    : TestNodeResultReactive    = undefined

        currentTestNodeResult : TestNodeResultReactive  = undefined

        @field()
        viewState           : TestViewState

        @field()
        launchState         : LaunchState               = 'noinfo'

        @field()
        testSources         : string[]                  = undefined

        @field()
        checked             : boolean                   = false


        initialize (props? : Partial<TestLaunchInfo>) {
            super.initialize(props)

            this.enterGraph(globalGraph as Replica)

            const descriptor        = this.descriptor

            this.dashboard.results.set(descriptor, this)
            this.dashboard.mapping.set(descriptor.guid, this)
        }


        get parentInfo () : TestGroupLaunchInfo {
            return this.dashboard.resultsGroups.get(this.descriptor.parentNode)
        }


        toggleChecked () {
            this.setChecked(!this.checked)
        }


        setChecked (value : boolean) {
            this.checked = value

            if (!value) this.parentInfo.uncheckParents()
        }


        async schedulePendingTestLaunch () {
            this.launchState        = 'pending'

            try {
                // do not should possibly outdated sources
                this.testSources    = undefined

                // should always fetch the fresh test sources, might change anytime
                this.testSources    = await this.dashboard.connector.fetchSources(this.descriptor.urlAbs)
            } catch (e) {
            }
        }


        @calculate('viewState')
        calculateViewState () : TestViewState {
            let result : TestViewState      = 'noinfo'

            switch (this.launchState) {
                case 'noinfo':
                case 'pending':
                case 'started':
                case 'running':
                    return this.launchState
                case 'completed':
                    if (CI(this.mostRecentResult.eachResultOfClassDeep(Exception)).size > 0) return 'exception'

                    return this.mostRecentResult.passed ? 'passed' : 'failed'
            }

            return result
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestGroupLaunchInfo extends Mixin(
    [ Entity, Base ],
    (base : ClassUnion<typeof Entity, typeof Base>) =>

    class TestGroupLaunchInfo extends base {
        dashboard           : Dashboard                 = undefined

        descriptor          : TestDescriptor            = undefined

        items               : (TestGroupLaunchInfo | TestLaunchInfo)[]      = []

        @field()
        viewState           : TestGroupViewState

        @field()
        checked             : boolean                   = false

        @field()
        expandedState       : 'collapsed' | 'expanded'  = null


        initialize (props? : Partial<TestGroupLaunchInfo>) {
            super.initialize(props)

            this.enterGraph(globalGraph as Replica)

            if (this.descriptor.childNodes)
                this.items      = this.descriptor.childNodes.map(descriptor => {
                    return descriptor.isLeaf()
                        ? TestLaunchInfo.new({ descriptor, dashboard : this.dashboard })
                        : TestGroupLaunchInfo.new({ descriptor, dashboard : this.dashboard })
                })

            this.dashboard.resultsGroups.set(this.descriptor, this)
        }


        get parentInfo () : TestGroupLaunchInfo {
            return this.descriptor.parentNode ? this.dashboard.resultsGroups.get(this.descriptor.parentNode) : undefined
        }


        toggleChecked () {
            this.setChecked(!this.checked)
        }


        setChecked (value : boolean) {
            this.checked = value

            this.items.forEach(item => item.setChecked(value))

            if (!value) this.uncheckParents()
        }


        uncheckParents () {
            this.checked    = false

            this.parentInfo && this.parentInfo.uncheckParents()
        }


        @calculate('viewState')
        calculateViewState () : TestGroupViewState {
            let result : TestGroupViewState      = 'noinfo'

            if (this.items.every(launchInfo => launchInfo.viewState === 'noinfo')) {
                result = 'noinfo'
            }
            if (this.items.every(launchInfo => launchInfo.viewState === 'pending')) {
                result = 'pending'
            }
            else if (this.items.some(launchInfo => launchInfo.viewState === 'running' || launchInfo.viewState === 'started')) {
                result = 'running'
            }
            else if (this.items.every(launchInfo => launchInfo.viewState === 'passed')) {
                result = 'passed'
            }
            else if (this.items.some(launchInfo => launchInfo.viewState === 'failed' || launchInfo.viewState === 'exception')) {
                result = 'failed'
            }

            return result
        }
    }
) {}
