import { it } from "../../nodejs.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { serializeToElement } from "../../src/serializer2/Serial.js"


it('Serialization should not throw on built-in objects', async t => {
    t.doesNotThrow(() => serializeToElement(process))
})
