import { isArray } from "../../util/Typeguards.js"
import { XmlElement, XmlNode, XmlStream } from "./XmlElement.js"


//---------------------------------------------------------------------------------------------------------------------
const FragmentSymbol  = Symbol('Fragment')


export namespace SiestaJSX {
    export const Fragment = FragmentSymbol

    export function createElement (
        tagName : string | typeof FragmentSymbol, attributes : { [ key : string ] : string }, ...children : XmlStream[]
    )
        : XmlStream
    {
        if (tagName === FragmentSymbol) {
            return children
        } else {
            return XmlElement.new({ tagName : tagName, attributes : attributes, childNodes : children.flat(Number.MAX_SAFE_INTEGER) })
        }
    }


    export function appendChild (parent : XmlElement, child : false | XmlNode | XmlNode[]) {
        if (child === undefined || child === null || child === false) {
            // do nothing
        } else if (isArray(child)) {
            parent.childNodes.push(...child.flat(Number.MAX_SAFE_INTEGER))
        } else {
            parent.childNodes.push(child)
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
declare global {
    namespace JSX {
        type Element        = XmlStream
    }
}
