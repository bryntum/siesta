import { Base } from "../../class/Base.js"
import { TestDescriptor } from "../test/Descriptor.js"

//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanItem extends Base {
    parentItem      : ProjectPlanGroup  = undefined

    id              : string            = ''

    $url            : string            = undefined

    descriptor      : Partial<TestDescriptor>   = TestDescriptor.new()


    get filename () : string {
        return this.descriptor.filename
    }


    get url () : string {
        if (this.$url !== undefined) return this.$url

        return this.$url = (this.parentsAxis(true) as ProjectPlanItem[]).concat([ this ]).map(item => item.filename).join('/')
    }


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


    parentsAxis (rootFirst : boolean = false) : ProjectPlanGroup[] {
        const res : ProjectPlanGroup[]   = []

        let item : ProjectPlanItem       = this

        while (item) {
            if (item.parentItem) res.push(item.parentItem)

            item        = item.parentItem
        }

        if (rootFirst) res.reverse()

        return res
    }
}


//---------------------------------------------------------------------------------------------------------------------
export type ProjectPlanItemDescriptor = string | (Partial<TestDescriptor> & { items? : ProjectPlanItemDescriptor[] })


//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanGroup extends ProjectPlanItem {
    items           : (ProjectPlanItem | ProjectPlanGroup)[]                 = []

    // itemsMap        : Map<string, ProjectPlanItem>      = new Map()


    leafsAxis () : ProjectPlanItem[] {
        return this.items.flatMap(item => {
            if (item instanceof ProjectPlanGroup)
                return item.leafsAxis()
            else
                return item
        })
    }


    planItem (item : ProjectPlanItem) {
        item.parentItem     = this

        this.items.push(item)
    }
}

export const PlanItemFromDescriptor = (desc : ProjectPlanItemDescriptor) : ProjectPlanItem | ProjectPlanGroup => {
    if (typeof desc === 'string') {
        return ProjectPlanItem.new({
            descriptor : TestDescriptor.new({ filename : desc })
        })
    }
    else if (desc.items !== undefined) {
        const groupDesc = Object.assign({}, desc)

        delete groupDesc.items

        const group = ProjectPlanGroup.new({ descriptor : TestDescriptor.new(groupDesc) })

        desc.items.forEach(item => group.planItem(PlanItemFromDescriptor(item)))

        return group
    } else {
        return ProjectPlanItem.new({ descriptor : TestDescriptor.new(desc) })
    }
}
