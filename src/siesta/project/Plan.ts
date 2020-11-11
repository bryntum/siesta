import { Base } from "../../class/Base.js"
import { TestDescriptor } from "../test/Descriptor.js"

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


//---------------------------------------------------------------------------------------------------------------------
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

export const PlanItemFromDescriptor = (desc : ProjectPlanItemDescriptor) : ProjectPlanItem | ProjectPlanGroup => {
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
