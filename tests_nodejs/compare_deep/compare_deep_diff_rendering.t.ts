import { it } from "../../index.js"
import { compareDeepDiff } from "../../src/compare_deep/CompareDeepDiff.js"
import { XmlRendererDifference } from "../../src/compare_deep/CompareDeepDiffRendering.js"
import { ColorerNodejs } from "../../src/jsx/ColorerNodejs.js"
import { stripAnsiControlCharacters } from "../../src/util_nodejs/Terminal.js"

const rendererPlain     = XmlRendererDifference.new()
const rendererNodejs    = XmlRendererDifference.new({ colorerClass : ColorerNodejs })

it('Should render the colored diff in the same way as non-colored', async t => {
    const a = {
        "descriptor": {
            "parentNode": undefined,
            "childNodes": undefined
        }
    }

    const b = {
        "descriptor": {
            "parentNode": {
                "url": "."
            },
            "childNodes": undefined
        }
    }

    const difference0   = compareDeepDiff(a, b)

    t.is(
        stripAnsiControlCharacters(rendererNodejs.render(difference0.template())),
        rendererPlain.render(difference0.template())
    )
})
