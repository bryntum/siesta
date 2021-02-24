import { it } from "../../index.js"
import { SiestaJSX } from "../../src/jsx/Factory.js"
import { XmlRendererSerialization } from "../../src/jsx/XmlRenderer.js"
import { SerializerXml } from "../../src/serializer/SerializerXml.js"

//---------------------------------------------------------------------------------------------------------------------
const renderer          = XmlRendererSerialization.new()
const rendererPretty    = XmlRendererSerialization.new({ prettyPrint : true })


it('Rendering of serializer output should work', async t => {

    t.is(renderer.render2(SerializerXml.serialize(1)), '1')

    t.is(renderer.render2(SerializerXml.serialize([])), '[]')

    t.is(renderer.render2(SerializerXml.serialize([ 1, 2, 3 ])), '[1,2,3]')

    t.is(rendererPretty.render2(
        SerializerXml.serialize([ 1, 2, 3 ])),
`[
  1,
  2,
  3
]`
    )
})


