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

    t.is(
        renderer.render(
            <div class="indented">
                <span>123</span><span>456</span><span>789</span>
            </div>
        ),
        `  123456789`
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
it('Block level element inside the inline element should be wrapped', async t => {
    t.is(
        renderer.render(
            <div>
                <span>
                    123
                    <div>
                        456
                    </div>
                    789
                </span>
            </div>
        ),
`123
456
789`
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


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('New line as a child node string should cause new line in the output', async t => {
    t.is(
        renderer.render(
            <div>a{ '\n\n' }b</div>,
        ),
        `a\n\nb`
    )

    t.is(
        renderer.render(
            <div>a{ '\n\n' }</div>,
        ),
        `a\n\n`
    )

    t.is(
        renderer.render(
            <div>{ '\n\n' }b</div>,
        ),
        `\n\nb`
    )

    t.is(
        renderer.render(
            <div>{ '\n\n' }</div>,
        ),
        `\n\n`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Starting new block-level element after the new line should create new line', async t => {

    t.is(
        renderer.render(
            <div>
                <div>{ '\n' }</div>
                <div>{ '\n' }</div>
            </div>
        ),
        `\n\n\n`
    )

    t.is(
        renderer.render(
            <div>
                { '\n' }
                <div>{ '\n' }</div>
            </div>
        ),
        `\n\n\n`
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Multiple empty block elements should cause a single or zero new line(s) in the output', async t => {
    t.is(
        renderer.render(
            <div>a<div></div><div></div>b</div>,
        ),
        `a\nb`
    )

    t.is(
        renderer.render(
            <div>a<div></div><div></div></div>,
        ),
        `a`
    )

    t.is(
        renderer.render(
            <div><div></div><div></div>b</div>,
        ),
        `b`
    )

    t.is(
        renderer.render(
            <div><div></div><div></div></div>,
        ),
        ``
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Non-empty block element as a child node should cause new line in the output', async t => {
    t.is(
        renderer.render(
            <div>a<div>_</div><div>_</div>b</div>,
        ),
        `a\n_\n_\nb`
    )

    t.is(
        renderer.render(
            <div><div>_</div><div>_</div></div>,
        ),
        `_\n_`
    )
})


