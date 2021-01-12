import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { include, serializable, Serializable } from "../../serializable/Serializable.js"
import { Launch } from "../launcher/Launch.js"
import { HasOptions, option } from "../launcher/Option.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { ProjectPlanGroup, ProjectPlanItem, ProjectPlanItemDescriptor, ProjectPlanItemFromDescriptor } from "./Plan.js"


//---------------------------------------------------------------------------------------------------------------------
@serializable({ mode : 'optIn' })
export class ProjectOptions extends Mixin(
    [ Serializable, HasOptions, Base ],
    (base : ClassUnion<typeof Serializable, typeof HasOptions, typeof Base>) => {

    class ProjectOptions extends base {
        @include()
        @option({ type : 'boolean' })
        noColor         : boolean           = false
    }

    return ProjectOptions
}) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class ProjectDescriptor extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) => {

    class ProjectDescriptor extends base {
        projectPlan     : ProjectPlanGroup          = undefined

        options         : ProjectOptions            = undefined
    }

    return ProjectDescriptor
}) {}


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ ProjectOptions ],
    (base : ClassUnion<typeof ProjectOptions>) => {

    class Project extends base {
        baseUrl         : string            = ''

        title           : string            = ''

        testDescriptor  : Partial<TestDescriptor>           = undefined

        projectPlan     : ProjectPlanGroup                  = ProjectPlanGroup.new()

        setupDone       : boolean           = false
        setupPromise    : Promise<any>      = undefined


        // createPlanGroup (dir : string, descriptor? : Partial<TestDescriptor>) : ProjectPlanGroup {
        //     const existing      = this.projectPlanMap.get(dir)
        //
        //     if (existing) {
        //         if (existing instanceof ProjectPlanGroup) {
        //             if (descriptor) existing.descriptor.merge(descriptor)
        //
        //             return existing
        //         } else
        //             throw new Error("Plan group already declared as file")
        //     }
        //
        //     const newGroup = ProjectPlanGroup.new({ id : dir, filename : dir, url : dir, descriptor : TestDescriptor.maybeNew(descriptor) })
        //
        //     this.projectPlanMap.set(newGroup.id, newGroup)
        //
        //     return newGroup
        // }


        plan (...args : (ProjectPlanItemDescriptor | ProjectPlanItemDescriptor[])[]) {
            const descriptors : ProjectPlanItemDescriptor[]  = args.flat(Number.MAX_SAFE_INTEGER).filter(el => Boolean(el)) as any

            descriptors.forEach(item => this.projectPlan.planItem(ProjectPlanItemFromDescriptor(item)))
        }


        async performSetup ()  {
            if (!this.setupDone) {
                // setup may be already started (by another launch)
                await (this.setupPromise || (this.setupPromise = this.setup()))

                this.setupDone      = true
                this.setupPromise   = undefined
            }
        }


        async setup () {
            if (!this.baseUrl) this.baseUrl = this.buildBaseUrl()

            const desc                  = TestDescriptor.maybeNew(this.testDescriptor)

            desc.url                    = this.baseUrl
            desc.title                  = this.title

            this.projectPlan.descriptor = desc
        }


        buildBaseUrl () : string {
            throw new Error("Implement me")
        }


        async start () {
            await this.performSetup()

            if (projectExtraction.resolve) {
                projectExtraction.resolve(this)
            } else {
                await this.launch(this.projectPlan.leafsAxis())
            }
        }


        async launch (planItemsToLaunch : ProjectPlanItem[]) : Promise<Launch> {
            return
            // if (!this.setupDone) {
            //     // setup may be already started (by another launch)
            //     await (this.setupPromise || (this.setupPromise = this.setup()))
            //
            //     this.setupDone      = true
            //     this.setupPromise   = undefined
            // }
            //
            // const launch    = Launch.new({
            //     project                                 : this,
            //     projectPlanItemsToLaunch                : planItemsToLaunch,
            //
            //     testContextProviderConstructors         : this.testContextProviderConstructors
            // })
            //
            // await launch.start()
            //
            // return launch
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
