import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { DeepCompareOptions } from "../../compare_deep/DeepDiff.js"
import { XmlRendererDifference } from "../../compare_deep/DeepDiffXmlRendererDifference.js"
import { CI } from "../../iterator/Iterator.js"
import { serializable, Serializable } from "../../serializable/Serializable.js"
import { SerialOptions } from "../../serializer/Serial.js"
import { TreeNode } from "../../tree/TreeNode.js"
import { ArbitraryObject, cloneObject, objectEntriesDeep, prototypeValue } from "../../util/Helpers.js"
import { isAbsolute, joinUrls, stripDirname, stripTrailingSlash } from "../../util/Path.js"
import { isString } from "../../util/Typeguards.js"
import { EnvironmentType } from "../common/Environment.js"
import { IsolationLevel } from "../common/IsolationLevel.js"
import { LUID } from "../common/LUID.js"
import { HasOptions, option, OptionGroup } from "../option/Option.js"
import { Test } from "./Test.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const OptionsGroupTestDescriptor  = OptionGroup.new({
    name        : 'test',
    title       : 'Test descriptor',
    weight      : 800
})

export const firstDescWithOwnProperty  = <Desc extends TestDescriptor = TestDescriptor>(name : keyof Desc, parentsAxis : Desc[]) : Desc => {
    for (let i = 0; i < parentsAxis.length; i++) {
        const desc      = parentsAxis[ i ]

        if (desc.hasOwnProperty(name) || i === parentsAxis.length - 1) return desc
    }
}

export class Config<Desc extends TestDescriptor = TestDescriptor> extends Base {
    name        : string        = undefined

    reducer     : (name : keyof Desc, parentsAxis : Desc[]) => Desc[ typeof name ] =
        (name : keyof Desc, parentsAxis : Desc[]) : Desc[ typeof name ] => firstDescWithOwnProperty(name, parentsAxis)[ name ]
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class HasConfigs extends Mixin(
    [],
    (base : AnyConstructor) =>

    class HasConfigs extends base {
        // resides in prototype
        $configs        : { [ key : string ] : Config }
    }
){}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const config = <Desc extends TestDescriptor>(config? : Partial<Config<Desc>>, configCls : typeof Config = Config) : PropertyDecorator => {

    return (proto : HasConfigs, propertyKey : string) : void => {
        if (!proto.hasOwnProperty('$configs')) proto.$configs = Object.create(proto.$configs || null)

        const configInstance            = configCls.new(Object.assign({}, config, { name : propertyKey }))

        proto.$configs[ propertyKey ]   = configInstance
    }
}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestDescriptorPre extends Mixin(
    [ Serializable, HasOptions, HasConfigs, TreeNode, Base ],
    (base : ClassUnion<typeof Serializable, typeof HasOptions, typeof HasConfigs, typeof TreeNode, typeof Base>) =>

    class TestDescriptorPre extends base {
    }
) {}


// some properties in this class don't have an initializer, that is intentional,
// because when "flattening" the descriptor and its parent descriptors,
// we check `descriptor.hasOwnProperty('property')` to find out if there's an
// explicitly provided value for that property
// obviously with initializer, that check will always be `true`, which is not
// what we want. Alternative would be to have separate flag for every config, like
// "setByTheUser : boolean"
/**
 * This class represents the configuration properties of the [[Test]] class. It is serializable and can be transferred
 * over the network. Some of the properties of this class are also "options" - can be specified in the command-line
 * when launching the test suite.
 */
@serializable({ id : 'TestDescriptor' })
export class TestDescriptor extends TestDescriptorPre {
    guid            : LUID                  = undefined

    type            : EnvironmentType           = 'isomorphic'

    unique          : boolean                   = false

    @config()
    isolation       : IsolationLevel            = 'process'

    childNodeT      : TestDescriptor
    parentNode      : TestDescriptor

    /**
     * The human-readable title of this test.
     */
    title           : string                = ''

    get name () : string {
        return this.title
    }

    set name (value : string) {
        this.title = value
    }

    filename        : string                = ''

    /**
     * The url for this test, **relative to the parent descriptor**. It can also be an absolute url.
     * By convention, Siesta tests should have `*.t.js` extension.
     *
     * For the top-level descriptors, `url` is **relative to the project file itself**.
     *
     * For example:
     *
     * ```ts
     * project.plan(
     *     {
     *         // relative to project file
     *         url : 'some_directory',
     *
     *         items    : [
     *             // relative to `some_directory`
     *             { url : 'test_1.t.js' }
     *             // or just:
     *             'test_2.t.js',
     *         ]
     *     }
     * )
     * ```
     */
    @config({
        reducer : (name : 'url', parentsAxis : TestDescriptor[]) : TestDescriptor[ 'url' ] => {
            const urlParts      = []

            for (const desc of parentsAxis) {
                if (desc.url) {
                    const stripped  = stripTrailingSlash(desc.url)

                    // ignore the `./` segments
                    if (stripped !== '.') urlParts.push(stripped)
                }

                if (isAbsolute(desc.url)) break
            }

            urlParts.reverse()

            return urlParts.join('/')
        }
    })
    url             : string                    = ''

    @config({
        reducer : (name : 'tags', parentsAxis : TestDescriptor[]) : TestDescriptor[ 'tags' ] => {
            return CI(parentsAxis.flatMap(desc => desc.tags)).uniqueOnly().toArray()
        }
    })
    tags            : string[]

    /**
     * Whether this test is "todo" or not. Todo tests are considered work in progress and expected to fail.
     * The failed assertions in them are not reported. In opposite, the *passed* assertions from the todo
     * tests are reported.
     */
    @config()
    isTodo          : boolean

    /**
     * Either a `Date` instance or a string, recognized by the [Date constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
     *
     * If this config is specified, and the test is running prior the specified date, the test will be switched to [[isTodo|todo]] mode.
     *
     * For example in the project file:
     *
     * ```ts
     * project.plan(
     *     {
     *         filename    : 'some_test.t.js',
     *         // choose the unsnooze date wisely
     *         snooze      : '2021-12-25'
     *     }
     * )
     * ```
     *
     * in the test file:
     *
     * ```ts
     * it({
     *     title  : 'Some test',
     *     snooze : '2022-01-01'
     * }, async t => {
     *     ...
     * })
     * ```
     */
    @config()
    snooze          : string | Date

    // @option()
    // isolation       : IsolationLevel

    // @option({ type : 'boolean', defaultValue : () => false, group : OptionsGroupTestDescriptor })
    // failOnIit           : boolean

    // will be applied directly to test instance
    @config()
    config          : ArbitraryObject

    // @option({ defaultValue : () => false, group : OptionsGroupTestDescriptor })
    // autoCheckGlobals    : boolean

    /**
     * A default timeout for various asynchronous actions, in milliseconds.
     *
     * Default value is 15000ms.
     */
    @config()
    @option({ defaultValue : () => 15000, group : OptionsGroupTestDescriptor })
    @prototypeValue(15000)
    defaultTimeout      : number

    /**
     * A default timeout for the [[Test.waitFor|waitFor]] assertion, in milliseconds.
     * If not provided, the [[defaultTimeout]] will be used.
     */
    @config()
    @option({ group : OptionsGroupTestDescriptor })
    waitForTimeout      : number

    /**
     * A default poll interval for the [[Test.waitFor|waitFor]] assertion, in milliseconds.
     *
     * Default value is 50ms.
     */
    @config()
    @option({ defaultValue : () => 50, group : OptionsGroupTestDescriptor })
    @prototypeValue(50)
    waitForPollInterval : number

    serializerConfig    : Partial<SerialOptions>            = { maxBreadth : 10, maxDepth : 4 }
    stringifierConfig   : Partial<XmlRendererDifference>    = {}
    deepCompareConfig   : DeepCompareOptions                = undefined

    // TODO should probably index by `urlAbs` instead of `filename`??
    // or since `url` is not always relative thats enough?
    childrenByName      : Map<string, TestDescriptor>       = new Map()


    initialize (props? : Partial<TestDescriptor>) {
        super.initialize(props)

        if (this.url) this.filename = stripDirname(this.url)
    }


    planItem<T extends TestDescriptor> (item : T) : T {
        const existing  = this.childrenByName.get(item.filename)

        if (existing && !item.unique) {
            existing.merge(item)
        } else {
            this.appendChild(item)

            !item.unique && this.childrenByName.set(item.filename, item)
        }

        return item
    }


    merge (item : ProjectPlanItemDescriptor<this>) {
        Object.assign(this, item)
    }


    removeItem (item : TestDescriptor) {
        const child     = this.childrenByName.get(item.filename)

        if (child === item) {
            this.childrenByName.delete(item.filename)

            const index     = this.childNodes.indexOf(item)

            this.childNodes.splice(index, 1)
        }
    }


    // the full url, starting from the root node
    // the "Abs" is a bit misleading, the contract is just that
    // it starts from the root node
    $urlAbs         : string        = undefined

    get urlAbs () : string | null {
        if (this.$urlAbs !== undefined) return this.$urlAbs

        return this.$urlAbs = isAbsolute(this.url) || !this.parentNode
            ? this.url
            : joinUrls(this.parentNode.urlAbs, this.url)
    }

    // a string used to identify the test descriptor when saving/restoring the persistent UI state
    get titleIdentifier () : string {
        return this.title || this.urlAbs
    }


    // here the type should be `this`, but TS got mad when mixin `Project` and `ProjectBrowser` for example
    // `TestDescriptor` seems to be enough, since `flatten` is always used in generic `TestDescriptor` context it seems
    $flatten        : this      = undefined

    get flatten () : this {
        if (this.$flatten !== undefined) return this.$flatten

        if (this.childNodes) throw new Error("Can only flatten leaf descriptors, not groups")

        const descriptor        = cloneObject(this)
        descriptor.parentNode   = undefined

        // TODO seems we need to split the FileDescriptor and SectionDescriptor?..
        // next line applies to the former only
        // if (!descriptor.url && !descriptor.filename) throw new Error("Descriptor needs to have either `filename` or `url` property defined")

        const parentsAxis       = [ this, ...this.parentsAxis() ]

        // force the `urlAbs` calculation
        this.urlAbs

        objectEntriesDeep(this.$configs).forEach(([ key, config ]) => {
            const reducer       = config.reducer

            descriptor[ key ]   = reducer(key as keyof TestDescriptor, parentsAxis)
        })

        return this.$flatten    = descriptor
    }

    // TODO refactor this, see comment for TestDescriptorBrowser
    isRunningInDashboard () : boolean {
        return true
    }


    static fromTestDescriptorArgument<T extends typeof TestDescriptor> (this : T, desc : string | Partial<InstanceType<T>>) : InstanceType<T> {
        if (isString(desc)) {
            return this.new({ title : desc } as Partial<InstanceType<T>>)
        } else {
            return this.new(desc)
        }
    }


    static fromProjectPlanItemDescriptor<T extends typeof TestDescriptor> (this : T, desc : ProjectPlanItemDescriptor<InstanceType<T>>) : InstanceType<T> {
        if (desc instanceof TestDescriptor) {
            return desc as InstanceType<T>
        }
        else if (isString(desc)) {
            return this.new({ url : desc } as Partial<InstanceType<T>>)
        }
        else if (desc.items !== undefined) {
            const groupDesc     = Object.assign({}, desc)

            delete groupDesc.items

            const group         = this.new(groupDesc)

            // need to force-create the `childNodes` array for the case when the `items` array is empty
            // so that this descriptor will be counted as a group, not leaf
            group.childNodes    = []

            desc.items.forEach(item => group.planItem(this.fromProjectPlanItemDescriptor(item)))

            return group
        } else {
            return this.new(desc)
        }
    }
}

/**
 * This type represents a special placeholder for the [[TestDescriptor]] value. It is used as the
 * 1st argument for the calls that create test sections, like [[Test.it]] and similar.
 *
 * The value can be either a string or a partial configuration object of this test's descriptor.
 *
 * The string value corresponds to the `{ title : 'string_value' }` object.
 */
export type TestDescriptorArgument<T extends Test> = string | Partial<InstanceType<T[ 'testDescriptorClass' ]>>

/**
 * This type represents a special placeholder for the [[TestDescriptor]] value. It is used as an argument
 * for the various project planning calls, like [[Project.plan]] and similar.
 *
 * The value can be either a string or a partial configuration object of this test's descriptor.
 * That object may have the `items` property, which is an array of "children" [[ProjectPlanItemDescriptor]] entries.
 *
 * The string value corresponds to the `{ filename : 'string_value' }` object.
 */
export type ProjectPlanItemDescriptor<T extends TestDescriptor> = string | (Partial<T> & { items? : ProjectPlanItemDescriptor<T>[] })

