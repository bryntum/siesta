import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { Colorer } from "../reporter/Colorer.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { Launch } from "./Launch.js"
import { HasOptions, option, parseOptions } from "../launcher/Option.js"
import { PlanItemFromDescriptor, ProjectPlanGroup, ProjectPlanItem, ProjectPlanItemDescriptor } from "./Plan.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectOptions extends Mixin(
    [ HasOptions, Base ],
    (base : ClassUnion<typeof HasOptions, typeof Base>) => {

    class ProjectOptions extends base {
        @option({ type : 'boolean' })
        noColor         : boolean           = false

    }

    return ProjectOptions
}) {}


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ HasOptions, Base ],
    (base : ClassUnion<typeof HasOptions, typeof Base>) => {

    class Project extends base {
        baseUrl         : string            = ''

        title           : string            = ''

        test            : Partial<TestDescriptor>           = undefined
        descriptor      : Partial<TestDescriptor>           = undefined

        projectPlan     : ProjectPlanGroup                  = ProjectPlanGroup.new()
        // projectPlanMap  : Map<string, ProjectPlanItem>      = new Map()

        logger          : Logger            = Logger.new()

        testContextProviderConstructors   : (typeof TestContextProvider)[]      = []

        setupDone       : boolean           = false
        setupPromise    : Promise<any>      = undefined

        reporterClass   : typeof Reporter   = undefined
        colorerClass    : typeof Colorer    = undefined

        // inputArgs       : string[]          = undefined
        //
        // @option({ type : 'string', structure : 'map' })
        // map             : boolean           = false


        // createPlanGroup (dir : string, descriptor? : Partial<TestDescriptor>) : ProjectPlanGroup {
        //     const existing      = this.projectPlanMap.get(dir)
        //
        //     if (existing) {
        //         if (existing instanceof ProjectPlanGroup) {
        //             if (descriptor) existing.descriptor.merge(descriptor)
        //
        //             return existing
        //         } else
        //             throw new Error("Plan group already declared as file")
        //     }
        //
        //     const newGroup = ProjectPlanGroup.new({ id : dir, filename : dir, url : dir, descriptor : TestDescriptor.maybeNew(descriptor) })
        //
        //     this.projectPlanMap.set(newGroup.id, newGroup)
        //
        //     return newGroup
        // }


        plan (...args : (ProjectPlanItemDescriptor | ProjectPlanItemDescriptor[])[]) {
            const descriptors : ProjectPlanItemDescriptor[]  = args.flat(Number.MAX_SAFE_INTEGER).filter(el => Boolean(el)) as any

            descriptors.forEach(item => this.projectPlan.planItem(PlanItemFromDescriptor(item)))
        }


        async setup () {
            if (!this.baseUrl) this.baseUrl = this.buildBaseUrl()

            const desc              = TestDescriptor.maybeNew(this.descriptor)

            desc.url                = this.baseUrl

            this.projectPlan.descriptor = desc

            this.descriptor         = desc

            // if (this.inputArgs === undefined) this.inputArgs = this.buildInputArgs()
            //
            // const parseRes          = parseOptions(this.inputArgs, this.$options)
            //
            // if (parseRes.errors.length) {
            //
            // }
        }


        buildBaseUrl () : string {
            throw new Error("Implement me")
        }


        // buildInputArgs () : string[] {
        //     throw new Error("Implement me")
        // }


        async start () {
            if (globalThis.__SIESTA_PROJECT_EXTRACTOR_CONTEXT__ === true) {
                globalThis.__SIESTA_PROJECT_EXTRACTOR_CONTEXT__ = this
            } else {
                await this.launch(this.projectPlan.leafsAxis())
            }
        }


        async launch (planItemsToLaunch : ProjectPlanItem[]) : Promise<Launch> {
            if (!this.setupDone) {
                // setup may be already started (by another launch)
                await (this.setupPromise || (this.setupPromise = this.setup()))

                this.setupDone      = true
                this.setupPromise   = undefined
            }

            const launch    = Launch.new({
                project                                 : this,
                projectPlanItemsToLaunch                : planItemsToLaunch,

                testContextProviderConstructors         : this.testContextProviderConstructors
            })

            await launch.start()

            return launch
        }
    }

    return Project
}) {}
