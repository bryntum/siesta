import { it } from "../../index.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
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
