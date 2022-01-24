import { it } from "../../index.js"
import { TextJSX } from "../../src/jsx/TextJSX.js"
import { XmlRendererStreaming } from "../../src/jsx/XmlRenderer.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const renderer      = XmlRendererStreaming.new()


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Basic rendering should work', async t => {
    t.is(
        renderer.render(<div>123</div>),
        `123`
    )

    t.is(
        renderer.render(<span>123</span>),
        `123`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Nesting/chaining inline elements should continue the inline flow', async t => {
    t.is(
        renderer.render(
            <span>
                <span>123</span>/<span>456</span>/<span>789</span>
            </span>
        ),
        `123/456/789`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Nesting/chaining block elements should start the new line', async t => {
    t.is(
        renderer.render(
            <div>
                <div>123</div>/<div>456</div>/<div>789</div>
            </div>
        ),
`123
/
456
/
789`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Mixin block/inline flows should work', async t => {
    t.is(
        renderer.render(
            <div>
                <span>123</span>
                /
                <div>
                    <span>4</span>
                </div>
                56/
                <div>
                    <div>7</div>
                    <div>8</div>
                    <div>9</div>
                </div>
            </div>
        ),
`123/
4
56/
7
8
9`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Empty block-level elements should create line break', async t => {
    t.is(
        renderer.render(
            <div>1<div></div>2</div>
        ),
`1
2`
    )
})
