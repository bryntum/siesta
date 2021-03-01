import { it } from "../../index.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { UL } from "../../src/jsx/UnorderedList.js"
import { XmlRenderer } from "../../src/jsx/XmlRenderer.js"

//---------------------------------------------------------------------------------------------------------------------
const renderer      = XmlRenderer.new()


//---------------------------------------------------------------------------------------------------------------------
it('XmlElement rendering should work', async t => {

    t.is(
        renderer.renderToString(<div>
            Some text <span>inner</span>
        </div>),
        `Some text inner`
    )

    t.is(
        renderer.renderToString(<div class="indented">
            Some text
        </div>),
        `  Some text`
    )
})


//---------------------------------------------------------------------------------------------------------------------
it('Unordered list rendering should work', async t => {

    t.is(
        renderer.renderToString(<UL>
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
