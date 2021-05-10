import { Base } from "../../class/Base.js"

//---------------------------------------------------------------------------------------------------------------------
export class Runtime extends Base {

    get inputArguments () : string[] {
        throw new Error("Abstract method")
    }


    get scriptUrl () : string {
        throw new Error("Abstract method")
    }


    pathResolve (...segments : string[]) : string {
        throw new Error("Abstract method")
    }


    pathRelative (baseUrl : string, url : string) : string {
        throw new Error("Abstract method")
    }


    isFile (url : string) : boolean {
        throw new Error("Abstract method")
    }


    isDirectory (url : string) : boolean {
        throw new Error("Abstract method")
    }


    scanDirSync (url : string, forEach : (fileName : string) => any) {
        throw new Error("Abstract method")
    }


    expandGlobSync (globPattern : string, rootDir : string) : Iterable<string> {
        throw new Error("Abstract method")
    }
}
