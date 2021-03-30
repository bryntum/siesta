import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { LauncherNodejs } from "../launcher/LauncherNodejs.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { Project } from "./Project.js"
import { ProjectOptionsNodejs } from "./ProjectDescriptor.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectNodejs extends Mixin(
    [ Project, ProjectOptionsNodejs ],
    (base : ClassUnion<typeof Project, typeof ProjectOptionsNodejs>) =>

    class ProjectNodejs extends base {

        launcherClass           : typeof LauncherNodejs         = LauncherNodejs
        testDescriptorClass     : typeof TestDescriptorNodejs   = TestDescriptorNodejs

        // buildBaseUrl () : string {
        //     return '.'
        // }


        buildInputArguments () : string[] {
            return process.argv.slice(2)
        }


        getStandaloneLauncher () : LauncherNodejs {
            const launcher = this.launcherClass.new({
                projectDescriptor       : this.asProjectSerializableData(),

                inputArguments          : this.buildInputArguments(),

                project                 : process.argv[ 1 ]
            })

            return launcher
        }


        // planGlob (globPattern : string, descriptor? : Partial<TestDescriptor>) {
        //     const files = glob.sync(globPattern, { cwd : this.baseDir, matchBase : true, ignore : '**/node_modules/**' })
        //
        //     files.forEach(file => this.planFile(file, descriptor))
        // }
        //
        //
        // planDir (dir : string, descriptor? : Partial<TestDescriptor>) {
        //     const dirname       = path.resolve(this.baseDir, dir)
        //
        //     const planGroup     = this.createPlanGroup(dirname, descriptor)
        //
        //     scanDir(dirname, (entry : fs.Dirent, filename : string) => {
        //         if (/\.t\.m?js$/.test(filename)) this.planFile(filename)
        //     })
        // }
        //
        //
        // planFile (file : string, descriptor? : Partial<TestDescriptor>) {
        //     const filename  = path.resolve(this.baseDir, file)
        //
        //     const stats     = fs.statSync(filename)
        //
        //     if (!stats.isFile()) throw new Error(`Not a file provided to \`planFile\`: ${file}, base dir: ${this.baseDir}`)
        //
        //     const dir       = path.dirname(filename)
        //     const name      = path.basename(filename)
        //
        //     const group     = this.createPlanGroup(dir)
        //
        //     const planItem  = ProjectPlanItem.new({ id : filename, filename: name, url: filename, descriptor, parentItem : group })
        //
        //     group.planItem(planItem)
        // }
    }
) {}
