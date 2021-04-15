import { siestaPackageRootUrl } from "../../../index.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { stringify } from "../../serializable/Serializable.js"
import { isNodejs } from "../../util/Helpers.js"
import { Environment, EnvironmentType } from "../common/Environment.js"
import { Launch } from "../launcher/Launch.js"
import { Launcher } from "../launcher/Launcher.js"
import { SiestaProjectExtraction } from "../launcher/ProjectExtractor.js"
import { ProjectPlanItemDescriptor, TestDescriptor } from "../test/TestDescriptor.js"
import { ProjectDescriptor, ProjectSerializableData } from "./ProjectDescriptor.js"


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ ProjectDescriptor ],
    (base : ClassUnion<typeof ProjectDescriptor>) => {

    class Project extends base {
        type                    : EnvironmentType           = 'isomorphic'
        siestaPackageRootUrl    : string                    = siestaPackageRootUrl

        launcherClass           : typeof Launcher           = undefined
        testDescriptorClass     : typeof TestDescriptor     = TestDescriptor


        title                   : string                    = ''

        projectPlan             : TestDescriptor            = this.testDescriptorClass.new()

        planItemT               : ProjectPlanItemDescriptor<InstanceType<this[ 'testDescriptorClass' ]>>


        initialize (props? : Partial<Project>) {
            super.initialize(props)

            const extraction = globalThis.__SIESTA_PROJECT_EXTRACTION__ as SiestaProjectExtraction

            if (extraction) extraction.state   = 'project_created'
        }


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

            const extraction = globalThis.__SIESTA_PROJECT_EXTRACTION__ as SiestaProjectExtraction

            if (extraction) {
                extraction.state   = 'project_created'

                extraction.resolve(this)
            } else {
                await (await this.getIsomorphicSelfInstance()).launchStandalone()
            }
        }


        async getIsomorphicSelfInstance () : Promise<Project> {
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
                projectData             : this.asProjectSerializableData(),

                inputArguments          : this.buildInputArguments()
            })

            return launcher
        }


        async launchStandalone () : Promise<Launch> {
            const launcher  = this.getStandaloneLauncher()

            const launch    = await launcher.start()

            launch && launcher.setExitCode(launch.exitCode)

            return launch
        }


        asProjectSerializableData () : ProjectSerializableData {
            return ProjectSerializableData.new({
                environment             : Environment.detect(),
                siestaPackageRootUrl    : this.siestaPackageRootUrl,
                type                    : this.type,
                projectPlan             : this.projectPlan,
                options                 : ProjectDescriptor.new(this)
            })
        }


        asProjectDataSerialized () : string {
            return stringify(this.asProjectSerializableData())
        }
    }

    return Project
}) {}
