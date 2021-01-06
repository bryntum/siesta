import { AnyConstructor, Mixin } from "../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class LeafNode extends Mixin(
    [],
    (base : AnyConstructor) =>

    class LeafNode extends base {
        parentNode      : ParentNode          = undefined
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ParentNode extends Mixin(
    [],
    (base : AnyConstructor) =>

    class ParentNode extends base {
        parentNode      : ParentNode        = undefined

        // can not use `this[ 'Child' ]` here - TS can't figure out the type discrimination in `traverse`
        childNodes      : (this[ 'Leaf' ] | this[ 'parentNode' ])[]        = []

        Leaf            : LeafNode
        Child           : this[ 'Leaf' ] | this[ 'parentNode' ]


        getRootNode () : ParentNode {
            let root : ParentNode           = this

            while (root.parentNode) root    = root.parentNode

            return root
        }


        isRootNode () : boolean {
            return !Boolean(this.parentNode)
        }


        forEachChildNode (func : (node : this[ 'Child' ]) => any) : false | undefined {
            const childNodes      = this.childNodes

            for (let i = 0; i < childNodes.length; i++)
                if (func(childNodes[ i ]) === false) return false
        }


        traverse (func : (node : this[ 'Child' ]) => any, includeThis : boolean = true) : false | undefined {
            if (includeThis && func(this) === false) return false

            const childNodes      = this.childNodes

            for (let i = 0; i < childNodes.length; i++) {
                const childNode     = childNodes[ i ]

                if (childNode instanceof LeafNode) {
                    if (func(childNode) === false) return false
                }
                else {
                    if (childNode.traverse(func, true) === false) return false
                }
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


        leafsAxis () : this[ 'Leaf' ][] {
            return this.childNodes.flatMap(node => (node instanceof LeafNode) ? [ node ] : node.leafsAxis())
        }
    }
) {}


