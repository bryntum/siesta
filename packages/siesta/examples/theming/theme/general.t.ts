import { it } from "../../../index.js"

it('Theming of various assertions', async t => {
    t.isInstanceOf(new Map(), Set, 'Map is instance of Set')
})


