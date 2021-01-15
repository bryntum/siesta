import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Launcher } from "../launcher/Launcher.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { ProjectPlanGroup, ProjectPlanItemDescriptor, ProjectPlanItemFromDescriptor } from "./Plan.js"
import { ProjectDescriptor, ProjectOptions } from "./ProjectOptions.js"


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ ProjectOptions ],
    (base : ClassUnion<typeof ProjectOptions>) => {

    class Project extends base {
        title           : string            = ''

        projectPlan     : ProjectPlanGroup                  = ProjectPlanGroup.new()

        launcherClass   : typeof Launcher   = undefined


        plan (...args : (ProjectPlanItemDescriptor | ProjectPlanItemDescriptor[])[]) {
            const descriptors : ProjectPlanItemDescriptor[]  = args.flat(Number.MAX_SAFE_INTEGER).filter(el => Boolean(el)) as any

            descriptors.forEach(item => this.projectPlan.planItem(ProjectPlanItemFromDescriptor(item)))
        }


        async setup () {
            // if (!this.baseUrl) this.baseUrl = this.buildBaseUrl()

            const desc                  = TestDescriptor.maybeNew(this.testDescriptor)

            desc.url                    = '.'
            desc.title                  = this.title

            this.projectPlan.descriptor = desc
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
