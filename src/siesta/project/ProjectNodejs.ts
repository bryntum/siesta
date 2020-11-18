import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { scanDir } from "../../util_nodejs/FileSystem.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { ProjectPlanItem } from "./Plan.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectNodejs extends Mixin(
    [ Project ],
    (base : ClassUnion<typeof Project>) =>

    class ProjectNodejs extends base {
        // baseDir         : string            = path.dirname(process.argv[ 1 ])
        //
        //
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