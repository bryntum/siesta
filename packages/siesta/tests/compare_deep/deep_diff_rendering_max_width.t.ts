import { it } from "../../index.js"
import { compareDeepDiff } from "../../src/compare_deep/DeepDiff.js"
import { XmlRendererDifference } from "../../src/compare_deep/DeepDiffXmlRendererDifference.js"
import { RenderCanvas } from "../../src/jsx/RenderBlock.js"

const renderer          = XmlRendererDifference.new({})
// strip zero-width spaces
const stripZws          = (str : string) => str.replace(/\u200B/g, '')


it('Should limit the width of the diff streams #1', async t => {
    const difference0   = compareDeepDiff('0'.repeat(10), '1'.repeat(20))

    t.is(
        stripZws(renderer.render(difference0.template(), RenderCanvas.new({ maxWidth : 30 }))),
        [
            'Received     │ │ Expected    ',
            '             │ │             ',
            '"0000000000" │ │ "11111111111',
            '             │ │ 111111111"  ',
        ].join('\n')
    )
})

// TODO not clear how to implement this in plain HTML.. do we really need it?
// seems it is possible to implement with `text-indent`:
// https://stackoverflow.com/questions/21316313/how-can-i-indent-all-text-in-a-paragraph-except-the-first-line
// it('Should indent the atomic object entries', async t => {
//     const difference5   = compareDeepDiff({ a : '0'.repeat(10) }, { a : '1'.repeat(20) })
//
//     t.is(
//         stripZws(renderer.render(difference5.template(), RenderCanvas.new({ maxWidth : 30 }))),
//         [
//             'Received      │ │ Expected    ',
//             '              │ │             ',
//             '{             │ │ {           ',
//             '  "a": "00000 │ │   "a": "1111',
//             '    00000"    │ │     11111111',
//             '              │ │     11111111',
//             '              │ │     "       ',
//             '}             │ │ }           ',
//         ].join('\n')
//     )
// })


it('Should limit the width of the diff streams #2', async t => {
    const difference5   = compareDeepDiff({ a : 1, b : { c : 2, d : 4 } }, { a : 1, b : { c : 3, e : 5 } })

    t.is(
        // 9 chars for left/right streams, 9 + 5 + 9 = 23
        stripZws(renderer.render(difference5.template(), RenderCanvas.new({ maxWidth : 23 }))),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            '{         │ │ {        ',
            '  "a": 1, │ │   "a": 1,',
            '  "b": {  │ │   "b": { ',
            '    "c":  │ │     "c": ',
            '    2,    │ │     3,   ',
            '    "d":  │ │     ░    ',
            '    4     │ │          ',
            '    ░     │ │     "e": ',
            '          │ │     5    ',
            '  }       │ │   }      ',
            '}         │ │ }        ',
        ].join('\n')
    )
})


it('Should limit the width of the diff streams #2', async t => {
    const difference5   = compareDeepDiff({ a : 1, b : { c : { d : { e : 4 } } } }, { a : 1, b : { c : { d : { e : 5 } } } })

    t.is(
        // 10 chars for left stream, 9 for right
        stripZws(renderer.render(difference5.template(), RenderCanvas.new({ maxWidth : 23 }))),
        [
            'Received  │ │ Expected ',
            '          │ │          ',
            '{         │ │ {        ',
            '  "a": 1, │ │   "a": 1,',
            '  "b": {  │ │   "b": { ',
            '    "c":  │ │     "c": ',
            '    {     │ │     {    ',
            '      "d" │ │       "d"',
            '      : { │ │       : {',
            '        " │ │         "',
            '        e │ │         e',
            '        " │ │         "',
            '        : │ │         :',
            '          │ │          ',
            '        4 │ │         5',
            '      }   │ │       }  ',
            '    }     │ │     }    ',
            '  }       │ │   }      ',
            '}         │ │ }        ',
        ].join('\n')
    )
})

