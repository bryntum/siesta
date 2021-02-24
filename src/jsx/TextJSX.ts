import { isString } from "../util/Typeguards.js"
import { XmlElement, XmlFragment, XmlNode } from "./XmlElement.js"


//---------------------------------------------------------------------------------------------------------------------
const FragmentSymbol  = Symbol('Fragment')

const normalizeXmlStream    = (stream : (XmlNode | false)[]) : XmlNode[] => {
    return stream
        .flat(Number.MAX_SAFE_INTEGER)
        .filter(el => el !== false && el !== undefined && el !== null)
        .flatMap(el => {
            if (el instanceof XmlFragment) {
                return el.childNodes
            }
            else if (isString(el) || (el instanceof XmlElement))
                return el
            else
                return String(el)
        })
}


export namespace TextJSX {
    export const Fragment = FragmentSymbol

    export function createElement (
        tagName : string | typeof FragmentSymbol | typeof XmlElement, attributes : { [ key : string ] : string }, ...children : (XmlNode | false)[]
    )
        : XmlElement
    {
        if (tagName === FragmentSymbol) {
            return XmlFragment.new({
                childNodes  : normalizeXmlStream(children)
            })
        }
        else if (isString(tagName)) {
            return XmlElement.new({
                tagName     : tagName,
                attributes  : attributes,
                childNodes  : normalizeXmlStream(children)
            })
        }
        else {
            return tagName.new({
                attributes  : attributes,
                childNodes  : normalizeXmlStream(children)
            })
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
declare global {
    namespace JSX {
        type Element        = XmlElement

        type ElementClass   = XmlElement

        interface ElementAttributesProperty {
            props
        }

        // https://github.com/microsoft/TypeScript/issues/38108
        // interface ElementChildrenAttribute {
        //     childNodes
        // }
    }
}
