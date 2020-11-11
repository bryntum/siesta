import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { TestDescriptor } from "../test/Test.js"
import { Dispatcher } from "./Dispatcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanItem extends Base {
    parentItem      : ProjectPlanGroup  = undefined

    id              : string            = ''

    name            : string            = ''

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

        if (another.name !== this.name || another.url !== this.url) throw new Error("Can not merge plan items - name or url do not match")

        this.descriptor.merge(another.descriptor)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanGroup extends ProjectPlanItem {
    items           : ProjectPlanItem[]                 = []

    itemsMap        : Map<string, ProjectPlanItem>      = new Map()


    planItem (item : ProjectPlanItem) {
        const existing      = this.itemsMap.get(item.id)

        if (existing)
            existing.merge(item)
        else {
            this.items.push(item)
            this.itemsMap.set(item.id, item)
        }
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

        plan            : ProjectPlanGroup                  = undefined
        planMap         : Map<string, ProjectPlanItem>      = new Map()


        createPlanGroup (dir : string, descriptor? : Partial<TestDescriptor>) : ProjectPlanGroup {
            const existing      = this.planMap.get(dir)

            if (existing) {
                if (existing instanceof ProjectPlanGroup) {
                    if (descriptor) existing.descriptor.merge(descriptor)

                    return existing
                } else
                    throw new Error("Plan group already declared as file")
            }

            const newGroup = ProjectPlanGroup.new({ id : dir, name : dir, url : dir, descriptor : TestDescriptor.maybeNew(descriptor) })

            this.planMap.set(newGroup.id, newGroup)

            return newGroup
        }


        finalizePlan () {

        }


        async start () {
            debugger

            const dispatcher    = Dispatcher.new({ project : this })

            await dispatcher.start()
        }
    }
) {}
