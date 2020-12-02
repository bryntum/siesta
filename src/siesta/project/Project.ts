import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { TestContextProvider } from "../context_provider/TestContextProvider.js"
import { TestContextProviderNodeIpc } from "../context_provider/TestContextProviderNodeIpc.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { Dispatcher } from "./Dispatcher.js"
import { PlanItemFromDescriptor, ProjectPlanGroup, ProjectPlanItemDescriptor } from "./Plan.js"


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Project extends base {
        baseUrl         : string            = ''

        name            : string            = ''

        options         : Partial<TestDescriptor>           = undefined

        projectPlan     : ProjectPlanGroup                  = ProjectPlanGroup.new()
        // projectPlanMap  : Map<string, ProjectPlanItem>      = new Map()

        logger          : Logger            = Logger.new()

        testContextProviderConstructors   : (typeof TestContextProvider)[]      = [ TestContextProviderNodeIpc ]


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
            await this.setup()

            const dispatcher    = Dispatcher.new({
                project                                 : this,
                testContextProviderConstructors         : this.testContextProviderConstructors
            })

            await dispatcher.start()
        }
    }
) {}
