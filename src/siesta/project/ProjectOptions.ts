import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { include, serializable, Serializable } from "../../serializable/Serializable.js"
import { HasOptions, option } from "../launcher/Option.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { TestDescriptorBrowser } from "../test/DescriptorBrowser.js"
import { TestDescriptorNodejs } from "../test/DescriptorNodejs.js"
import { ProjectPlanGroup } from "./Plan.js"


//---------------------------------------------------------------------------------------------------------------------
@serializable({ mode : 'optIn' })
export class ProjectOptions extends Mixin(
    [ Serializable, HasOptions, Base ],
    (base : ClassUnion<typeof Serializable, typeof HasOptions, typeof Base>) => {

    class ProjectOptions extends base {
        @include()
        @option({ type : 'object' })
        testDescriptor      : Partial<TestDescriptor>           = undefined
    }

    return ProjectOptions
}) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable({ mode : 'optIn' })
export class ProjectOptionsBrowser extends Mixin(
    [ ProjectOptions ],
    (base : ClassUnion<typeof ProjectOptions>) => {

    class ProjectOptionsBrowser extends base {
        testDescriptor      : Partial<TestDescriptorBrowser>    = undefined
    }

    return ProjectOptionsBrowser
}) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable({ mode : 'optIn' })
export class ProjectOptionsNodejs extends Mixin(
    [ ProjectOptions ],
    (base : ClassUnion<typeof ProjectOptions>) => {

    class ProjectOptionsNodejs extends base {
        testDescriptor      : Partial<TestDescriptorNodejs>    = undefined
    }

    return ProjectOptionsNodejs
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
