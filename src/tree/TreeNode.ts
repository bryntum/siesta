import { AnyConstructor, Mixin } from "../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class TreeNode extends Mixin(
    [],
    (base : AnyConstructor) =>

    class TreeNode extends base {
        parentNode      : TreeNode                  = undefined

        childNodeT      : TreeNode

        childNodes      : this[ 'childNodeT' ][]    = undefined


        $depth           : number    = undefined

        get depth () : number {
            if (this.$depth !== undefined) return this.$depth

            let depth                   = 0
            let node : TreeNode         = this

            while (node.parentNode) { node = node.parentNode; depth++ }

            return this.$depth = depth
        }


        getRootNode () : TreeNode {
            let root : TreeNode             = this

            while (root.parentNode) root    = root.parentNode

            return root
        }


        appendChild (child : TreeNode) : TreeNode {
            child.parentNode    = this;

            (this.childNodes || (this.childNodes = [])).push(child)

            return child
        }


        isRootNode () : boolean {
            return !Boolean(this.parentNode)
        }


        isLeaf () : boolean {
            return this.childNodes === undefined
        }


        forEachChildNode (func : (node : TreeNode) => any) : false | undefined {
            const childNodes      = this.childNodes

            for (let i = 0; i < childNodes.length; i++)
                if (func(childNodes[ i ]) === false) return false
        }


        traverse (func : (node : TreeNode) => any, includeThis : boolean = true) : false | undefined {
            if (includeThis && func(this) === false) return false

            const childNodes      = this.childNodes

            if (childNodes)
                for (let i = 0; i < childNodes.length; i++) {
                    if (childNodes[ i ].traverse(func, true) === false) return false
                }
        }


        parentsAxis (rootFirst : boolean = false) : this[ 'parentNode' ][] {
            const res : this[ 'parentNode' ][]      = []

            let item : this[ 'parentNode' ]         = this

            while (item) {
                if (item.parentNode) res.push(item.parentNode)

                item        = item.parentNode
            }

            if (rootFirst) res.reverse()

            return res
        }


        leavesAxis () : this[ 'childNodeT' ][] {
            return this.childNodes ? this.childNodes.flatMap(node => node.leavesAxis()) : [ this ]
        }
    }
) {}


