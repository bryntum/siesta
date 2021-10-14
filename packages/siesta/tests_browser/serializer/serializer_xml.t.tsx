import { it } from "../../browser.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { SerializerXml } from "../../src/serializer/SerializerXml.js"


it('Serialization should not throw on built-in objects', async t => {
    t.doesNotThrow(() => SerializerXml.serialize(window))

    t.doesNotThrow(() => SerializerXml.serialize(window.location))

    t.doesNotThrow(() => SerializerXml.serialize(document.createElement('div')))
})
