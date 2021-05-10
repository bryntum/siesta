// @ts-ignore
import * as path from "https://deno.land/std@0.94.0/path/mod.ts"
// @ts-ignore
import * as fs from "https://deno.land/std@0.95.0/fs/expand_glob.ts"
import { Runtime } from "./Runtime.js"

//---------------------------------------------------------------------------------------------------------------------
declare const Deno


//---------------------------------------------------------------------------------------------------------------------
export class RuntimeDeno extends Runtime {

    get inputArguments () : string[] {
        return Deno.args
    }


    get scriptUrl () : string {
        return path.fromFileUrl(Deno.mainModule)
    }


    pathResolve (...segments : string[]) : string {
        return path.resolve(...segments)
    }


    pathRelative (baseUrl : string, url : string) : string {
        return path.relative(baseUrl, url)
    }


    isFile (url : string) : boolean {
        return Deno.statSync(url).isFile
    }


    isDirectory (url : string) : boolean {
        return Deno.statSync(url).isDirectory
    }


    scanDirSync (url : string, forEach : (fileName : string) => any) {
        for (const entry of fs.walkSync(url)) {
            if (entry.isFile) forEach(entry.path)
        }
    }


    expandGlobSync (globPattern : string, rootDir : string) : Iterable<string> {
        return fs.expandGlobSync(
            globPattern,
            { root : rootDir, extended : true, globstar : true, exclude : [ '**/node_modules/**' ], includeDirs : false }
        )
    }
}
