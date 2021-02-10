import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { include, serializable, Serializable } from "../../serializable/Serializable.js"
import { HasOptions, option } from "../launcher/Option.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"


//---------------------------------------------------------------------------------------------------------------------
// need to use `optIn` mode for serialization of ProjectOptions, because
// we have a creation of `ProjectOptions` instance from the `Project` instance
// (which contains extra properties which all will be applied to the `ProjectOptions` instance,
// because of the way `Base` `initialize` method works)
@serializable({ mode : 'optIn' })
export class ProjectOptions extends Mixin(
    [ Serializable, HasOptions, Base ],
    (base : ClassUnion<typeof Serializable, typeof HasOptions, typeof Base>) => {

    class ProjectOptions extends base {
        @include()
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
        testDescriptor      : Partial<TestDescriptorBrowser>
    }

    return ProjectOptionsBrowser
}) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable({ mode : 'optIn' })
export class ProjectOptionsNodejs extends Mixin(
    [ ProjectOptions ],
    (base : ClassUnion<typeof ProjectOptions>) => {

    class ProjectOptionsNodejs extends base {
        testDescriptor      : Partial<TestDescriptorNodejs>
    }

    return ProjectOptionsNodejs
}) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class ProjectDescriptor extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) => {

    class ProjectDescriptor extends base {
        projectPlan     : TestDescriptor            = undefined

        options         : ProjectOptions            = undefined
    }

    return ProjectDescriptor
}) {}
