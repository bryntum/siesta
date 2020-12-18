import { CI } from "../../src/collection/Iterator.js"
import {
    compareDeepGen,
    DifferenceMissingObjectKey,
    DifferenceTypesAreDifferent,
    DifferenceValuesAreDifferent,
    PathSegment
} from "../../src/util/DeepCompare.js"

declare const StartTest : any

StartTest(t => {

    t.it('Deep compare should work', async t => {
        // TODO should support comparing circular data structures

        // const a1    = { a : undefined }
        // a1.a        = a1
        //
        // const a2    = { a : undefined }
        // a2.a        = a2

        // t.isDeeply(a1, a2)

        // t.isDeeply(CI(compareDeepGen(a1, a2)).toArray(), [])

        t.isDeeply(CI(compareDeepGen(1, 1)).toArray(), [])

        t.isDeeply(CI(compareDeepGen(1, '1')).toArray(), [ DifferenceTypesAreDifferent.new({ v1 : 1, v2 : '1', type1 : 'Number', type2 : 'String' }) ])

        t.isDeeply(CI(compareDeepGen(1, 2)).toArray(), [ DifferenceValuesAreDifferent.new({ v1 : 1, v2 : 2 }) ])

        t.isDeeply(
            CI(compareDeepGen({ prop1 : 1, prop2 : 2 }, { prop2 : 2, prop1 : 1 })).toArray(),
            []
        )

        t.isDeeply(
            CI(compareDeepGen({ prop1 : 1, prop2 : 2 }, { prop2 : 3, prop1 : 1 })).toArray(),
            [ DifferenceValuesAreDifferent.new({ v1 : 2, v2 : 3, keyPath : [ PathSegment.new({ type : 'object', key : 'prop2' }) ] }) ]
        )

        t.isDeeply(
            CI(compareDeepGen({ prop1 : 1, prop2 : 2 }, { prop2 : 2, prop1 : 1, prop3 : 3 })).toArray(),
            [
                DifferenceMissingObjectKey.new({
                    object1         : { prop1 : 1, prop2 : 2 },
                    object2         : { prop2 : 2, prop1 : 1, prop3 : 3 },
                    missingKey      : 'prop3',
                    missingIn       : '1',
                    keyPath         : []
                })
            ]
        )
    })
})


