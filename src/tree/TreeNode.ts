import { Base } from "../class/Base.js"

//---------------------------------------------------------------------------------------------------------------------
export type TreeNode = ParentNode | LeafNode


//---------------------------------------------------------------------------------------------------------------------
export class LeafNode extends Base {
    parentNode      : ParentNode          = undefined
}


//---------------------------------------------------------------------------------------------------------------------
export class ParentNode extends Base {
    parentNode      : ParentNode        = undefined

    childNodes      : TreeNode[]        = []

    Leaf            : LeafNode


    getRootNode () : ParentNode {
        let root : ParentNode           = this

        while (root.parentNode) root    = root.parentNode

        return root
    }


    isRootNode () : boolean {
        return !Boolean(this.parentNode)
    }


    forEachChildNode (func : (node : TreeNode) => any) : false | undefined {
        const childNodes      = this.childNodes

        for (let i = 0; i < childNodes.length; i++)
            if (func(childNodes[ i ]) === false) return false
    }


    traverse (func : (node : TreeNode) => any, includeThis : boolean = true) : false | undefined {
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
