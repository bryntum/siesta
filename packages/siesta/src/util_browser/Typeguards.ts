import { typeOf } from "../util/Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export const isHTMLIFrameElement = (a : any) : a is HTMLIFrameElement => typeOf(a) === 'HTMLIFrameElement'

export const isHTMLElement = (a : any) : a is HTMLElement => /HTML\w*Element/.test(typeOf(a))

export const isSVGElement = (a : any) : a is SVGElement => /SVG\w*Element/.test(typeOf(a))

export const isShadowRoot = (a : any) : a is ShadowRoot => typeOf(a) === 'ShadowRoot'

