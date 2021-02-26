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
    const difference1   = compareDeepGen([ 1, 1 ], [ 0, 0 ])

    t.is(
        renderer.renderToString(difference1.template()),
        [
            '[    │ │ [   ',
            '  1, │ │   0,',
            '  1  │ │   0 ',
            ']    │ │ ]   '
        ].join('\n')
    )

//     const difference2   = compareDeepGen([ { a : 1 } ], [ 0 ])
//
//     t.is(
//         renderer.renderToString(difference2.template()),
//         [
// '[           │ │ [  ',
// '  {         │ │   0',
// '    "a" : 1 │ │    ',
// '  }         │ │    ',
// ']           │ │ ]  '
//         ].join('\n')
//     )
})
