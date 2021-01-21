import { it } from "../../main.js"
import { TestDescriptor } from "../../src/siesta/test/TestDescriptor.js"


it('Should be able to flatten the descriptor options', t => {
    const rootDesc      = TestDescriptor.new({
        url     : '.',
        isTodo  : true
    })


    const childDesc     = rootDesc.planItem(TestDescriptor.new({ filename : 'some.t.js' }))

    t.is(childDesc.flatten().isTodo, true, 'Should "inherit" the `isTodo` value from parent')
})

