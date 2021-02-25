import chalk from "chalk"
import { it } from "../../index.js"
import { compareDeepGen } from "../../src/compare_deep/CompareDeepDiff.js"
import { XmlRendererDifference } from "../../src/compare_deep/CompareDeepDiffRendering.js"
import { ColorerNodejs } from "../../src/jsx/ColorerNodejs.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { XmlRenderer } from "../../src/jsx/XmlRenderer.js"

//---------------------------------------------------------------------------------------------------------------------
const renderer      = XmlRenderer.new({ colorerClass : ColorerNodejs })


//---------------------------------------------------------------------------------------------------------------------
it('Should correctly render styled elements', async t => {

    t.is(
        renderer.renderToString(<div>
            Some text <span class="underlined">underlined</span>
        </div>),
        `Some text ${ chalk.underline('underlined') }`
    )
})


it('Should render the diff correctly', async t => {

    const renderer      = XmlRendererDifference.new()

    const difference    = compareDeepGen([ 1 ], [ 0 ])

    debugger

    t.is(
        renderer.renderToString(difference.template()),
        [
            '[   │ │ [  ',
            '  1 │ │   0',
            ']   │ │ ]  '
        ].join('\n')
    )
})
