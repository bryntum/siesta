import { it } from "../../browser.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { serializeToElement } from "../../src/serializer2/Serial.js"


it('Serialization should not throw on built-in objects', async t => {
    t.doesNotThrow(() => serializeToElement(window))

    t.doesNotThrow(() => serializeToElement(window.location))

    t.doesNotThrow(() => serializeToElement(document.createElement('div')))
})
