// @ts-ignore
import * as path from "https://deno.land/std@0.94.0/path/mod.ts"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { stripBasename } from "../../util/Path.js"
import { EnvironmentType } from "../common/Environment.js"
import { LauncherDeno } from "../launcher/LauncherDeno.js"
import { TestDescriptorDeno } from "../test/TestDescriptorDeno.js"
import { Project } from "./Project.js"
import { ProjectDescriptorDeno } from "./ProjectDescriptor.js"

//---------------------------------------------------------------------------------------------------------------------
declare const Deno

//---------------------------------------------------------------------------------------------------------------------
/**
 * Siesta project for [Deno](https://deno.land/) code.
 */
export class ProjectDeno extends Mixin(
    [ Project, ProjectDescriptorDeno ],
    (base : ClassUnion<typeof Project, typeof ProjectDescriptorDeno>) =>

    class ProjectDeno extends base {
        type                    : EnvironmentType                   = 'deno'

        launcherClass           : typeof LauncherDeno               = LauncherDeno
        testDescriptorClass     : typeof TestDescriptorDeno         = TestDescriptorDeno

        // descriptorsByAbsPath        : Map<string, TestDescriptor>   = new Map()
        //
        // rootMostPath                : string                        = undefined
        // rootMostDesc                : TestDescriptor                = undefined
        //
        // hasPlan                     : boolean                       = false


        initialize (props? : Partial<ProjectDeno>) {
            super.initialize(props)

            // this.descriptorsByAbsPath.set(path.resolve(this.baseUrl), this.projectPlan)
            //
            // this.rootMostPath       = this.baseUrl
            // this.rootMostDesc       = this.projectPlan

            this.projectPlan.url    = this.baseUrl
        }


        buildBaseUrl () : string {
            return stripBasename(path.fromFileUrl(Deno.mainModule))
        }


        buildInputArguments () : string[] {
            return Deno.args
        }


        async getIsomorphicSelfInstance () : Promise<ProjectDeno> {
            return this
        }


        getStandaloneLauncher () : LauncherDeno {
            const launcher = this.launcherClass.new({
                projectData             : this.asProjectSerializableData(),

                inputArguments          : this.buildInputArguments(),

                project                 : path.fromFileUrl(Deno.mainModule)
            })

            return launcher
        }


        finalizePlan () {
            // // append the "root most" descriptor (which is outside of the project dir)
            // // as a child to the root descriptor with the relative path like "../../something"
            // if (this.rootMostDesc !== this.projectPlan) {
            //     this.projectPlan.planItem(this.rootMostDesc)
            // }
            // else {
            //     // if there were no calls to "plan*" methods, plan the whole project directory by default
            //     if (!this.hasPlan) this.planDir(path.dirname(this.baseUrl))
            // }
        }


        async start () {
            this.finalizePlan()

            await super.start()
        }


        // removeFromPlan (absolute : string) {
        //     const existingDescriptor    = this.descriptorsByAbsPath.get(absolute)
        //
        //     if (!existingDescriptor) return
        //
        //     existingDescriptor.parentNode.removeItem(existingDescriptor)
        // }
        //
        //
        // addToPlan (absolute : string, item? : Partial<TestDescriptor>) : TestDescriptor {
        //     const existingDescriptor    = this.descriptorsByAbsPath.get(absolute)
        //
        //     if (existingDescriptor) {
        //         if (item) existingDescriptor.merge(item)
        //
        //         return existingDescriptor
        //     }
        //     else {
        //         const name          = path.basename(absolute)
        //         const relative      = path.relative(this.baseUrl, absolute)
        //
        //         const descriptor    = this.testDescriptorClass.fromProjectPlanItemDescriptor(
        //             item ? Object.assign({}, item, { url : relative, filename : name }) : { url : relative, filename : name }
        //         )
        //
        //         this.descriptorsByAbsPath.set(absolute, descriptor)
        //
        //         const dirAbs        = path.dirname(absolute)
        //
        //         const existingDirDescriptor     = this.descriptorsByAbsPath.get(dirAbs)
        //
        //         if (existingDirDescriptor) {
        //             existingDirDescriptor.planItem(descriptor)
        //         } else {
        //             do {
        //                 const relativeToRootMost    = path.relative(this.rootMostPath, absolute)
        //
        //                 if (relativeToRootMost.startsWith('..')) {
        //                     this.rootMostPath       = path.resolve(this.rootMostPath, '..')
        //
        //                     this.rootMostDesc       = this.testDescriptorClass.fromProjectPlanItemDescriptor({
        //                         url : path.relative(this.baseUrl, this.rootMostPath), filename : path.basename(this.rootMostPath)
        //                     })
        //
        //                     this.descriptorsByAbsPath.set(this.rootMostPath, this.rootMostDesc)
        //                 }
        //                 else
        //                     break
        //             } while (true)
        //
        //             const dirDesc                   = this.addToPlan(dirAbs)
        //
        //             this.descriptorsByAbsPath.set(dirAbs, dirDesc)
        //
        //             dirDesc.planItem(descriptor)
        //         }
        //
        //         return descriptor
        //     }
        // }
        //
        //
        // plan (...items : (this[ 'planItemT' ] | this[ 'planItemT' ][])[]) {
        //     this.hasPlan                = true
        //
        //     super.plan(...items)
        // }
        //
        //
        // planFile (file : string, desc? : Partial<TestDescriptor>) {
        //     this.hasPlan                = true
        //
        //     const absolute  = path.resolve(this.baseUrl, file)
        //
        //     const stats     = fs.statSync(absolute)
        //
        //     if (!stats.isFile()) throw new Error(`Not a file provided to \`planFile\`: ${ file }, project dir: ${ this.baseUrl }`)
        //
        //     this.addToPlan(absolute, desc)
        // }
        //
        //
        // includeFile (file : string, desc? : Partial<TestDescriptor>) {
        //     this.planFile(file, desc)
        // }
        //
        //
        // excludeFile (file : string) {
        //     const absolute  = path.resolve(this.baseUrl, file)
        //
        //     const stats     = fs.statSync(absolute)
        //
        //     if (!stats.isFile()) throw new Error(`Not a file provided to \`excludeFile\`: ${ file }, project dir: ${ this.baseUrl }`)
        //
        //     this.removeFromPlan(absolute)
        // }
        //
        //
        // planDir (dir : string, desc? : Partial<TestDescriptor>) {
        //     this.hasPlan                = true
        //
        //     const absolute  = path.resolve(this.baseUrl, dir)
        //
        //     const stats     = fs.statSync(absolute)
        //
        //     if (!stats.isDirectory()) throw new Error(`Not a directory provided to \`planDir\`: ${ dir }, project dir: ${ this.baseUrl }`)
        //
        //     this.addToPlan(absolute, desc)
        //
        //     scanDir(absolute, (entry : fs.Dirent, filename : string) => {
        //         if (/\.t\.m?js$/.test(filename)) this.addToPlan(filename)
        //     })
        // }
        //
        //
        // includeDir (dir : string, desc? : Partial<TestDescriptor>) {
        //     this.planDir(dir, desc)
        // }
        //
        //
        // excludeDir (dir : string) {
        //     const absolute  = path.resolve(this.baseUrl, dir)
        //
        //     const stats     = fs.statSync(absolute)
        //
        //     if (!stats.isDirectory()) throw new Error(`Not a directory provided to \`planDir\`: ${ dir }, project dir: ${ this.baseUrl }`)
        //
        //     this.removeFromPlan(absolute)
        // }
        //
        //
        // planGlob (globPattern : string, desc? : Partial<TestDescriptor>) {
        //     this.hasPlan                = true
        //
        //     const files = fg.sync(globPattern, { cwd : this.baseUrl, absolute : true, baseNameMatch : true, ignore : [ '**/node_modules/**' ] })
        //
        //     files.forEach(file => this.addToPlan(file, desc))
        // }
        //
        //
        // includeGlob (globPattern : string, desc? : Partial<TestDescriptor>) {
        //     this.planGlob(globPattern, desc)
        // }
        //
        //
        // excludeGlob (globPattern : string) {
        //     const files = fg.sync(globPattern, { cwd : this.baseUrl, absolute : true, baseNameMatch : true, ignore : [ '**/node_modules/**' ] })
        //
        //     files.forEach(file => this.removeFromPlan(file))
        // }
    }
) {}
