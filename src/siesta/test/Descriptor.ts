import { Base } from "../../class/Base.js"
import { isSubclassOf, isSuperclassOf, typeOf } from "../../util/Helpers.js"
import { Test } from "./Test.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestDescriptor extends Base {
    name            : string                = ''

    title           : string                = ''

    filename        : string                = ''

    testClass       : typeof Test           = Test

    env             : 'generic' | 'browser' | 'nodejs'  = 'generic'

    tags            : string[]              = []

    // will be applied directly to test instance
    config          : object                = undefined


    merge (anotherObj : Partial<TestDescriptor>) {
        const another   = (this.constructor as typeof TestDescriptor).maybeNew(anotherObj)

        if (this.name) {
            if (another.name !== this.name) throw new Error('Can not merge test descriptor - `name` does not match')
        } else {
            this.name       = another.name
        }

        // TODO can promote `env` from `generic` to either `browser` or `nodejs`, anything else should throw

        if (isSuperclassOf(another.testClass, this.testClass)) {
            this.testClass      = another.testClass
        }
        else if (another.testClass === this.testClass || isSubclassOf(another.testClass, this.testClass)) {
            // do nothing
        }
        else
            throw new Error("Can not merge descriptor - different `testClass` hierarchies")

        // strip duplicates
        this.tags           = Array.from(new Set(this.tags.concat(another.tags)))
    }


    static fromTestDescriptorArgument<T extends typeof TestDescriptor> (this : T, props? : string | Partial<InstanceType<T>>) : InstanceType<T> {
        if (typeOf(props) === 'String') {
            // @ts-ignore
            return this.new({ name : props })
        } else {
            // @ts-ignore
            return this.new(props)
        }
    }
}

export type TestDescriptorArgument = string | Partial<TestDescriptor>
