import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { TestDescriptor } from "../test/Test.js"
import { Dispatcher } from "./Dispatcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanItem extends Base {
    parentItem      : ProjectPlanGroup  = undefined

    id              : string            = ''

    filename        : string            = ''

    url             : string            = ''

    descriptor      : Partial<TestDescriptor>   = TestDescriptor.new()


    merge (another : ProjectPlanItem) {
        if (this.parentItem) {
            if (another.parentItem && this.parentItem !== another.parentItem) throw new Error("Can not merge plan items - parent items do not match")
        }
        else if (!another.parentItem) {
            // do nothing
        }
        else {
            this.parentItem     = another.parentItem
        }

        if (another.filename !== this.filename || another.url !== this.url) throw new Error("Can not merge plan items - name or url do not match")

        this.descriptor.merge(another.descriptor)
    }
}

export type ProjectPlanItemDescriptor = string | (Partial<TestDescriptor> & { items? : ProjectPlanItemDescriptor[] })

//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanGroup extends ProjectPlanItem {
    items           : ProjectPlanItem[]                 = []

    // itemsMap        : Map<string, ProjectPlanItem>      = new Map()


    planItem (item : ProjectPlanItem) {
        item.parentItem     = this

        this.items.push(item)
    }
}

const PlanItemFromDescriptor = (desc : ProjectPlanItemDescriptor) : ProjectPlanItem | ProjectPlanGroup => {
    if (typeof desc === 'string') {
        return ProjectPlanItem.new({
            filename    : desc
        })
    }
    else if (desc.items !== undefined) {
        const group = ProjectPlanGroup.new()

        desc.items.forEach(item => group.planItem(PlanItemFromDescriptor(item)))

        return group
    } else {
        return ProjectPlanItem.new({ descriptor : TestDescriptor.new(desc) })
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ProjectOptions {

}


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Project extends base {
        baseUrl         : string            = ''

        name            : string            = ''

        options         : Partial<TestDescriptor>           = undefined

        projectPlan     : ProjectPlanGroup                  = ProjectPlanGroup.new({ filename : '.' })
        projectPlanMap  : Map<string, ProjectPlanItem>      = new Map()


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


        finalizePlan () {

        }


        plan (...args : (ProjectPlanItemDescriptor | ProjectPlanItemDescriptor[])[]) {
            const flattened     = args.flat(Number.MAX_SAFE_INTEGER)
            const descriptors   = flattened.filter(el => Boolean(el))

            descriptors.forEach(item => this.projectPlan.planItem(PlanItemFromDescriptor(item as ProjectPlanItemDescriptor)))
        }


        async start () {
            debugger

            const dispatcher    = Dispatcher.new({ project : this })

            await dispatcher.start()
        }
    }
) {}
