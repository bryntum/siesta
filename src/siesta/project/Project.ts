import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { TestContextProviderNodeIpc } from "../context_provider/TestContextProviderNodeIpc.js"
import { Colorer } from "../reporter/Colorer.js"
import { Reporter } from "../reporter/Reporter.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { Launch } from "./Launch.js"
import { PlanItemFromDescriptor, ProjectPlanGroup, ProjectPlanItem, ProjectPlanItemDescriptor } from "./Plan.js"


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Project extends base {
        baseUrl         : string            = ''

        title           : string            = ''

        descriptor      : Partial<TestDescriptor>           = undefined

        projectPlan     : ProjectPlanGroup                  = ProjectPlanGroup.new()
        // projectPlanMap  : Map<string, ProjectPlanItem>      = new Map()

        logger          : Logger            = Logger.new()

        testContextProviderConstructors   : (typeof TestContextProvider)[]      = []

        setupDone       : boolean           = false
        setupPromise    : Promise<any>      = undefined

        reporterClass   : typeof Reporter   = undefined
        colorerClass    : typeof Colorer    = undefined


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
            const descriptors   = args.flat(Number.MAX_SAFE_INTEGER).filter(el => Boolean(el))

            descriptors.forEach(item => this.projectPlan.planItem(PlanItemFromDescriptor(item as ProjectPlanItemDescriptor)))
        }


        async setup () {
            if (!this.baseUrl) this.baseUrl = await this.setupBaseUrl()

            this.projectPlan.descriptor.url = this.baseUrl
        }


        async setupBaseUrl () : Promise<string> {
            throw new Error("Implement me")
        }


        async start () {
            await this.launch(this.projectPlan.leafsAxis())
        }


        async launch (planItemsToLaunch : ProjectPlanItem[]) {
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
        }
    }
) {}
