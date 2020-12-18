import { isArray, isString } from "../../util/Typeguards.js"
import { XmlElement, XmlNode, XmlStream } from "./XmlElement.js"


//---------------------------------------------------------------------------------------------------------------------
const FragmentSymbol  = Symbol('Fragment')

const normalizeXmlStream    = (stream : XmlStream[]) : XmlStream => {
    return stream
        .flat(Number.MAX_SAFE_INTEGER)
        .filter(el => el !== false && el !== undefined && el !== null)
        .map(el => {
            if (isString(el) || (el instanceof XmlElement))
                return el
            else
                return String(el)
        })
}


export namespace SiestaJSX {
    export const Fragment = FragmentSymbol

    export function createElement (
        tagName : string | typeof FragmentSymbol, attributes : { [ key : string ] : string }, ...children : XmlStream[]
    )
        : XmlStream
    {
        if (tagName === FragmentSymbol) {
            return normalizeXmlStream(children)
        } else {
            return XmlElement.new({
                tagName     : tagName,
                attributes  : attributes,
                childNodes  : normalizeXmlStream(children) as XmlNode[]
            })
        }
    }

    // is this method needed?
    // export function appendChild (parent : XmlElement, child : false | XmlNode | XmlNode[]) {
    //     if (child === undefined || child === null || child === false) {
    //         // do nothing
    //     } else if (isArray(child)) {
    //         parent.childNodes.push(...child.flat(Number.MAX_SAFE_INTEGER))
    //     } else {
    //         parent.childNodes.push(child)
    //     }
    // }
}


//---------------------------------------------------------------------------------------------------------------------
declare global {
    namespace JSX {
        type Element        = XmlElement
    }
}
