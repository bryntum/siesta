import fs from "fs"
import glob from "glob"
import path from "path"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { stripBasename } from "../../util/Path.js"
import { scanDir } from "../../util_nodejs/FileSystem.js"
import { EnvironmentType } from "../common/Environment.js"
import { LauncherNodejs } from "../launcher/LauncherNodejs.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { Project } from "./Project.js"
import { ProjectDescriptorNodejs } from "./ProjectDescriptor.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * Siesta project for [Node.js](https://nodejs.org/) code.
 */
export class ProjectNodejs extends Mixin(
    [ Project, ProjectDescriptorNodejs ],
    (base : ClassUnion<typeof Project, typeof ProjectDescriptorNodejs>) =>

    class ProjectNodejs extends base {
        type                    : EnvironmentType               = 'nodejs'

        launcherClass           : typeof LauncherNodejs         = LauncherNodejs
        testDescriptorClass     : typeof TestDescriptorNodejs   = TestDescriptorNodejs

        descriptorsByAbsPath        : Map<string, TestDescriptor>   = new Map()

        rootMostPath                : string                        = undefined
        rootMostDesc                : TestDescriptor                = undefined

        hasPlan                     : boolean                       = false


        initialize (props? : Partial<ProjectNodejs>) {
            super.initialize(props)

            this.descriptorsByAbsPath.set(path.resolve(this.baseUrl), this.projectPlan)

            this.rootMostPath       = this.baseUrl
            this.rootMostDesc       = this.projectPlan

            this.projectPlan.url    = this.baseUrl
        }


        buildBaseUrl () : string {
            return stripBasename(process.argv[ 1 ])
        }


        buildInputArguments () : string[] {
            return process.argv.slice(2)
        }


        async getIsomorphicSelfInstance () : Promise<ProjectNodejs> {
            return this
        }


        getStandaloneLauncher () : LauncherNodejs {
            const launcher = this.launcherClass.new({
                projectData             : this.asProjectSerializableData(),

                inputArguments          : this.buildInputArguments(),

                project                 : process.argv[ 1 ]
            })

            return launcher
        }


        finalizePlan () {
            // append the "root most" descriptor (which is outside of the project dir)
            // as a child to the root descriptor with the relative path like "../../something"
            if (this.rootMostDesc !== this.projectPlan) {
                this.projectPlan.planItem(this.rootMostDesc)
            }
            else {
                // if there were no calls to "plan*" methods, plan the whole project directory by default
                if (!this.hasPlan) this.planDir(path.dirname(this.baseUrl))
            }
        }


        async start () {
            this.finalizePlan()

            await super.start()
        }


        removeFromPlan (absolute : string) {
            const existingDescriptor    = this.descriptorsByAbsPath.get(absolute)

            if (!existingDescriptor) return

            existingDescriptor.parentNode.removeItem(existingDescriptor)
        }


        addToPlan (absolute : string, item? : Partial<TestDescriptor>) : TestDescriptor {
            const existingDescriptor    = this.descriptorsByAbsPath.get(absolute)

            if (existingDescriptor) {
                if (item) existingDescriptor.merge(item)

                return existingDescriptor
            }
            else {
                const name          = path.basename(absolute)
                const relative      = path.relative(this.baseUrl, absolute)

                const descriptor    = this.testDescriptorClass.fromProjectPlanItemDescriptor(
                    item ? Object.assign({}, item, { filename : name }) : { filename : name }
                )

                this.descriptorsByAbsPath.set(absolute, descriptor)

                const dirAbs        = path.dirname(absolute)

                const existingDirDescriptor     = this.descriptorsByAbsPath.get(dirAbs)

                if (existingDirDescriptor) {
                    existingDirDescriptor.planItem(descriptor)
                } else {
                    do {
                        const relativeToRootMost    = path.relative(this.rootMostPath, absolute)

                        if (relativeToRootMost.startsWith('..')) {
                            this.rootMostPath       = path.resolve(this.rootMostPath, '..')

                            this.rootMostDesc       = this.testDescriptorClass.fromProjectPlanItemDescriptor({
                                url : this.rootMostPath, filename : path.basename(this.rootMostPath)
                            })

                            this.descriptorsByAbsPath.set(this.rootMostPath, this.rootMostDesc)
                        }
                        else
                            break
                    } while (true)

                    const dirDesc                   = this.addToPlan(dirAbs)

                    this.descriptorsByAbsPath.set(dirAbs, dirDesc)

                    dirDesc.planItem(descriptor)
                }

                return descriptor
            }
        }


        plan (...items : (this[ 'planItemT' ] | this[ 'planItemT' ][])[]) {
            this.hasPlan                = true

            super.plan(...items)
        }


        planFile (file : string, desc? : Partial<TestDescriptor>) {
            this.hasPlan                = true

            const absolute  = path.resolve(this.baseUrl, file)

            const stats     = fs.statSync(absolute)

            if (!stats.isFile()) throw new Error(`Not a file provided to \`planFile\`: ${ file }, project dir: ${ this.baseUrl }`)

            this.addToPlan(absolute, desc)
        }


        includeFile (file : string, desc? : Partial<TestDescriptor>) {
            this.planFile(file, desc)
        }


        excludeFile (file : string) {
            const absolute  = path.resolve(this.baseUrl, file)

            const stats     = fs.statSync(absolute)

            if (!stats.isFile()) throw new Error(`Not a file provided to \`excludeFile\`: ${ file }, project dir: ${ this.baseUrl }`)

            this.removeFromPlan(absolute)
        }


        planDir (dir : string, desc? : Partial<TestDescriptor>) {
            this.hasPlan                = true

            const absolute  = path.resolve(this.baseUrl, dir)

            const stats     = fs.statSync(absolute)

            if (!stats.isDirectory()) throw new Error(`Not a directory provided to \`planDir\`: ${ dir }, project dir: ${ this.baseUrl }`)

            this.addToPlan(absolute, desc)

            scanDir(absolute, (entry : fs.Dirent, filename : string) => {
                if (/\.t\.m?js$/.test(filename)) this.addToPlan(filename)
            })
        }


        includeDir (dir : string, desc? : Partial<TestDescriptor>) {
            this.planDir(dir, desc)
        }


        excludeDir (dir : string) {
            const absolute  = path.resolve(this.baseUrl, dir)

            const stats     = fs.statSync(absolute)

            if (!stats.isDirectory()) throw new Error(`Not a directory provided to \`planDir\`: ${ dir }, project dir: ${ this.baseUrl }`)

            this.removeFromPlan(absolute)
        }


        planGlob (globPattern : string, desc? : Partial<TestDescriptor>) {
            this.hasPlan                = true

            const files = glob.sync(globPattern, { cwd : this.baseUrl, absolute : true, matchBase : true, ignore : [ '**/node_modules/**' ] })

            files.forEach(file => this.addToPlan(file, desc))
        }


        includeGlob (globPattern : string, desc? : Partial<TestDescriptor>) {
            this.planGlob(globPattern, desc)
        }


        excludeGlob (globPattern : string) {
            const files = glob.sync(globPattern, { cwd : this.baseUrl, absolute : true, matchBase : true, ignore : [ '**/node_modules/**' ] })

            files.forEach(file => this.removeFromPlan(file))
        }
    }
) {}
