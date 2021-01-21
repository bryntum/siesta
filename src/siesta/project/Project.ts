import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Launcher } from "../launcher/Launcher.js"
import { ProjectPlanItemDescriptor, TestDescriptor } from "../test/TestDescriptor.js"
import { ProjectDescriptor, ProjectOptions } from "./ProjectOptions.js"


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ ProjectOptions ],
    (base : ClassUnion<typeof ProjectOptions>) => {

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
                await this.launchStandalone()
            }
        }


        async launchStandalone () : Promise<Launcher> {
            const launcher  = this.launcherClass.new({
                projectDescriptor       : this.asProjectDescriptor(),

                inputArguments          : this.buildInputArguments()
            })

            await launcher.start()

            return launcher
        }


        asProjectDescriptor () : ProjectDescriptor {
            return ProjectDescriptor.new({
                projectPlan     : this.projectPlan,
                options         : ProjectOptions.new(this)
            })
        }
    }

    return Project
}) {}


export const projectExtraction : { resolve : (p : Project) => any } = { resolve : undefined }
