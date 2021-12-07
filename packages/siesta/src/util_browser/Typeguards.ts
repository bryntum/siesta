import { typeOf } from "../util/Helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isHTMLIFrameElement = (a : any) : a is HTMLIFrameElement => typeOf(a) === 'HTMLIFrameElement'

export const isSameDomainHTMLIFrameElement = (a : any) : a is HTMLIFrameElement =>
    typeOf(a) === 'HTMLIFrameElement' && Boolean(a.contentDocument)

export const isHTMLInputElement = (a : any) : a is HTMLInputElement => typeOf(a) === 'HTMLInputElement'
export const isHTMLScriptElement = (a : any) : a is HTMLScriptElement => typeOf(a) === 'HTMLScriptElement'
export const isHTMLLinkElement = (a : any) : a is HTMLLinkElement => typeOf(a) === 'HTMLLinkElement'
export const isHTMLImageElement = (a : any) : a is HTMLImageElement => typeOf(a) === 'HTMLImageElement'

export const isHTMLElement = (a : any) : a is HTMLElement => /HTML\w*Element/.test(typeOf(a))

export const isSVGElement = (a : any) : a is SVGElement => /SVG\w*Element/.test(typeOf(a))

export const isSVGGraphicsElement = (a : any) : a is SVGGraphicsElement => isSVGElement(a) && Boolean((a as any).getBBox)

export const isElement = (a : any) : a is Element => /^(HTML|SVG)\w*Element/.test(typeOf(a))

export const isShadowRoot = (a : any) : a is ShadowRoot => typeOf(a) === 'ShadowRoot'

export const isDocument = (a : any) : a is Document => typeOf(a) === 'HTMLDocument'
