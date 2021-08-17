import { it } from "../../index.js"
import { TextBlock } from "../../src/jsx/TextBlock.js"


it('Should split too long lines into chunks', async t => {
    const block1    = TextBlock.new({ maxLen : 10 })

    block1.push('1'.repeat(11))

    t.is(block1.toString(), '1'.repeat(10) + '\n' + '1'.repeat(1))

    //-------------------
    const block2    = TextBlock.new({ maxLen : 10 })

    block2.push('1'.repeat(20))

    t.is(block2.toString(), '1'.repeat(10) + '\n' + '1'.repeat(10))

    //-------------------
    const block3    = TextBlock.new({ maxLen : 10 })

    block3.push('1'.repeat(10))
    block3.push('1'.repeat(10))

    t.is(block3.toString(), '1'.repeat(10) + '\n' + '1'.repeat(10), 'block3')

    //-------------------
    const block4    = TextBlock.new({ maxLen : 10 })

    block4.push('1'.repeat(5))
    block4.push('1'.repeat(15))

    t.is(block4.toString(), '1'.repeat(10) + '\n' + '1'.repeat(10))

    //-------------------
    const block5    = TextBlock.new({ maxLen : 10 })

    block5.push('')
    block5.push('1'.repeat(15))
    block5.push('1'.repeat(5))
    block5.push('')

    t.is(block5.toString(), '1'.repeat(10) + '\n' + '1'.repeat(10))
})


it('Should support indent/oudent', async t => {
    const block1    = TextBlock.new({ maxLen : 10, indentLevel : 2 })

    block1.push('1'.repeat(5))

    t.is(block1.toString(), '1'.repeat(5))

    //--------------
    block1.indent()

    block1.push('1'.repeat(3))

    t.is(block1.toString(), '1'.repeat(8), 'Indent should only affect next line')

    //--------------
    block1.push('1'.repeat(7))

    t.is(block1.toString(), '1'.repeat(10) + '\n' + '  ' + '1'.repeat(5), 'Content of the next line has been indented')

    //--------------
    block1.outdent()

    block1.push('1'.repeat(8))

    t.is(block1.toString(), '1'.repeat(10) + '\n' + '  ' + '1'.repeat(8) + '\n' + '1'.repeat(5), 'Content of the next line has been indented')
})
