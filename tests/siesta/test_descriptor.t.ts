import { it } from "../../index.js"
import { TestDescriptor } from "../../src/siesta/test/TestDescriptor.js"


it('Should be able to flatten the descriptor options', t => {
    const rootDesc      = TestDescriptor.new({
        url     : '.',
        isTodo  : true
    })


    const childDesc     = rootDesc.planItem(TestDescriptor.new({ filename : 'some.t.js' }))

    t.is(childDesc.flatten.isTodo, true, 'Should "inherit" the `isTodo` value from parent')
})


it({ title : 'Nested test descriptors should extend parent descriptor', defaultTimeout : 1000 }, t => {
    t.is(t.descriptor.defaultTimeout, 1000)

    t.it('Nesting level 1', t => {
        t.is(t.descriptor.defaultTimeout, 1000)

        t.it('Nesting level 2', t => {
            t.is(t.descriptor.defaultTimeout, 1000)
        })
    })
})
