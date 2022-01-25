import chalk from "chalk"
import { it } from "../../nodejs.js"
import { ColorerNodejs } from "../../src/jsx/ColorerNodejs.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { XmlRendererStreaming } from "../../src/jsx/XmlRenderer.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const renderer      = XmlRendererStreaming.new({
    colorerClass    : ColorerNodejs,
    styles          : new Map([
        [ 'red', style => style.color = [ 255, 0, 0 ] ]
    ])
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should correctly render styled elements', async t => {
    t.is(
        renderer.render(<div>
            Some text <span class="underlined">underlined</span>
        </div>),
        `Some text ${ chalk.underline('underlined') }`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should correctly combine styling and indentation', async t => {
    t.is(
        renderer.render(<div class="indented">
            Some text
            <div class="underlined">underlined</div>
        </div>),
`  Some text
  ${ chalk.underline('underlined') }`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should inherit styling from parent element', async t => {

    t.is(
        renderer.render(<div class="indented red">
            Some text
            <div class="underlined">
                <p>underlined1</p>
                <p>underlined2</p>
            </div>
        </div>),
`  ${ chalk.rgb(255, 0, 0)('Some text') }
  ${ chalk.underline.rgb(255, 0, 0)('underlined1') }
  ${ chalk.underline.rgb(255, 0, 0)('underlined2') }`
    )
})


