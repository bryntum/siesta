import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { include, serializable, Serializable } from "../../serializable/Serializable.js"
import { Environment, EnvironmentType } from "../common/Environment.js"
import { HasOptions } from "../option/Option.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { TestDescriptorDeno } from "../test/TestDescriptorDeno.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// need to use `optIn` mode for serialization of ProjectOptions, because
// we have a creation of `ProjectOptions` instance from the `Project` instance
// (which contains extra properties which all will be applied to the `ProjectOptions` instance,
// because of the way `Base` `initialize` method works)
@serializable({ id : 'ProjectDescriptor', mode : 'optIn' })
export class ProjectDescriptor extends Mixin(
    [ Serializable, HasOptions, Base ],
    (base : ClassUnion<typeof Serializable, typeof HasOptions, typeof Base>) =>

    class ProjectDescriptor extends base {
        /**
         * The top-level [[TestDescriptor]] instance from which the descriptors of all tests in the suite will "inherit".
         *
         * For example if the top-level descriptor contains certain value for the [[TestDescriptor.defaultTimeout|defaultTimeout]] config,
         * then all tests will use that value, unless they explicitly override it.
         */
        @include()
        testDescriptor      : Partial<TestDescriptor>           = undefined
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'ProjectDescriptorNodejs', mode : 'optIn' })
export class ProjectDescriptorNodejs extends Mixin(
    [ ProjectDescriptor ],
    (base : ClassUnion<typeof ProjectDescriptor>) =>

    class ProjectDescriptorNodejs extends base {
        testDescriptor      : Partial<TestDescriptorNodejs>
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'ProjectDescriptorDeno', mode : 'optIn' })
export class ProjectDescriptorDeno extends Mixin(
    [ ProjectDescriptor ],
    (base : ClassUnion<typeof ProjectDescriptor>) =>

    class ProjectDescriptorDeno extends base {
        testDescriptor      : Partial<TestDescriptorDeno>
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'ProjectSerializableData' })
export class ProjectSerializableData extends Mixin(
    [ Serializable, Base ],
    (base : ClassUnion<typeof Serializable, typeof Base>) =>

    class ProjectSerializableData extends base {
        environment             : Environment               = undefined

        type                    : EnvironmentType           = undefined

        siestaPackageRootUrl    : string                    = ''

        launchType              : 'project' | 'test'        = 'project'

        projectPlan             : TestDescriptor            = undefined

        options                 : ProjectDescriptor         = ProjectDescriptor.new()
    }
) {}
