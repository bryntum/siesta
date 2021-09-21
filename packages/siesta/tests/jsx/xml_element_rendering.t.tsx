import { it } from "../../index.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { Tree } from "../../src/jsx/Tree.js"
import { UL } from "../../src/jsx/UL.js"
import { XmlRenderer } from "../../src/jsx/XmlRenderer.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const renderer      = XmlRenderer.new()


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('XmlElement rendering should work', async t => {

    t.is(
        renderer.render(<div>
            Some text <span>inner</span>
        </div>),
        `Some text inner`
    )

    t.is(
        renderer.render(<div class="indented">
            Some text
        </div>),
        `  Some text`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Unordered list rendering should work', async t => {

    t.is(
        renderer.render(<UL>
            Some text
            <li>
                <div>Element1-1</div>
                <div>Element1-2</div>
            </li>
            <li>
                <div>Element2-1</div>
                <div>Element2-2</div>
            </li>
        </UL>),
`Some text
· Element1-1
  Element1-2
· Element2-1
  Element2-2`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Tree rendering should work', async t => {

    t.is(
        renderer.render(
            <Tree>
                Tree 0 header
                <leaf>
                    Leaf 0 header
                    <Tree>
                        Tree 0-0 header
                        <leaf>
                            Leaf 0-0-1 header
                        </leaf>
                        <leaf>
                            Leaf 0-0-2 header
                        </leaf>
                    </Tree>
                </leaf>
                <leaf>
                    Leaf 1 header
                    <Tree>
                        Tree 1-0 header
                        <leaf>
                            Leaf 1-0-1 header
                        </leaf>
                        <leaf>
                            Leaf 1-0-2 header
                        </leaf>
                    </Tree>
                </leaf>
            </Tree>
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
            <Tree isTopLevelLastNode={ false }>
                Tree 0 header
                <leaf>
                    Leaf 0 header
                    <Tree>
                        Tree 0-0 header
                        <leaf>
                            Leaf 0-0-1 header
                        </leaf>
                        <leaf>
                            Leaf 0-0-2 header
                        </leaf>
                    </Tree>
                </leaf>
                <leaf>
                    Leaf 1 header
                    <Tree>
                        Tree 1-0 header
                        <leaf>
                            Leaf 1-0-1 header
                        </leaf>
                        <leaf>
                            Leaf 1-0-2 header
                        </leaf>
                    </Tree>
                </leaf>
            </Tree>
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
