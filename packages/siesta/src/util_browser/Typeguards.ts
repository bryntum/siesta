import { typeOf } from "../util/Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export const isHTMLIFrameElement = (a : any) : a is HTMLIFrameElement => typeOf(a) === 'HTMLIFrameElement'

export const isShadowRoot = (a : any) : a is ShadowRoot => typeOf(a) === 'ShadowRoot'

