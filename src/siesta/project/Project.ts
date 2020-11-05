import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { TestDescriptor } from "../test/Test.js"
import { Dispatcher } from "./Dispatcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanItem extends Base {
    parentItem      : ProjectPlanGroup  = undefined

    id              : string            = ''

    name            : string            = ''

    filename        : string            = ''

    descriptor      : Partial<TestDescriptor>   = TestDescriptor.new()


    initialize<T extends ProjectPlanItem> (props? : Partial<T>) {
        if (props) {
            if (props.descriptor === undefined)
                delete props.descriptor
            else
                props.descriptor    = TestDescriptor.fromPlainObject(props.descriptor)
        }

        props && Object.assign(this, props)
    }


    merge (another : ProjectPlanItem) {
        if (this.parentItem) {
            if (another.parentItem && this.parentItem !== another.parentItem) throw new Error("Can not merge items")
        }
        else if (!another.parentItem) {
            // do nothing
        }
        else {
            this.parentItem     = another.parentItem
        }

        if (another.id !== this.id || another.name !== this.name || another.filename !== this.filename) throw new Error("Illegal state")

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
        baseDir         : string            = ''

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

            const newGroup = ProjectPlanGroup.new({ id : dir, name : dir, filename : dir, descriptor })

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
