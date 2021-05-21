import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { isDeno, isNodejs } from "../../util/Helpers.js"

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


    isGlob (str : string) : boolean {
        throw new Error("Abstract method")
    }


    fileURLToPath (url : string) : string {
        throw new Error("Abstract method")
    }


    cwd () : string {
        throw new Error("Abstract method")
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class HasRuntimeAccess extends Mixin(
    [],
    (base : ClassUnion) =>

    class HasRuntimeAccess extends base {
        runtimeClass            : typeof Runtime        = Runtime

        $runtime                : Runtime               = undefined

        get runtime () : Runtime {
            if (this.$runtime !== undefined) return this.$runtime

            return this.$runtime    = this.runtimeClass.new()
        }

        set runtime (value : Runtime) {
            this.$runtime           = value
        }


        async getRuntimeClass () : Promise<typeof Runtime> {
            if (isNodejs())
                return (await import(''.concat('./RuntimeNodejs.js'))).RuntimeNodejs
            else if (isDeno())
                return (await import(''.concat('./RuntimeDeno.js'))).RuntimeDeno
            else
                return (await import('./RuntimeBrowser.js')).RuntimeBrowser
        }
    }
) {}
