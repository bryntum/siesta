import * as fs from "fs"
import path from "path"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { EnvironmentType } from "../common/Environment.js"
import { LauncherNodejs } from "../launcher/LauncherNodejs.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { Project } from "./Project.js"
import { ProjectDescriptorNodejs } from "./ProjectDescriptor.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectNodejs extends Mixin(
    [ Project, ProjectDescriptorNodejs ],
    (base : ClassUnion<typeof Project, typeof ProjectDescriptorNodejs>) =>

    class ProjectNodejs extends base {
        type                    : EnvironmentType               = 'nodejs'

        launcherClass           : typeof LauncherNodejs         = LauncherNodejs
        testDescriptorClass     : typeof TestDescriptorNodejs   = TestDescriptorNodejs

        descriptorsByAbsPath        : Map<string, TestDescriptor>   = new Map()
        descriptorsByAbsPathGroups  : Map<string, TestDescriptor>   = new Map()

        rootMostPath                : string                        = undefined
        rootMostDesc                : TestDescriptor                = undefined


        initialize (props? : Partial<ProjectNodejs>) {
            super.initialize(props)

            this.descriptorsByAbsPath.set(path.resolve(this.baseUrl), this.projectPlan)
            this.descriptorsByAbsPathGroups.set(path.resolve(this.baseUrl), this.projectPlan)

            this.rootMostPath       = this.baseUrl
            this.rootMostDesc       = this.projectPlan
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
            if (this.rootMostDesc !== this.projectPlan) this.projectPlan.planItem(this.rootMostDesc)
        }


        // planGlob (globPattern : string, descriptor? : Partial<TestDescriptor>) {
        //     const files = glob.sync(globPattern, { cwd : this.baseDir, matchBase : true, ignore : '**/node_modules/**' })
        //
        //     files.forEach(file => this.planFile(file, descriptor))
        // }


        // planDir (dir : string, descriptor? : Partial<TestDescriptor>) {
        //     const dirname       = path.resolve(this.baseDir, dir)
        //
        //     const planGroup     = this.createPlanGroup(dirname, descriptor)
        //
        //     scanDir(dirname, (entry : fs.Dirent, filename : string) => {
        //         if (/\.t\.m?js$/.test(filename)) this.planFile(filename)
        //     })
        // }


        addToPlan (absolute : string, item? : this[ 'planItemT' ]) : TestDescriptor {
            const existingDescriptor    = this.descriptorsByAbsPath.get(absolute)

            if (existingDescriptor) {
                if (item) existingDescriptor.merge(item)

                return existingDescriptor
            }
            else {
                const name          = path.basename(absolute)
                const relative      = path.relative(this.baseUrl, absolute)

                const descriptor    = this.testDescriptorClass.fromProjectPlanItemDescriptor(
                    item ? Object.assign({}, item, { url : relative, filename : name }) : { url : relative, filename : name }
                )

                this.descriptorsByAbsPath.set(absolute, descriptor)

                const dirAbs        = path.dirname(absolute)

                const existingDirDescriptor     = this.descriptorsByAbsPathGroups.get(dirAbs)

                if (existingDirDescriptor) {
                    existingDirDescriptor.planItem(descriptor)
                } else {
                    do {
                        const relativeToRootMost    = path.relative(this.rootMostPath, absolute)

                        if (relativeToRootMost.startsWith('..')) {
                            this.rootMostPath       = path.resolve(this.rootMostPath, '..')

                            this.rootMostDesc       = this.testDescriptorClass.fromProjectPlanItemDescriptor({
                                url : path.relative(this.baseUrl, this.rootMostPath), filename : path.basename(this.rootMostPath)
                            })

                            this.descriptorsByAbsPathGroups.set(this.rootMostPath, this.rootMostDesc)
                            this.descriptorsByAbsPath.set(this.rootMostPath, this.rootMostDesc)
                        }
                        else
                            break
                    } while (true)

                    const dirDesc                   = this.addToPlan(dirAbs)

                    this.descriptorsByAbsPathGroups.set(dirAbs, dirDesc)
                    this.descriptorsByAbsPath.set(dirAbs, dirDesc)

                    dirDesc.planItem(descriptor)
                }

                return descriptor
            }
        }


        planFile (file : string, item? : this[ 'planItemT' ]) {
            const absolute  = path.resolve(this.baseUrl, file)

            const stats     = fs.statSync(absolute)

            if (!stats.isFile()) throw new Error(`Not a file provided to \`planFile\`: ${ file }, base dir: ${ this.baseUrl }`)

            this.addToPlan(absolute, item)
        }
    }
) {}
