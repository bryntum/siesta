import { CI } from "chained-iterator/index.js"
import { AnyFunction, ClassUnion, Mixin } from "../../class/Mixin.js"
import { serializable } from "../../serializable/Serializable.js"
import { lastElement, prototypeValue, wantArray } from "../../util/Helpers.js"
import { isAbsolute, joinUrls, stripBasename } from "../../util/Path.js"
import { isArray, isFunction, isString } from "../../util/Typeguards.js"
import { EnvironmentType } from "../common/Environment.js"
import { IsolationLevel, SimulationType } from "../common/IsolationLevel.js"
import { option } from "../option/Option.js"
import { PointerMovePrecision } from "../simulate/SimulatorMouse.js"
import { config, firstDescWithOwnProperty, TestDescriptor } from "./TestDescriptor.js"

/*
IMPORTANT

this class is assumed to be isomorphic right now,
see
    src/siesta/test/port/TestLauncher.tsx
*/

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * A preload descriptor describes what resources should be loaded into the test page, before starting the test.
 * It can point to JavaScript or CSS resource, or can provide it inline.
 *
 * Preload descriptor can be:
 *
 * - an object in the form `{ type : 'js', url : string, isEcmaModule? : boolean }`, pointing to the JavaScript file.
 * If the file contains Ecma module, the `isEcmaModule` flag should be set to `true`
 * - an object in the form `{ type : 'js', content : string, isEcmaModule? : boolean }`, providing the inline JavaScript content.
 * If the content represents an Ecma module, the `isEcmaModule` flag should be set to `true`
 * - an object in the form `{ type : 'css', url : string }`, pointing to the CSS file.
 * - an object in the form `{ type : 'css', content : string }`, providing the inline CSS content.
 * - a plain string, if it ends with `.css` it corresponds to `{ type : 'css', url : string }`,
 * otherwise it corresponds to `{ type : 'js', url : string, isEcmaModule : false }`
 * - an object in the form `{ code : string | Function }`, which corresponds to `{ type : 'js', content : string, isEcmaModule : false }`.
 * If the `code` property is provided as a `Function` it will be stringified with `.toString()` call.
 * - an object in the form `{ style : string  }`, which corresponds to `{ type : 'css', content : string }`.
 * - a "falsy" value, like `null`, `undefined`, empty string etc. It will be ignored
 * - an array of preload descriptors - will be flattened.
 *
 * The last 2 cases allows simple conditional preloading, for example:
 * ```js
 * preload         : [
 *     'http://mydomain.com/file1.js'
 *     {
 *         code    : 'MySpecialGlobalFunc = () => { if (typeof console != "undefined") ... }'
 *     },
 *     // simple conditional preload
 *     someCondition ?
 *         [
 *             'http://mydomain.com/file2.css',
 *             'http://mydomain.com/file3.js'
 *         ]
 *     :
 *         null
 * ],
 * ```
 *
 */
export type PreloadDescriptor =
    | string
    | false | null | undefined | ''
    | { type : 'js', url : string, isEcmaModule? : boolean }
    | { type : 'js', content : string, isEcmaModule? : boolean }
    | { type : 'css', url : string }
    | { type : 'css', content : string }
    | { text : string | AnyFunction }
    | { code : string | AnyFunction }
    | { style : string }
    | PreloadDescriptor[]

export type PreloadDescriptorNormalized =
    | { type : 'js', url : string, isEcmaModule? : boolean }
    | { type : 'js', content : string, isEcmaModule? : boolean }
    | { type : 'css', url : string }
    | { type : 'css', content : string }


export const normalizePreloadValue = (preload : 'inherit' | PreloadDescriptor | PreloadDescriptor[]) : PreloadDescriptorNormalized[] => {
    if (preload === 'inherit')
        return undefined
    else {
        return wantArray(preload || [])
            .flat(2000)
            .filter(el => Boolean(el))
            .map(normalizePreloadDescriptor)
    }
}


export const normalizePreloadDescUrl = (preloadDesc : PreloadDescriptorNormalized, baseDesc : TestDescriptorBrowser) : PreloadDescriptorNormalized => {
    if ('url' in preloadDesc) {
        return Object.assign({}, preloadDesc, {
            url     : isAbsolute(preloadDesc.url)
                ? preloadDesc.url
                : joinUrls(baseDesc.isLeaf() ? stripBasename(baseDesc.urlAbs) : baseDesc.urlAbs, preloadDesc.url)
        })
    } else
        return preloadDesc
}


export const normalizePreloadDescriptor = (desc : PreloadDescriptor) : PreloadDescriptorNormalized => {
    if (isArray(desc)) {
        throw new Error("Descriptor should be flattened before using this function")
    }
    else if (desc === null || desc === undefined || desc === '' || desc === false) {
        throw new Error("Descriptor should be filtered before using this function")
    }
    else if (isString(desc) && desc.endsWith('.css')) {
        return {
            type        : 'css',
            url         : desc
        }
    }
    else if (isString(desc)) {
        return {
            type        : 'js',
            url         : desc,
            isEcmaModule : false
        }
    }
    else if ('style' in desc) {
        return {
            type            : 'css',
            content         : desc.style,
        }
    }
    else if ('code' in desc || 'text' in desc) {
        const code  = 'code' in desc ? desc.code : desc.text

        return {
            type            : 'js',
            content         : isFunction(code) ? `(${ code.toString() })()` : code,
            isEcmaModule    : false
        }
    }
    else {
        return desc
    }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Test descriptor class for tests running in the browser environment.
 */
@serializable({ id : 'TestDescriptorBrowser' })
export class TestDescriptorBrowser extends Mixin(
    [ TestDescriptor ],
    (base : ClassUnion<typeof TestDescriptor>) =>

    class TestDescriptorBrowser extends base {
        type                : EnvironmentType           = 'browser'

        @config()
        // TODO should use only `prototypeValue`, currently w/o initializer things breaks
        // but this prevents inheritance
        // seems need to refactor the descriptor inheritance mechanism
        @prototypeValue('native')
        @option()
        simulation          : SimulationType            = 'native'

        @config()
        // TODO `isolation` is actually inherited from `TestDescriptor`, `@option` should be applied there
        // TODO see above
        @prototypeValue('iframe')
        @option()
        isolation           : IsolationLevel            = 'iframe'

        /**
         * A [[PreloadDescriptor|preload descriptor]] or an array of those. Defines what resources should be loaded
         * into the test page, before executing the test.
         *
         * **IMPORTANT** The url of the preload descriptor is resolved relative to the project file location
         * (inside the directory of the project file). See also [[preloadRel]] config, the urls of which are
         * resolved relative to the test file location.
         *
         * Currently, this config is only recognized when provided in the [[SiestaProjectGuide|project file]].
         *
         * **IMPORTANT** The preloading happens *after* the test file has been loaded into the page, but *before* any test
         * starts. This means, if want to use the preloaded resources, the code accessing them should be placed **inside**
         * any of the [[it]], [[describe]] or [[beforeEach]] section. Using the preloaded resources at the top-level of the file
         * won't work. For example:
         *
         * ```js
         * // this test file preloads a file which defines a global constant `MY_CONSTANT`
         * import { beforeEach, it } from "../../browser.js"
         *
         * // this will throw - `MY_CONSTANT` is not preloaded yet
         * const some = MY_CONSTANT + 1
         *
         * // this will work correctly, test are launched after preload
         * it('My test', async t => {
         *     const some = MY_CONSTANT + 1
         * })
         * ```
         *
         * **Note**, that if test descriptor has non-empty [[pageUrl]] option, then *it will not inherit* the [[preload]] option
         * from parent descriptors or project, **unless** it has the [[preload]] config set to string `inherit`.
         * If both [[pageUrl]] and [[preload]] are set on the project level (or on the directory),
         * [[preload]] value still will be inherited.
         */
        @config({
            reducer : (name : 'preload', parentsAxis : TestDescriptorBrowser[]) : TestDescriptorBrowser[ 'preload' ] => {
                const rootDesc      = lastElement(parentsAxis)

                // @ts-ignore
                return inheritanceBlockedByPageUrl('preload', parentsAxis, desc => {
                    if (desc.preload === 'inherit') return 'inherit'

                    const normalized    = normalizePreloadValue(desc.preload)

                    return (normalized || []).map(preloadDesc => normalizePreloadDescUrl(preloadDesc, rootDesc))
                })
            }
        })
        preload                 : 'inherit' | PreloadDescriptor | PreloadDescriptor[]


        /**
         * The relative version of the [[preload]] config. The url of the preload descriptor, specified with this config,
         * is resolved relative to the test file location (inside the directory of the test file).
         * Similarly, if the `preload` config is specified on the directory descriptor,
         * the url of the preload descriptor is resolved inside the parent directory of that directory.
         *
         * See [[preload]] documentation for more details.
         */
        @config({
            reducer : (name : 'preloadRel', parentsAxis : TestDescriptorBrowser[]) : TestDescriptorBrowser[ 'preloadRel' ] => {
                // @ts-ignore
                return inheritanceBlockedByPageUrl('preloadRel', parentsAxis, desc => {
                    if (desc.preloadRel === 'inherit') return 'inherit'

                    const normalized    = normalizePreloadValue(desc.preloadRel)

                    return (normalized || []).map(preloadDesc => normalizePreloadDescUrl(preloadDesc, desc))
                })
            }
        })
        preloadRel             : 'inherit' | PreloadDescriptor | PreloadDescriptor[]

        /**
         * A [[PreloadDescriptor|preload descriptor]] or an array of those. Defines what resources should be loaded
         * into the test page *in addition* to the [[preload]] config, before executing the test.
         */
        @config({
            reducer : (name : 'alsoPreload', parentsAxis : TestDescriptorBrowser[]) : TestDescriptorBrowser[ 'alsoPreload' ] => {
                return CI(parentsAxis.flatMap(desc => desc.alsoPreload)).reversed().toArray()
            }
        })
        alsoPreload         : PreloadDescriptor | PreloadDescriptor[]


        /**
         * This config allows you to use the external web page for running the test. This page can be generated by
         * your web application for example.
         *
         * Currently, this config is only recognized when provided in the [[SiestaProjectGuide|project file]].
         *
         * **Important** The url of the page is resolved relative to the url of the project file. See also the
         * [[pageUrlRel]] config, which is resolved relative the test file.
         *
         * Note, that Siesta is using "in-page" execution model for the tests - test is executed right "inside" the page.
         * This means it has full and direct access to page internals, but also means test will not "survive" the
         * page redirect.
         *
         * If you need to test the page with arbitrary redirects, then instead [[GettingStartedNodejsGuide|write your
         * tests as Node.js scripts]] and use the "classic" Playwright API to create the page instance and `evalulate`
         * command of those libraries ("out-of-page" execution model). In the future releases, we'll provide an
         * unified API for both on-page and out-of-page testing scenarios.
         */
        @prototypeValue('')
        @config({
            reducer : (name : 'pageUrl', parentsAxis : TestDescriptorBrowser[]) : TestDescriptorBrowser[ 'pageUrl' ] => {
                const desc      = firstDescWithOwnProperty(name, parentsAxis)

                return desc.pageUrl ? joinUrls(lastElement(parentsAxis).urlAbs, desc.pageUrl) : ''
            }
        })
        pageUrl             : string


        /**
         * The relative version of the [[pageUrl]] config. The url of the external page, specified with this config,
         * is resolved relative to the url of the test file. For example, for this setup:
         *
         * ```js
         * project.plan({
         *     url          : 'dir/file.js',
         *     pageUrlRel   : 'page.html'
         * })
         * ```
         * The resolved url for `pageUrl` will be: `dir/page.html` (resolved relative to `dir/file.js`)
         *
         * See also [[pageUrl]] documentation for more details.
         */
        @prototypeValue('')
        @config({
            reducer : (name : 'pageUrlRel', parentsAxis : TestDescriptorBrowser[]) : TestDescriptorBrowser[ 'pageUrlRel' ] => {
                const desc      = firstDescWithOwnProperty(name, parentsAxis)

                return desc.pageUrlRel ? joinUrls(desc.isLeaf() ? stripBasename(desc.urlAbs) : desc.urlAbs, desc.pageUrlRel) : ''
            }
        })
        pageUrlRel          : string


        @config()
        @prototypeValue(1024)
        viewportWidth       : number

        @config()
        @prototypeValue(768)
        viewportHeight      : number

        @config()
        @prototypeValue({ kind : 'last_only', precision : 1 })
        mouseMovePrecision  : PointerMovePrecision

        /**
         * When this config is set to `true`, the failures when loading various resources (`script/link/img` tags, etc)
         * will be reported as failed assertions.
         *
         * Default value is `false`.
         */
        @config()
        @prototypeValue(false)
        failOnResourceLoadError  : boolean

        // TODO rename or may be even replace with more generic option
        // like `cssReset` which will accept a CSS text
        @config()
        @prototypeValue(true)
        expandBody          : boolean

        /**
         * What to do, if an [[ActionTarget]] query has been resolved into multiple elements:
         *
         * - `use_first` - silently use the 1st one in the results, usually its the 1st element matching the query
         * in the depth-first order of the DOM tree.
         * - `warn` - use the 1st element, and issue a warning
         * - `throw` - throw an exception
         */
        @config()
        onAmbiguousQuery        : 'use_first' | 'warn' | 'throw'   = 'warn'


        // TODO refactor: Probably need a separate data structure `TestLaunchInfo`
        // which will contain the information about how exactly this descriptor is launched
        // for example an isomorphic descriptor can be launched with Node.js context provider
        // or browser
        // browser descriptor can be launched inside of the dashboard or on separate page
        // etc, may be some other info
        isRunningInDashboard () : boolean {
            return this.isolation === 'iframe' || this.isolation === 'context'
        }
    }
){}


// special reducer for properties, inheritance of which should be blocked by the presence of `pageUrl` config
// these are:
// -- DONE: 'preload',
// -- TODO: 'innerHtmlHead/innerHtmlBody'
function inheritanceBlockedByPageUrl (
    configName : keyof TestDescriptorBrowser,
    parentsAxis : TestDescriptorBrowser[],
    getValue? : (desc : TestDescriptorBrowser) => TestDescriptorBrowser[ typeof configName ]
)
    : TestDescriptorBrowser[ typeof configName ]
{
    let pageUrlConfigFound  = false
    let isInheriting        = false

    for (let i = 0; i < parentsAxis.length; i++) {
        const isProjectNode = i === parentsAxis.length - 1

        const descriptor    = parentsAxis[ i ]

        pageUrlConfigFound  = pageUrlConfigFound || descriptor.hasOwnProperty('pageUrl') || descriptor.hasOwnProperty('pageUrlRel')

        if (descriptor.hasOwnProperty(configName) || isProjectNode) {
            let value       = getValue ? getValue(descriptor) : descriptor[ configName ]

            if (value == 'inherit')
                isInheriting = true
            else
                return value
        }

        if (pageUrlConfigFound && !isInheriting) return undefined
    }

    return undefined
}
