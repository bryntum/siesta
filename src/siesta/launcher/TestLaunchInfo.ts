import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { calculate, Entity, field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { CI } from "../../iterator/Iterator.js"
import { luid } from "../common/LUID.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { Exception, TestNodeResultReactive } from "../test/TestResult.js"
import { Dispatcher } from "./Dispatcher.js"

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
        dispatcher          : Dispatcher                = undefined

        descriptor          : TestDescriptor            = undefined

        @field()
        mostRecentResult    : TestNodeResultReactive    = undefined

        @field()
        viewState           : TestViewState

        @field()
        launchState         : LaunchState               = 'noinfo'

        @field()
        testSources         : string[]                  = undefined


        initialize (props? : Partial<TestLaunchInfo>) {
            super.initialize(props)

            this.enterGraph(globalGraph as Replica)

            const descriptor        = this.descriptor

            descriptor.remoteId     = luid()

            this.dispatcher.results.set(descriptor, this)
            this.dispatcher.localRemoteDescMap.set(descriptor.remoteId, descriptor)
        }


        async schedulePendingTestLaunch () {
            this.launchState        = 'pending'

            try {
                this.testSources    = await this.dispatcher.reporter.fetchSources(this.descriptor.urlAbs)
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
                    if (CI(this.mostRecentResult.eachResultLeafOfClass(Exception)).size > 0) return 'exception'

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
        dispatcher          : Dispatcher                = undefined

        descriptor          : TestDescriptor            = undefined

        items               : (TestGroupLaunchInfo | TestLaunchInfo)[]      = []

        @field()
        viewState           : TestGroupViewState


        initialize (props? : Partial<TestGroupLaunchInfo>) {
            super.initialize(props)

            this.enterGraph(globalGraph as Replica)

            if (this.descriptor.childNodes)
                this.items      = this.descriptor.childNodes.map(descriptor => {
                    return descriptor.childNodes === undefined
                        ? TestLaunchInfo.new({ descriptor, dispatcher : this.dispatcher })
                        : TestGroupLaunchInfo.new({ descriptor, dispatcher : this.dispatcher })
                })

            this.dispatcher.resultsGroups.set(this.descriptor, this)
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
