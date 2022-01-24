import { it } from "../../index.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { ULStreamed } from "../../src/jsx/UL.js"
import { XmlRendererStreaming } from "../../src/jsx/XmlRenderer.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const renderer      = XmlRendererStreaming.new()


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Unordered list rendering should work', async t => {

    t.is(
        renderer.render(<ULStreamed>
            Some text
            <li>
                <div>Element1-1</div>
                <div>Element1-2</div>
            </li>
            <li>
                <div>Element2-1</div>
                <div>Element2-2</div>
            </li>
        </ULStreamed>),
`Some text
· Element1-1
  Element1-2
· Element2-1
  Element2-2`
    )
})
