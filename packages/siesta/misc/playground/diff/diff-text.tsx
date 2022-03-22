import { ColorerNodejs } from "../../../src/jsx/ColorerNodejs.js"
import { RenderCanvas } from "../../../src/jsx/RenderBlock.js"
import { TextJSX } from "../../../src/jsx/TextJSX.js"
import { TreeStreamed } from "../../../src/jsx/Tree.js"
import { styles } from "../../../src/siesta/reporter/styling/theme_universal.js"
import { compareDeepDiff } from "../../../src/compare_deep/DeepDiff.js"
import { JsonDeepDiffElement} from "../../../src/compare_deep/DeepDiffRendering.js"
import { XmlRendererDifference } from "../../../src/compare_deep/DeepDiffXmlRendererDifference.js"

const difference      = compareDeepDiff(
    {
        map : new Map([ [ { key1 : 'value1' }, 1 ] ]),
        array : [ 'unequal', 'equal', 'extra' ],
        unexpected : 'unexpected',
        hetero : [ 1, 2 ]
    },
    {
        map : new Map([ [ { key1 : 'value1' }, 1 ], [ { key2 : 'value2' }, 1 ] ]),
        array : [ 'UNEQUAL', 'equal' ],
        expected : 'expected',
        hetero : { a : 'x' }
    }


    // [1], [2]
    // new Set([ 1, 2, 3, 4 ]), new Set([ 1, 2, 3, 4 ])
    // { a : '0'.repeat(100) }, { a : '1'.repeat(300) }

    // { a : 1, b : { c : { d : { e : 4 } } } }, { a : 1, b : { c : { d : { e : 5 } } } }
    // /a/, /a/i
    // 1, 2
    // [ { a : { b : 2 } }, new Set([ 1 ]) ], [ 1, { c : 2 } ]

    // new Map([ [ { a : 1 }, { aa : 2 } ], [ { b : 2 }, 2 ] ]),
    // new Map([ [ { a : 1 }, { aa : 2 } ], [ { c : 3 }, 3 ] ])
    // child, parent
    // [ { a : 1 } ], [ 3 ]
    // { a : 1, b : [ 2, 3 ], c : [ 6, 7 ] }, { a : 1, b : [ 3, 4, 5 ] }
    // [ [ '1' ] ],
    // [ [ '33333333333' ] ]

    // [ [ '1', '2', [ [ '1', '2' ], 2, 3 ] ], 2, 3 ],
    // [ [ '333333333333333333333333333333333333333333333333333333', '1', [ [ '1', '2' ], 2, 3 ] ], 2, 1 ]
)
const comp      = JsonDeepDiffElement.new({
    difference        : difference
})

const renderer      = XmlRendererDifference.new({
    styles          : styles,
    colorerClass    : ColorerNodejs
})


// console.log(renderer.render(comp, RenderCanvas.new({ maxWidth : 100 })))


const tree = <TreeStreamed>
                Tree 0 header
                <leaf>
                    Leaf 0 header
                    <TreeStreamed>
                        Tree 0-0 header
                        <leaf>
                            Leaf 0-0-1 header
                        </leaf>
                        <leaf>
                            Leaf 0-0-2 header
                        </leaf>
                    </TreeStreamed>
                </leaf>
                <leaf>
                    Leaf 1 header
                    <TreeStreamed>
                        Tree 1-0 header
                        <leaf>
                            Leaf 1-0-1 header
                        </leaf>
                        <leaf>
                            Leaf 1-0-2 header
                        </leaf>
                    </TreeStreamed>
                </leaf>
            </TreeStreamed>

debugger

console.log(renderer.render(tree, RenderCanvas.new({ maxWidth : 100 })))
