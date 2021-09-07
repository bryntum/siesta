import { Base, ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import { CI } from "../../../chained-iterator/index.js"
import { it } from "../../index.js"
import { TreeNode } from "../../src/tree/TreeNode.js"
import { TreeNodeMapped } from "../../src/tree/TreeNodeMapped.js"


it('Better promise resolution detection should work', async t => {

    class Tree1 extends Mixin(
        [ TreeNode, Base ],
        (base : ClassUnion<typeof TreeNode, typeof Base>) =>

        class Tree1 extends base {
            name        : string        = ''
        }
    ) {}

    //---------------
    const root      = Tree1.new({ name : 'root' })

    const parent1   = Tree1.new({ name : 'parent1' })

    const child1    = Tree1.new({ name : 'child1' })
    const child2    = Tree1.new({ name : 'child2' })

    parent1.appendChild(child1)

    root.appendChild(parent1)
    root.appendChild(child2)

    //---------------
    class Tree1Mapped extends Mixin(
        [ Tree1, TreeNodeMapped ],
        (base : ClassUnion<typeof Tree1, typeof TreeNodeMapped>) =>

        class Tree1Mapped extends base {
            childNodeT      : this

            mapped          : string        = ''
        }
    ) {}


    const mappedRoot    = Tree1Mapped.fromTreeNode(root, source => Tree1Mapped.new({ mapped : `mapped-${ source.name }` }))

    t.equal(
        CI(mappedRoot.traverseGen()).map(node => node.mapped).toArray(),
        [ 'mapped-root', 'mapped-parent1', 'mapped-child1', 'mapped-child2' ]
    )
})
