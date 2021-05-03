import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { DeepCompareOptions } from "../../compare_deep/CompareDeepDiff.js"
import { XmlRendererDifference } from "../../compare_deep/CompareDeepDiffRendering.js"
import { CI } from "../../iterator/Iterator.js"
import { serializable, Serializable } from "../../serializable/Serializable.js"
import { SerializerXml } from "../../serializer/SerializerXml.js"
import { TreeNode } from "../../tree/TreeNode.js"
import { ArbitraryObject, cloneObject, objectEntriesDeep } from "../../util/Helpers.js"
import { isAbsolute, joinUrls, stripDirname, stripTrailingSlash } from "../../util/Path.js"
import { isString } from "../../util/Typeguards.js"
import { EnvironmentType } from "../common/Environment.js"
import { HasOptions, option, OptionGroup } from "../option/Option.js"
import { Test } from "./Test.js"


//---------------------------------------------------------------------------------------------------------------------
export const OptionsGroupTestDescriptor  = OptionGroup.new({
    name        : 'test',
    title       : 'Test descriptor',
    weight      : 800
})


//---------------------------------------------------------------------------------------------------------------------
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
@serializable()
export class TestDescriptor extends Mixin(
    [ Serializable, HasOptions, TreeNode, Base ],
    (base : ClassUnion<typeof Serializable, typeof HasOptions, typeof TreeNode, typeof Base>) => {

    class TestDescriptor extends base {
        type            : EnvironmentType       = 'isomorphic'

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

        /**
         * The base name of the test file - not including the directory part. By convention,
         * Siesta tests should have `*.t.js` extension.
         *
         * If descriptor represents a directory it should contain the base name of the directory.
         *
         * For example:
         *
         * ```ts
         * project.plan(
         *     {
         *         filename : 'some_directory',
         *
         *         items    : [
         *             { filename : 'test_1.t.js' }
         *             // or just:
         *             'test_2.t.js',
         *         ]
         *     }
         * )
         * ```
         *
         *
         * Either this property or the [[url]] should be provided for the descriptor.
         *
         * This property is only used for the top-level tests, and it is ignored for the nested test sections.
         */
        filename        : string                = ''

        get fileName () : string {
            return this.filename
        }

        set fileName (value : string) {
            this.filename = value
        }

        /**
         * The complete url for this test, **relative to the parent descriptor**.
         *
         * Either this property or the [[filename]] should be provided for the descriptor.
         */
        url             : string

        tags            : string[]

        /**
         * Whether this test is "todo" or not. Todo tests are considered work in progress and expected to fail.
         * The failed assertions in them are not reported. In opposite, the *passed* assertions from the todo
         * tests are reported.
         */
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
        snooze          : string | Date

        // @option()
        // isolation       : IsolationLevel

        // @option({ type : 'boolean', defaultValue : () => false, group : OptionsGroupTestDescriptor })
        // failOnIit           : boolean

        // will be applied directly to test instance
        config          : ArbitraryObject

        // @option({ defaultValue : () => false, group : OptionsGroupTestDescriptor })
        // autoCheckGlobals    : boolean

        /**
         * A default timeout for various asynchronous actions, in milliseconds.
         */
        @option({ defaultValue : () => 15000, group : OptionsGroupTestDescriptor })
        defaultTimeout      : number        = 15000

        /**
         * A default timeout for the [[Test.waitFor|waitFor]] assertion, in milliseconds.
         * If not provided, the [[defaultTimeout]] will be used.
         */
        @option({ defaultValue : () => 15000, group : OptionsGroupTestDescriptor })
        waitForTimeout      : number        = undefined

        /**
         * A default poll interval for the [[Test.waitFor|waitFor]] assertion, in milliseconds.
         */
        waitForPollInterval : number        = 50



        serializerConfig    : Partial<SerializerXml>            = { maxBreadth : 10, maxDepth : 4 }
        stringifierConfig   : Partial<XmlRendererDifference>    = { prettyPrint : true }
        deepCompareConfig   : DeepCompareOptions                = undefined


        childrenByName      : Map<string, TestDescriptor>       = new Map()


        initialize (props? : Partial<TestDescriptor>) {
            super.initialize(props)

            if (this.url && !this.filename) this.filename = stripDirname(this.url)
        }


        planItem (item : TestDescriptor) : TestDescriptor {
            const existing  = this.childrenByName.get(item.filename)

            if (existing) {
                existing.merge(item)
            } else {
                this.appendChild(item)

                this.childrenByName.set(item.filename, item)
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


        // absolute url
        $urlAbs         : string        = undefined

        get urlAbs () : string | null {
            if (this.$urlAbs !== undefined) return this.$urlAbs

            return this.$urlAbs = isAbsolute(this.url) ?
                    this.url
                :
                    this.parentNode && this.parentNode.urlAbs ? joinUrls(this.parentNode?.urlAbs, this.url || this.filename) : null
        }


        getOptionValueReducers () : { [ key in keyof this ]? : (name : keyof this, parentsAxis : this[]) => this[ typeof name ] } {
            return {
                url     : (name : 'url', parentsAxis : this[]) : this[ typeof name ] => {
                    const urlParts      = []

                    CI(parentsAxis).forEach(desc => {
                        if (desc.url) {
                            urlParts.push(stripTrailingSlash(desc.url))

                            if (isAbsolute(desc.url)) return false
                        }
                        else {
                            urlParts.push(desc.filename)
                        }
                    })

                    urlParts.reverse()

                    return urlParts.join('/')
                },
                tags    : (name : 'tags', parentsAxis : this[]) : this[ typeof name ] => {
                    return CI(parentsAxis.flatMap(desc => desc.tags)).uniqueOnly().toArray()
                }
            }
        }

        // here the type should be `this`, but TS got mad when mixin `Project` and `ProjectBrowser` for example
        // `TestDescriptor` seems to be enough, since `flatten` is always used in generic `TestDescriptor` context it seems
        $flatten        : TestDescriptor      = undefined

        get flatten () : TestDescriptor {
            if (this.$flatten !== undefined) return this.$flatten

            if (this.childNodes) throw new Error("Can only flatten leaf descriptors, not groups")

            const descriptor        = cloneObject(this)
            descriptor.parentNode   = undefined

            if (!descriptor.url && !descriptor.filename) throw new Error("Descriptor needs to have either `filename` or `url` property defined")

            const parentsAxis       = [ this, ...this.parentsAxis() ]

            const reducers          = this.getOptionValueReducers()

            const defaultReducer    = (name : keyof this, parentsAxis : this[]) : this[ typeof name ] => {
                let res : this[ typeof name ]

                CI(parentsAxis).forEach((desc, index) => {
                    if (desc.hasOwnProperty(name) || index === parentsAxis.length - 1) { res = desc[ name ]; return false }
                })

                return res
            }

            // force the `urlAbs` calculation
            this.urlAbs

            objectEntriesDeep(this.$options).map(([ key, _ ]) => key).concat('url', 'config').forEach(key => {
                const reducer       = reducers[ key ] || defaultReducer

                descriptor[ key ]   = reducer(key, parentsAxis)
            })

            return this.$flatten    = descriptor
        }


        static fromTestDescriptorArgument<T extends typeof TestDescriptor> (this : T, desc : string | Partial<InstanceType<T>>) : InstanceType<T> {
            if (isString(desc)) {
                return this.new({ title : desc } as Partial<InstanceType<T>>)
            } else {
                return this.new(desc)
            }
        }


        static fromProjectPlanItemDescriptor<T extends typeof TestDescriptor> (this : T, desc : ProjectPlanItemDescriptor<InstanceType<T>>) : InstanceType<T> {
            if (isString(desc)) {
                return this.new({ filename : desc } as Partial<InstanceType<T>>)
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

    return TestDescriptor
}) {}

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
 *
 * The string value corresponds to the `{ filename : 'string_value' }` object.
 */
export type ProjectPlanItemDescriptor<T extends TestDescriptor> = string | (Partial<T> & { items? : ProjectPlanItemDescriptor<T>[] })

