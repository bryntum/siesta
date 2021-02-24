import chalk from "chalk"
import { it } from "../../index.js"
import { ColorerNodejs } from "../../src/jsx/ColorerNodejs.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { TextBlock } from "../../src/jsx/TextBlock.js"
import { XmlElement } from "../../src/jsx/XmlElement.js"
import { XmlRenderer } from "../../src/jsx/XmlRenderer.js"

//---------------------------------------------------------------------------------------------------------------------
const renderer      = XmlRenderer.new({ colorerClass : ColorerNodejs })

const render        = (el : XmlElement) : string => {
    const frame     = el.render(renderer)

    const textBlock = TextBlock.new()

    frame.toTextBlock(textBlock)

    return textBlock.toString()
}


//---------------------------------------------------------------------------------------------------------------------
it('XmlElement rendering should work', async t => {

    t.is(
        render(<div>
            Some text <span class="underlined">underlined</span>
        </div>),
        `Some text ${ chalk.underline('underlined') }`
    )

    t.is(
        render(<div class="indented">
            Some text
        </div>),
        `  Some text`
    )

})
