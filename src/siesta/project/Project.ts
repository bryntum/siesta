import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { Logger } from "../../logger/Logger.js"
import { LocalContextProviderSameContext } from "../context_provider/LocalContextProviderSameContext.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { Dispatcher } from "./Dispatcher.js"
import { PlanItemFromDescriptor, ProjectPlanGroup, ProjectPlanItem, ProjectPlanItemDescriptor } from "./Plan.js"


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Project extends base {
        baseUrl         : string            = ''

        name            : string            = ''

        options         : Partial<TestDescriptor>           = undefined

        projectPlan     : ProjectPlanGroup                  = ProjectPlanGroup.new({ descriptor : TestDescriptor.new({ filename : '.' }) })
        projectPlanMap  : Map<string, ProjectPlanItem>      = new Map()

        logger          : Logger            = undefined


        createPlanGroup (dir : string, descriptor? : Partial<TestDescriptor>) : ProjectPlanGroup {
            const existing      = this.projectPlanMap.get(dir)

            if (existing) {
                if (existing instanceof ProjectPlanGroup) {
                    if (descriptor) existing.descriptor.merge(descriptor)

                    return existing
                } else
                    throw new Error("Plan group already declared as file")
            }

            const newGroup = ProjectPlanGroup.new({ id : dir, filename : dir, url : dir, descriptor : TestDescriptor.maybeNew(descriptor) })

            this.projectPlanMap.set(newGroup.id, newGroup)

            return newGroup
        }


        plan (...args : (ProjectPlanItemDescriptor | ProjectPlanItemDescriptor[])[]) {
            const flattened     = args.flat(Number.MAX_SAFE_INTEGER)
            const descriptors   = flattened.filter(el => Boolean(el))

            descriptors.forEach(item => this.projectPlan.planItem(PlanItemFromDescriptor(item as ProjectPlanItemDescriptor)))
        }


        async start () {
            const dispatcher    = Dispatcher.new({
                project                                 : this,
                localContextProviderConstructors        : [ LocalContextProviderSameContext ]
            })

            await dispatcher.start()
        }
    }
) {}
