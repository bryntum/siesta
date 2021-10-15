import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { stripBasename, stripDirname } from "../../util/Path.js"
import { LauncherTerminal } from "../launcher/LauncherTerminal.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { Project } from "./Project.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ProjectTerminal extends Mixin(
    [ Project ],
    (base : ClassUnion<typeof Project>) =>

    class ProjectTerminal extends base {
        launcherClass               : typeof LauncherTerminal       = LauncherTerminal

        descriptorsByAbsPath        : Map<string, TestDescriptor>   = new Map()

        rootMostPath                : string                        = undefined
        rootMostDesc                : TestDescriptor                = undefined


        initialize (props? : Partial<ProjectTerminal>) {
            super.initialize(props)

            this.descriptorsByAbsPath.set(this.runtime.pathResolve(this.baseUrl), this.projectPlan)

            this.rootMostPath       = this.baseUrl
            this.rootMostDesc       = this.projectPlan
        }


        async finalizePlan () {
            await super.finalizePlan()

            // append the "root most" descriptor (which is outside of the project dir)
            // as a child to the root descriptor with the relative path like "../../something"
            if (this.rootMostDesc !== this.projectPlan) {
                this.projectPlan.planItem(this.rootMostDesc)
            }
            else {
                // if there were no calls to "plan*" methods, plan the whole project directory by default
                if (!this.hasPlan) this.planDir(this.baseUrl)
            }
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
                const name          = stripDirname(absolute)

                const descriptor    = this.testDescriptorClass.fromProjectPlanItemDescriptor(
                    item ? Object.assign({}, item, { filename : name }) : { filename : name }
                )

                this.descriptorsByAbsPath.set(absolute, descriptor)

                const dirAbs        = stripBasename(absolute, false)

                const existingDirDescriptor     = this.descriptorsByAbsPath.get(dirAbs)

                if (existingDirDescriptor) {
                    existingDirDescriptor.planItem(descriptor)
                } else {
                    do {
                        const relativeToRootMost    = this.runtime.pathRelative(this.rootMostPath, absolute)

                        if (relativeToRootMost.startsWith('..')) {
                            this.rootMostPath       = this.runtime.pathResolve(this.rootMostPath, '..')

                            this.rootMostDesc       = this.testDescriptorClass.fromProjectPlanItemDescriptor({
                                url : this.rootMostPath, filename : stripDirname(this.rootMostPath)
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

        /**
         * This method adds a specific test file into the project plan. The file path is resolved relative to the project file.
         * The intermediate entries for the directories, containing the file, will be created as well.
         *
         * The test descriptor, passed to this method will be assigned directly to the test file entry.
         * This means any configuration properties in it will overwrite corresponding properties from the parent entries.
         *
         * See also [[planDir]], [[planGlob]]
         *
         * @param filePath
         * @param desc
         */
        planFile (filePath : string, desc? : Partial<TestDescriptor>) {
            this.hasPlan                = true

            const absolute  = this.runtime.pathResolve(this.baseUrl, filePath)

            if (!this.runtime.isFile(absolute)) throw new Error(`Not a file provided to \`planFile\`: ${ filePath }, project dir: ${ this.baseUrl }`)

            this.addToPlan(absolute, desc)
        }

        /**
         * An alias for [[planFile]]
         *
         * @param file
         * @param desc
         */
        includeFile (file : string, desc? : Partial<TestDescriptor>) {
            this.planFile(file, desc)
        }

        /**
         * This method excludes a specific file from the project plan. The file path is resolved relative to the project file.
         *
         * See also [[excludeDir]], [[excludeGlob]]
         *
         * @param file
         */
        excludeFile (file : string) {
            const absolute  = this.runtime.pathResolve(this.baseUrl, file)

            if (!this.runtime.isFile(absolute)) throw new Error(`Not a file provided to \`excludeFile\`: ${ file }, project dir: ${ this.baseUrl }`)

            this.removeFromPlan(absolute)
        }

        /**
         * This method adds all `*.t.m?js` test files in the `dir` directory into the project plan, recursively.
         * The dir path is resolved relative to the project file.
         *
         * The test descriptor, passed to this method will be assigned to the directory entry.
         * This means any configuration properties in it will be "inherited" by the individual test files.
         * Test files may still define some configs explicitly, overwriting the "inherited" values.
         *
         * See also [[planFile]], [[planGlob]]
         *
         * @param dir
         * @param desc
         */
        planDir (dir : string, desc? : Partial<TestDescriptor>) {
            this.hasPlan                = true

            const absolute  = this.runtime.pathResolve(this.baseUrl, dir)

            if (!this.runtime.isDirectory(absolute)) throw new Error(`Not a directory provided to \`planDir\`: ${ dir }, project dir: ${ this.baseUrl }`)

            this.addToPlan(absolute, desc)

            this.runtime.scanDirSync(absolute, (filename : string) => {
                if (/\.t\.m?js$/.test(filename)) this.addToPlan(filename)
            })
        }

        /**
         * An alias for [[planDir]]
         *
         * @param dir
         * @param desc
         */
        includeDir (dir : string, desc? : Partial<TestDescriptor>) {
            this.planDir(dir, desc)
        }

        /**
         * This method excludes all `*.t.m?js` test files in the `dir` directory from the project plan, recursively.
         * The dir path is resolved relative to the project file.
         *
         * See also [[excludeFile]], [[excludeGlob]]
         *
         * @param dir
         */
        excludeDir (dir : string) {
            const absolute  = this.runtime.pathResolve(this.baseUrl, dir)

            if (!this.runtime.isDirectory(absolute)) throw new Error(`Not a directory provided to \`planDir\`: ${ dir }, project dir: ${ this.baseUrl }`)

            this.removeFromPlan(absolute)
        }

        /**
         * This method adds all files, matching the `globPattern` into the project plan.
         * The glob matching happens in the project file directory.
         *
         * The test descriptor, passed to this method will be assigned directly to each matching test file entry.
         * This means any configuration properties in it will overwrite ones from the parent plan entries.
         *
         * See also [[planFile]], [[planDir]]
         */
        planGlob (globPattern : string, desc? : Partial<TestDescriptor>) {
            this.hasPlan                = true

            for (const file of this.runtime.expandGlobSync(globPattern, this.baseUrl)) {
                this.addToPlan(file, desc)
            }
        }

        /**
         * An alias for [[planGlob]]
         */
        includeGlob (globPattern : string, desc? : Partial<TestDescriptor>) {
            this.planGlob(globPattern, desc)
        }

        /**
         * This method excludes all files, matching the `globPattern` from the project plan.
         * The glob matching happens in the project file directory.
         *
         * See also [[excludeFile]], [[excludeDir]]
         */
        excludeGlob (globPattern : string) {
            for (const file of this.runtime.expandGlobSync(globPattern, this.baseUrl)) {
                this.removeFromPlan(file)
            }
        }
    }
) {}
