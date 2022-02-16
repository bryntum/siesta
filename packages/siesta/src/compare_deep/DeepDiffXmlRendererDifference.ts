import { CI } from "chained-iterator"
import { ClassUnion, Mixin } from "typescript-mixin-class"
import { XmlElement } from "../jsx/XmlElement.js"
import { XmlRendererSerial } from "../serializer/SerialRendering.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class XmlRendererDifference extends Mixin(
    [ XmlRendererSerial ],
    (base : ClassUnion<typeof XmlRendererSerial>) =>

    class XmlRendererDifference extends base {

        prettyPrint : boolean           = true


        initialize (props? : Partial<XmlRendererDifference>) {
            super.initialize(props)

            this.blockLevelElements.add('diff-entry')
            this.blockLevelElements.add('diff-inner')
        }


        getElementClass (el : XmlElement) : string {
            const insideHetero  = CI(el.parentAxis()).some(el => el.tagName === 'diff-hetero')

            return el.class + (insideHetero ? ' diff-hetero' : '')
        }
    }
){}
