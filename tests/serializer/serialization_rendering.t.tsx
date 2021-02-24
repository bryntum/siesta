import { it } from "../../index.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { XmlRendererSerialization } from "../../src/serializer/SerializerElements.js"
import { SerializerXml } from "../../src/serializer/SerializerXml.js"

//---------------------------------------------------------------------------------------------------------------------
const renderer          = XmlRendererSerialization.new()
const rendererPretty    = XmlRendererSerialization.new({ prettyPrint : true })


it('Rendering of serializer output should work', async t => {

    t.is(renderer.renderToString(SerializerXml.serialize(1)), '1')

    t.is(renderer.renderToString(SerializerXml.serialize([])), '[]')

    t.is(renderer.renderToString(SerializerXml.serialize([ 1, 2, 3 ])), '[1, 2, 3]')

    t.is(rendererPretty.renderToString(
        SerializerXml.serialize([ 1, 2, 3 ])),
`[
  1,
  2,
  3
]`
    )
})


