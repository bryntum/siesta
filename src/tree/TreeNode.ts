import { AnyConstructor, Mixin } from "../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class TreeNode extends Mixin(
    [],
    (base : AnyConstructor) =>

    class TreeNode extends base {
        parentNode      : TreeNode          = undefined

        childNodes      : TreeNode[]        = []


        getRootNode () : TreeNode {
            let root : TreeNode        = this

            while (root.parentNode) root    = root.parentNode

            return root
        }


        isRootNode () : boolean {
            return !Boolean(this.parentNode)
        }


        forEachChildNode (func : (node : TreeNode) => any) : false | undefined {
            const children      = this.childNodes

            for (let i = 0; i < children.length; i++)
                if (func(children[ i ]) === false) return false
        }


        traverse (func : (node : TreeNode) => any, includeThis : boolean = true) : false | undefined {
            const children      = this.childNodes

            if (includeThis && func(this) === false) return false

            for (let i = 0; i < children.length; i++)
                if (children[ i ].traverse(func, true) === false) return false
        }
    }
) {}
