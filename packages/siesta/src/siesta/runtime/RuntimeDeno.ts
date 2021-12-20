// @ts-ignore
import fse from "https://esm.sh/fs-extra"
// @ts-ignore
import * as path from "https://deno.land/std@0.111.0/path/mod.ts"
// @ts-ignore
import { expandGlobSync } from "https://deno.land/std@0.111.0/fs/mod.ts"
import { CI } from "../../iterator/Iterator.js"
import { Runtime } from "./Runtime.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
declare const Deno


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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


    scanDirSync (dir : string, forEach : (fileName : string) => any, ignore : RegExp = /^node_modules$/) {
        const entries : { name : string, isDirectory : boolean, isFile : boolean }[]  = Array.from(Deno.readDirSync(dir))

        entries.sort((entry1, entry2) => entry1.name < entry2.name ? -1 : entry1.name > entry2.name ? 1 : 0)

        for (let i = 0; i < entries.length; i++) {
            const entry     = entries[ i ]

            if (entry.isDirectory && (!ignore || !ignore.test(entry.name))) {
                if (this.scanDirSync(this.pathResolve(dir, entry.name), forEach) === false) return false
            }
            else if (entry.isFile) {
                if (forEach(this.pathResolve(dir, entry.name)) === false) return false
            }
        }
    }


    expandGlobSync (globPattern : string, rootDir : string) : Iterable<string> {
        return CI(expandGlobSync(
            globPattern,
            { root : rootDir, extended : true, globstar : true, exclude : [ '**/node_modules/**' ], includeDirs : false }
        )).map((entry : { path : string }) => entry.path)
    }


    isGlob (str : string) : boolean {
        return path.isGlob(str)
    }


    fileURLToPath (url : string) : string {
        return path.fromFileUrl(url)
    }


    cwd () : string {
        return Deno.cwd()
    }


    async writeToFile (file : string, content : string) {
        await fse.outputFile(file, content, 'utf-8')
    }


    async copyFile (source : string, destination : string) {
        await fse.copy(source, destination, { overwrite : true })
    }


    async copyDir (source : string, destination : string) {
        await fse.copy(source, destination, { overwrite : true })
    }
}
