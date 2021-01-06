import { LeafNode, ParentNode } from "../../tree/TreeNode.js"
import { TestDescriptor } from "../test/Descriptor.js"

//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanItem extends LeafNode {
    parentNode      : ProjectPlanGroup

    descriptor      : TestDescriptor    = TestDescriptor.new()


    normalizeDescriptor () {
        const descriptor        = this.descriptor

        if (!descriptor.url && !descriptor.filename) throw new Error("Descriptor needs to have either `filename` or `url` property defined")

        if (!descriptor.url) {
            let urlParts        = [ descriptor.filename ]

            let group           = this.parentNode

            while (group) {
                if (group.descriptor.url) {
                    urlParts.push(group.descriptor.url.replace(/\/$/, ''))

                    group       = null
                } else {
                    urlParts.push(group.descriptor.filename)

                    group       = group.parentNode
                }
            }

            urlParts.reverse()

            descriptor.url      = urlParts.join('/')
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
export type ProjectPlanItemDescriptor = string | (Partial<TestDescriptor> & { items? : ProjectPlanItemDescriptor[] })


//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanGroup extends ParentNode {
    parentNode      : ProjectPlanGroup

    descriptor      : TestDescriptor    = TestDescriptor.new()

    childNodes      : (ProjectPlanItem | ProjectPlanGroup)[]

    Leaf            : ProjectPlanItem


    planItem (item : ProjectPlanItem | ProjectPlanGroup) {
        item.parentNode     = this

        this.childNodes.push(item)
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
