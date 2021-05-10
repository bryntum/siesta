import fs from "fs"
import glob from "glob"
import path from "path"
import { scanDir } from "../../util_nodejs/FileSystem.js"
import { Runtime } from "./Runtime.js"

//---------------------------------------------------------------------------------------------------------------------
export class RuntimeNodejs extends Runtime {

    get inputArguments () : string[] {
        return process.argv.slice(2)
    }


    get scriptUrl () : string {
        return process.argv[ 1 ]
    }


    pathResolve (...segments : string[]) : string {
        return path.resolve(...segments)
    }


    pathRelative (baseUrl : string, url : string) : string {
        return path.relative(baseUrl, url)
    }


    isFile (url : string) : boolean {
        const stats     = fs.statSync(url)

        return stats.isFile()
    }


    isDirectory (url : string) : boolean {
        const stats     = fs.statSync(url)

        return stats.isDirectory()
    }


    scanDirSync (url : string, forEach : (fileName : string) => any) {
        scanDir(url, (entry : fs.Dirent, fileName : string) => {
            if (/\.t\.m?js$/.test(fileName)) forEach(fileName)
        })
    }


    expandGlobSync (globPattern : string, rootDir : string) : Iterable<string> {
        return glob.sync(globPattern, { cwd : rootDir, absolute : true, matchBase : true, ignore : [ '**/node_modules/**' ] })
    }
}
