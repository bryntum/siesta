import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { ColoredStringColorToken, MaybeColoredString } from "./ColoredString.js"
import { Colorer } from "./Colorer.js"
import { TextBlock } from "./TextBlock.js"

//---------------------------------------------------------------------------------------------------------------------
export type RenderingProgress   = typeof SyncPoint

export const SyncPoint          = Symbol('SyncPoint')

//---------------------------------------------------------------------------------------------------------------------
// TODO should extend TreeNode ??
export class RenderingFrame extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class RenderingFrame extends base {

        colorize (c : Colorer) : RenderingFrame {
            return RenderingFrameColorize.new({ previous : this, wrappings : c.wrappings() })
        }


        indent (indentWith : MaybeColoredString[]) : RenderingFrame {
            return RenderingFrameIndented.new({ content : this, indentWith })
        }


        concat (next : RenderingFrame) : RenderingFrame {
            return RenderingFrameConcat.new({ previous : this, next })
        }


        toTextBlock (output : TextBlock) {
            throw new Error("Abstract method")
        }


        * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
            this.toTextBlock(output)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameSequence extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameSequence extends base {
        sequence        : (MaybeColoredString | RenderingFrame)[]      = []


        push (...frame : RenderingFrame[]) {
            this.sequence.push(...frame)
        }


        toTextBlock (output : TextBlock) {
            this.sequence.forEach(frame => {
                if (frame instanceof RenderingFrame)
                    frame.toTextBlock(output)
                else
                    output.push(frame)
            })
        }


        * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
            for (const frame of this.sequence) {
                if (frame instanceof RenderingFrame)
                    yield* frame.toTextBlockGen(output)
                else
                    output.push(frame)
            }
        }


        write (str : MaybeColoredString) {
            this.sequence.push(str)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameNoop extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameNoop extends base {

        toTextBlock (output : TextBlock) {
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameConcat extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameConcat extends base {
        previous    : RenderingFrame        = undefined

        next        : RenderingFrame        = undefined


        toTextBlock (output : TextBlock) {
            this.previous.toTextBlock(output)
            this.next.toTextBlock(output)
        }


        * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
            yield* this.previous.toTextBlockGen(output)
            yield* this.next.toTextBlockGen(output)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameColorize extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameColorize extends base {
        previous    : RenderingFrame        = undefined

        wrappings   : [ string, string ]    = undefined


        toTextBlock (output : TextBlock) {
            output.push(ColoredStringColorToken.new({ token : this.wrappings[ 0 ] }))

            this.previous.toTextBlock(output)

            output.push(ColoredStringColorToken.new({ token : this.wrappings[ 1 ] }))
        }


        * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
            output.push(ColoredStringColorToken.new({ token : this.wrappings[ 0 ] }))

            yield* this.previous.toTextBlockGen(output)

            output.push(ColoredStringColorToken.new({ token : this.wrappings[ 1 ] }))
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameContent extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameContent extends base {
        content     : MaybeColoredString        = undefined


        toTextBlock (output : TextBlock) {
            output.push(this.content)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameStartBlock extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameStartBlock extends base {

        toTextBlock (output : TextBlock) {
            output.startNewBlock()
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameIndented extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameIndented extends base {
        content         : RenderingFrame        = undefined

        indentWith      : MaybeColoredString[]  = []


        toTextBlock (output : TextBlock) {
            output.indentWith(this.indentWith)

            this.content.toTextBlock(output)

            output.outdent()
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameIndent extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameIndent extends base {
        indentWith      : MaybeColoredString[]  = []


        toTextBlock (output : TextBlock) {
            output.indentWith(this.indentWith)
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameOutdent extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameOutdent extends base {

        toTextBlock (output : TextBlock) {
            output.outdent()
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class RenderingFrameSyncPoint extends Mixin(
    [ RenderingFrame ],
    (base : ClassUnion<typeof RenderingFrame>) =>

    class RenderingFrameSyncPoint extends base {

        toTextBlock (output : TextBlock) {
        }


        * toTextBlockGen (output : TextBlock) : Generator<RenderingProgress> {
            yield SyncPoint
        }
    }
){}
