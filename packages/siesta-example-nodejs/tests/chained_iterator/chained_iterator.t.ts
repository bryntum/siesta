import { it } from "@bryntum/siesta/nodejs.js"

it('Should be able to use chained iterators', t => {
    t.isDeeply(1, t.anyNumberApprox(1))
})
