import { serializable } from "../../serializable/Serializable.js"
import { option } from "../launcher/Option.js"
import { TestDescriptor } from "./TestDescriptor.js"

//---------------------------------------------------------------------------------------------------------------------
export type PreloadDescriptor = string
    | { type? : 'js' | 'css', url : string }
    | { code : string | Function }
    | PreloadDescriptor[]


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class TestDescriptorBrowser extends TestDescriptor {
    @option()
    preload             : PreloadDescriptor[]       = []

    @option()
    alsoPreload         : PreloadDescriptor[]       = []

    @option()
    pageUrl             : string                    = ''
}

