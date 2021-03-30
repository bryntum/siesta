import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { include, serializable, Serializable } from "../../serializable/Serializable.js"
import { HasOptions } from "../option/Option.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorBrowser } from "../test/TestDescriptorBrowser.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"


//---------------------------------------------------------------------------------------------------------------------
// need to use `optIn` mode for serialization of ProjectOptions, because
// we have a creation of `ProjectOptions` instance from the `Project` instance
// (which contains extra properties which all will be applied to the `ProjectOptions` instance,
// because of the way `Base` `initialize` method works)
@serializable({ mode : 'optIn' })
export class ProjectDescriptor extends Mixin(
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
    [ ProjectDescriptor ],
    (base : ClassUnion<typeof ProjectDescriptor>) => {

    class ProjectOptionsBrowser extends base {
        testDescriptor      : Partial<TestDescriptorBrowser>
    }

    return ProjectOptionsBrowser
}) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable({ mode : 'optIn' })
export class ProjectOptionsNodejs extends Mixin(
    [ ProjectDescriptor ],
    (base : ClassUnion<typeof ProjectDescriptor>) => {

    class ProjectOptionsNodejs extends base {
        testDescriptor      : Partial<TestDescriptorNodejs>
    }

    return ProjectOptionsNodejs
}) {}


//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class ProjectSerializableData extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) => {

    class ProjectSerializableData extends base {
        projectPlan     : TestDescriptor            = undefined

        options         : ProjectDescriptor         = ProjectDescriptor.new()
    }

    return ProjectSerializableData
}) {}
