import { it } from "../../index.js"
import { Collapser, Expander } from "../../src/serializable/Serializable.js"


it('Should be able to collapse with layer', async t => {
    //---------------------
    const a             = [ {} ]
    const collapser1    = Collapser.new()

    t.isDeeply(
        collapser1.collapse(a),
        {
            $refId      : 0,
            value       : [
                {
                    $refId      : 1,
                    value       : {}
                }
            ]
        }
    )

    //---------------------
    const b             = [ a, {} ]
    const collapser2    = Collapser.new({ layer : collapser1.layer })

    t.isDeeply(
        collapser2.collapse(b),
        {
            $refId  : 2,
            value   : [
                { $ref : 0 },
                {
                    $refId      : 3,
                    value       : {}
                }
            ]
        }
    )

    //---------------------
    const c             = [ a, b ]
    const collapser3    = Collapser.new({ layer : collapser2.layer })

    t.isDeeply(
        collapser3.collapse(c),
        {
            $refId  : 4,
            value   : [
                { $ref : 0 },
                { $ref : 2 }
            ]
        }
    )
})


it('Should be able to expand with layer', async t => {
    //---------------------
    const v1            = [ {} ]
    const collapser1    = Collapser.new()
    const collapsed1    = collapser1.collapse(v1)

    //---------------------
    const v2            = [ v1, {} ]
    const collapser2    = Collapser.new({ layer : collapser1.layer })
    const collapsed2    = collapser2.collapse(v2)

    //---------------------
    const v3            = [ v1, v2 ]
    const collapser3    = Collapser.new({ layer : collapser2.layer })
    const collapsed3    = collapser3.collapse(v3)


    //---------------------
    const expander1     = Expander.new()
    const expanded1     = expander1.expand(collapsed1)

    t.isDeeply(expanded1, v1)

    //---------------------
    const expander2     = Expander.new({ layer : expander1.layer })
    const expanded2     = expander2.expand(collapsed2)

    t.isDeeply(expanded2, v2)

    //---------------------
    const expander3     = Expander.new({ layer : expander2.layer })
    const expanded3     = expander3.expand(collapsed3)

    t.isDeeply(expanded3, v3)

    t.is(expanded3[ 0 ], expanded1)
    t.is(expanded3[ 1 ], expanded2)

    t.is(expanded2[ 0 ], expanded1)
})


