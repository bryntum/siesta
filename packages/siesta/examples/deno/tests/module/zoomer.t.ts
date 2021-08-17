import { it, Test } from "../../siesta_deno.ts"
import { zoomer } from "../../src/module.ts"

it('Using `zoomer` should work', async (t : Test) => {

    t.equal(zoomer('Myers Courtney', 35), { name : 'Courtney Myers', age : 35 })
})

