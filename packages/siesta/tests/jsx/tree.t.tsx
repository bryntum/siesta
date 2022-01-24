import { it } from "../../index.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { TreeStreamed } from "../../src/jsx/Tree.js"
import { XmlRendererStreaming } from "../../src/jsx/XmlRenderer.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const renderer      = XmlRendererStreaming.new()


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Tree rendering should work', async t => {

    t.is(
        renderer.render(
            <TreeStreamed>
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
        ),
`Tree 0 header
├─Leaf 0 header
│ Tree 0-0 header
│ ├─Leaf 0-0-1 header
│ └─Leaf 0-0-2 header
└─Leaf 1 header
  Tree 1-0 header
  ├─Leaf 1-0-1 header
  └─Leaf 1-0-2 header`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Continuous tree rendering should work', async t => {

    t.is(
        renderer.render(
            <TreeStreamed isTopLevelLastNode={ false }>
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
        ),
`Tree 0 header
├─Leaf 0 header
│ Tree 0-0 header
│ ├─Leaf 0-0-1 header
│ └─Leaf 0-0-2 header
├─Leaf 1 header
│ Tree 1-0 header
│ ├─Leaf 1-0-1 header
│ └─Leaf 1-0-2 header`
    )
})
