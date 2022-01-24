import { it } from "../../index.js"
import { RenderCanvas } from "../../src/jsx/RenderBlock.js"
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


    t.is(
        renderer.render(
            <div>
                Some text <span>inner</span>
            </div>
        ),
        `Some text inner`
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Indentation should work', async t => {
    t.is(
        renderer.render(
            <div class="indented">
                Line1
            </div>
        ),
        `  Line1`
    )

    t.is(
        renderer.render(
            <div class="indented">
                Line1
                <div class="indented">
                    Line2
                </div>
            </div>
        ),
`  Line1
    Line2`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('`maxWidth` should work', async t => {
    t.is(
        renderer.render(
            <div>0123456789</div>,
            RenderCanvas.new({ maxWidth : 5 })
        ),
`01234
56789`
    )

    t.is(
        renderer.render(
            <div class="indented">012345678</div>,
            RenderCanvas.new({ maxWidth : 5 })
        ),
`  012
  345
  678`
    )
})


