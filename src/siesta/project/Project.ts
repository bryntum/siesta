import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { isNodejs } from "../../util/Helpers.js"
import { Launcher } from "../launcher/Launcher.js"
import { ProjectPlanItemDescriptor, TestDescriptor } from "../test/TestDescriptor.js"
import { ProjectSerializableData, ProjectDescriptor } from "./ProjectDescriptor.js"


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ ProjectDescriptor ],
    (base : ClassUnion<typeof ProjectDescriptor>) => {

    class Project extends base {
        launcherClass           : typeof Launcher           = undefined
        testDescriptorClass     : typeof TestDescriptor     = TestDescriptor


        title                   : string                    = ''

        projectPlan             : TestDescriptor            = this.testDescriptorClass.new()

        planItemT               : ProjectPlanItemDescriptor<InstanceType<this[ 'testDescriptorClass' ]>>


        plan (...args : (this[ 'planItemT' ] | this[ 'planItemT' ][])[]) {
            const descriptors : this[ 'planItemT' ][]  = args.flat(Number.MAX_SAFE_INTEGER).filter(el => Boolean(el)) as any

            descriptors.forEach(item => this.projectPlan.planItem(this.testDescriptorClass.fromProjectPlanItemDescriptor(item)))
        }


        async setup () {
            // if (!this.baseUrl) this.baseUrl = this.buildBaseUrl()

            Object.assign(this.projectPlan, this.testDescriptor, {
                url     : '.',
                title   : this.title
            })
        }


        // buildBaseUrl () : string {
        //     return '.'
        // }


        buildInputArguments () : string[] {
            return []
        }


        async start () {
            await this.setup()

            if (projectExtraction.resolve) {
                projectExtraction.resolve(this)
            } else {
                await (await this.getIsomorphicSelfInstance()).launchStandalone()
            }
        }


        async getIsomorphicSelfInstance () {
            const cls           = await this.getIsomorphicProjectClass()

            const config        = Object.assign({}, this)

            delete config.launcherClass

            return cls.new(config)
        }


        async getIsomorphicProjectClass () : Promise<typeof Project> {
            if (isNodejs())
                return (await import('./ProjectNodejs.js')).ProjectNodejs
            else
                return (await import('./ProjectBrowser.js')).ProjectBrowser
        }


        getStandaloneLauncher () : Launcher {
            const launcher = this.launcherClass.new({
                projectDescriptor       : this.asProjectSerializableData(),

                inputArguments          : this.buildInputArguments()
            })

            return launcher
        }


        async launchStandalone () : Promise<Launcher> {
            const launcher  = this.getStandaloneLauncher()

            await launcher.start()

            return launcher
        }


        asProjectSerializableData () : ProjectSerializableData {
            return ProjectSerializableData.new({
                projectPlan     : this.projectPlan,
                options         : ProjectDescriptor.new(this)
            })
        }
    }

    return Project
}) {}


export const projectExtraction : { resolve : (p : Project) => any } = { resolve : undefined }
