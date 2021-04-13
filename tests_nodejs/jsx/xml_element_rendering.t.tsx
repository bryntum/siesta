import chalk from "chalk"
import { it } from "../../nodejs.js"
import { ColorerNodejs } from "../../src/jsx/ColorerNodejs.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { XmlRenderer } from "../../src/jsx/XmlRenderer.js"

//---------------------------------------------------------------------------------------------------------------------
const renderer      = XmlRenderer.new({ colorerClass : ColorerNodejs })


//---------------------------------------------------------------------------------------------------------------------
it('Should correctly render styled elements', async t => {

    t.is(
        renderer.render(<div>
            Some text <span class="underlined">underlined</span>
        </div>),
        `Some text ${ chalk.underline('underlined') }`
    )

    t.is(
        renderer.render(<div class="indented">
            Some text
            <div class="underlined">underlined</div>
        </div>),
`  Some text
  ${ chalk.underline('underlined') }`
    )

    t.is(
        renderer.render(<div class="indented">
            Some text
            <div class="underlined">
                <p>underlined1</p>
                <p>underlined2</p>
            </div>
        </div>),
`  Some text
  ${ chalk.underline('underlined1') }
  ${ chalk.underline('underlined2') }`
    )
})


