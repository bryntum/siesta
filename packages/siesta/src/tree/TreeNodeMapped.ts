import { ClassUnion, Mixin } from "../class/Mixin.js"
import { TreeNode } from "./TreeNode.js"


//---------------------------------------------------------------------------------------------------------------------
// TODO does it really have to be a class? a single function
// (perhaps even a method on the `TreeNode`) should be enough?
// having it as a class only make sense for reactive TreeMap
export class TreeNodeMapped extends Mixin(
    [ TreeNode ],
    (base : ClassUnion<typeof TreeNode>) =>

    class TreeNodeMapped extends base {

        static fromTreeNode<T extends typeof TreeNodeMapped, S extends TreeNode> (
            this        : T,
            treeNode    : S,
            mapper      : (source : S) => InstanceType<T>
        )
            : InstanceType<T>
        {
            const instance      = mapper(treeNode)

            treeNode.forEachChildNode(child => instance.appendChild(this.fromTreeNode(child, mapper)))

            return instance
        }
    }
) {}



