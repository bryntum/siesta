import { it, Test } from "@bryntum/siesta/index.js"
import { zoomer } from "../../src/module.js"

it('Using `zoomer` should work', async (t : Test) => {

    t.equal(zoomer('Myers Courtney', 35), { name : 'Courtney Myers', age : 35 })
})

