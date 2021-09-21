import { AnyConstructor, Mixin } from "../class/Mixin.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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


        turnIntoParent () {
            if (!this.childNodes) this.childNodes = []
        }


        isRootNode () : boolean {
            return !Boolean(this.parentNode)
        }


        isLeaf () : boolean {
            return this.childNodes === undefined
        }


        forEachChildNode (func : (node : this[ 'childNodeT' ]) => any) : false | undefined {
            const childNodes      = this.childNodes

            if (childNodes)
                for (let i = 0; i < childNodes.length; i++)
                    if (func(childNodes[ i ]) === false) return false
        }


        * forEachChildNodeGen () : Generator<this[ 'childNodeT' ]> {
            const childNodes      = this.childNodes

            if (childNodes)
                for (let i = 0; i < childNodes.length; i++) yield childNodes[ i ]
        }


        traverse (func : (node : this[ 'childNodeT' ]) => any, includeThis : boolean = true) : false | undefined {
            if (includeThis && func(this) === false) return false

            const childNodes      = this.childNodes

            if (childNodes)
                for (let i = 0; i < childNodes.length; i++) {
                    if (childNodes[ i ].traverse(func, true) === false) return false
                }
        }


        * traverseGen (includeThis : boolean = true) : Generator<this[ 'childNodeT' ]> {
            if (includeThis) yield this

            const childNodes      = this.childNodes

            if (childNodes)
                for (let i = 0; i < childNodes.length; i++) yield* childNodes[ i ].traverseGen(true)
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


        leavesAxis (res : this[ 'childNodeT' ][] = []) : this[ 'childNodeT' ][] {
            if (this.childNodes)
                this.childNodes.flatMap(node => node.leavesAxis(res))
            else
                res.push(this)

            return res
        }
    }
) {}


