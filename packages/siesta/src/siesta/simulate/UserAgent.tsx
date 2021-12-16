import { Sizzle } from "../../../web_modules/sizzle_patched.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { lastElement, saneSplit } from "../../util/Helpers.js"
import { Rect } from "../../util/Rect.js"
import { isArray, isNumber, isString } from "../../util/Typeguards.js"
import {
    ActionPointData,
    clientXtoPageX,
    clientYtoPageY,
    getActionPointData,
    getViewportActionPoint,
    getViewportRect,
    isOffsetInsideElementBox
} from "../../util_browser/Coordinates.js"
import {
    activeElement,
    elementFromPoint, focusElement,
    isElementAccessible,
    isElementConnected,
    isElementPointVisible,
    isSameDomainIframe,
    parentWindows
} from "../../util_browser/Dom.js"
import { getOffsetsMap, scrollElementPointIntoView } from "../../util_browser/Scroll.js"
import { isHTMLIFrameElement, isSameDomainHTMLIFrameElement } from "../../util_browser/Typeguards.js"
import { Test } from "../test/Test.js"
import { Assertion, SourcePoint } from "../test/TestResult.js"
import { SiestaModifierKey, SiestaTypeString } from "./SimulatorKeyboard.js"
import { PointerMovePrecision } from "./SimulatorMouse.js"
import {
    ActionableCheck,
    ActionTarget,
    ActionTargetOffset,
    equalPoints,
    isActionTarget,
    minusPoints,
    MouseButton,
    Point,
    Simulator,
    sumPoints
} from "./Types.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * The options for mouse action
 */
export type MouseActionOptions      = {
    /**
     * The target of the action.
     */
    target              : ActionTarget

    /**
     * Offset for the action. If not provided, the action happens in the center of the visible part of the target element.
     */
    offset              : ActionTargetOffset

    button              : MouseButton

    /**
     * Set to `true` to simulate `Shift` keypress during the action
     */
    shiftKey            : boolean

    /**
     * Set to `true` to simulate `Ctrl` keypress during the action
     */
    ctrlKey             : boolean

    /**
     * Set to `true` to simulate `Alt` keypress during the action
     */
    altKey              : boolean

    /**
     * Set to `true` to simulate `Meta` keypress during the action.
     */
    metaKey             : boolean

    /**
     * Mouse move precision to use, when moving the mouse cursor from its current location to the target point.
     */
    mouseMovePrecision  : PointerMovePrecision

    /**
     * When waiting for the target to [[AutoWaitingGuide|become actionable]], one of the checks that element needs to pass is "reachable".
     * It defines that the action point should be directly reachable by the user (be the top-most and not covered with
     * other elements). This setting defines whether to allow that point to be covered with child element of the target.
     *
     * Default is `true`.
     */
    allowChild          : boolean

    /**
     * The maximum time to wait for target to become actionable. By default its taken from the [[TestDescriptor.defaultTimeout]]
     */
    timeout             : number

    sourcePoint         : SourcePoint
}

/**
 * The options for the drag action
 */
export interface DragActionOptions extends MouseActionOptions {
    /**
     * Alias for [[source]]
     */
    from                : ActionTarget

    /**
     * The source of the drag action
     */
    source              : ActionTarget

    /**
     * Alias for [[sourceOffset]]
     */
    fromOffset          : ActionTargetOffset

    /**
     * The offset on the [[source]] element
     */
    sourceOffset        : ActionTargetOffset

    /**
     * The target element
     */
    target              : ActionTarget

    /**
     * Alias for `target`
     */
    to                  : ActionTarget

    /**
     * The offset on the [[target]] element
     */
    targetOffset        : ActionTargetOffset

    /**
     * Alias for [[targetOffset]]
     */
    toOffset            : ActionTargetOffset

    /**
     * Whether to skip the `mouse up` action in the drag and keep the button pressed, might be useful if you want to perform
     * a drag action consisting from several segments. In this case, don't forget to manually perform [[mouseUp]] action
     * later.
     */
    dragOnly            : boolean

    sourcePoint         : SourcePoint
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * The options object for the keyboard action
 */
export type KeyboardActionOptions   = {
    /**
     * The target element to type at
     */
    target              : ActionTarget

    /**
     * The text to type.
     */
    text                : SiestaTypeString

    /**
     * Whether to clear any existing text in the target `<input>/<textarea>` element before typing.
     */
    clearExisting       : boolean

    /**
     * Set to `true` to simulate `Shift` keypress during the action
     */
    shiftKey            : boolean

    /**
     * Set to `true` to simulate `Ctrl` keypress during the action
     */
    ctrlKey             : boolean

    /**
     * Set to `true` to simulate `Alt` keypress during the action
     */
    altKey              : boolean

    /**
     * Set to `true` to simulate `Meta` keypress during the action
     */
    metaKey             : boolean

    /**
     * Maximum time for the target element to [[AutoWaitingGuide|become actionable]].
     */
    timeout             : number

    /**
     * Delay between the individual key down / key up events. By default 0 (no delay)
     */
    delay               : number

    sourcePoint         : SourcePoint
}


const extractModifierKeys = (
    options : {
        shiftKey?           : boolean
        ctrlKey?            : boolean
        altKey?             : boolean
        metaKey?            : boolean
    }
) : SiestaModifierKey[] => {
    const res   : SiestaModifierKey[]       = []

    if (options.shiftKey) res.push('SHIFT')
    if (options.ctrlKey) res.push('CTRL')
    if (options.altKey) res.push('ALT')
    if (options.metaKey) res.push('CMD')

    return res
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface UserAgent {
    click (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
    click (options : Partial<MouseActionOptions>) : Promise<any>

    rightClick (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
    rightClick (options : Partial<MouseActionOptions>) : Promise<any>

    doubleClick (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
    doubleClick (options : Partial<MouseActionOptions>) : Promise<any>

    mouseDown (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
    mouseDown (options : Partial<MouseActionOptions>) : Promise<any>

    mouseUp (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
    mouseUp (options : Partial<MouseActionOptions>) : Promise<any>

    moveMouseTo (x : number, y : number, options? : Partial<MouseActionOptions>) : Promise<any>
    moveMouseTo (target : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
    moveMouseTo (options : Partial<MouseActionOptions>) : Promise<any>

    moveMouseBy (dx : number, dy : number, options? : Partial<MouseActionOptions>) : Promise<any>
    moveMouseBy (delta : Point, options? : Partial<MouseActionOptions>) : Promise<any>

    dragTo (options : Partial<DragActionOptions>) : Promise<any>
    dragTo (source : ActionTarget, target : ActionTarget, options? : Partial<DragActionOptions>) : Promise<any>
    dragBy (source : ActionTarget, delta : Point, options? : Partial<DragActionOptions>) : Promise<any>

    type (target : ActionTarget, text : SiestaTypeString, options? : Partial<KeyboardActionOptions>) : Promise<any>

    keyPress (target : ActionTarget, key : SiestaTypeString, options? : Partial<KeyboardActionOptions>) : Promise<any>

    keyDown (target : ActionTarget, key : SiestaTypeString) : Promise<any>

    keyUp (target : ActionTarget, key : SiestaTypeString) : Promise<any>
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type WaitForMouseTargetActionableResult = {
    success                 : boolean

    actionElement?          : Element
    actionPoint             : Point

    failedChecks            : ActionableCheck[]
}

export type WaitForMouseTargetActionableOptions = {
    sourcePoint?            : SourcePoint
    actionName?             : string

    silent?                 : boolean
    timeout?                : number
    waitForTargetReachable? : boolean

    syncCursor?             : boolean
    stabilityFrames?        : number
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type WaitForKeyboardTargetActionableResult = {
    success                 : boolean

    actionElement?          : Element

    failedChecks            : ActionableCheck[]
}

export type WaitForKeyboardTargetActionableOptions = {
    sourcePoint?            : SourcePoint
    actionName?             : string

    silent?                 : boolean
    timeout?                : number
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// user agent for Siesta's on-page tests
export class UserAgentOnPage extends Mixin(
    [ Test ],
    (base : ClassUnion<typeof Test>) =>

    class UserAgentOnPage extends base implements UserAgent {
        // allow the browser test initialize w/o exception even in Node.js environment
        // (we'll issue a meaningful error in this case later)
        window                  : Window                        = typeof window !== 'undefined' ? window : undefined

        simulator               : Simulator                     = undefined


        get onAmbiguousQuery () : 'use_first' | 'warn' | 'throw' {
            return 'warn'
        }


        get mouseMovePrecision () : PointerMovePrecision {
            return { kind : 'last_only', precision : 1 }
        }


        resolveActionTarget (target : ActionTarget, onAmbiguousQuery : 'use_first' | 'warn' | 'throw' = this.onAmbiguousQuery) : Element {
            const resolved  = this.resolveActionTargetAll(target)

            if (resolved.length > 1) {
                if (onAmbiguousQuery === 'warn')
                    this.warn(`Action target resolved to multiple elements: ${ target }`)
                else if (onAmbiguousQuery === 'throw')
                    throw new Error(`Action target resolved to multiple elements: ${ target }`)
            }

            return resolved[ 0 ]
        }


        resolveActionTargetAll (target : ActionTarget) : Element[] {
            if (!target) {
                return [ elementFromPoint(this.window.document, ...this.simulator.currentPosition, true).el ]
            }
            else if (target instanceof Array) {
                return [ elementFromPoint(this.window.document, ...(target.length === 0 ? this.simulator.currentPosition : target), true).el ]
            }
            else if (isString(target)) {
                return this.query(target)
            } else {
                return [ target ]
            }
        }


        /**
         * You probably don't need to use this method in your tests. Use [[query]] instead.
         * This method can be overridden by the subclass, to provide some extra query syntax, features etc.
         *
         * Performs a query in the DOM, by default it is a regular CSS query. Query is performed inside a single DOM context
         * (single iframe or single web component). See [[query]] for cross-context querying capabilities.
         *
         * @category Dom helper methods
         *
         * @param query
         * @param root
         */
        querySingleContext (query : string, root : Element | Document | ShadowRoot = this.window.document) : Element[] {
            if (/:contains\(/.test(query)) {
                return Sizzle(query, root)
            } else {
                return Array.from(root.querySelectorAll(query))
            }
        }


        /**
         * Performs a query in the DOM, by default it is a regular CSS query with extra capabilities.
         *
         * Notably, the `:contains(text)` pseudo is supported. It matches, if the text content of the element
         * contains the provided `text`.
         *
         * Also, the `->` characters split the query into segments, and each segment matches inside a "context".
         * Context can be either an iframe or a web component shadow DOM. Simply put, the `->` symbol marks the boundary
         * of the iframe/web component. Web component need to have "opened" shadow DOM for query to work.
         *
         * For example:
         * ```
         * // matches the `body` element of all iframes with `my-frame` CSS class
         * .my-frame -> body
         *
         * // matches the `body` element of all iframes with `nested-frame` CSS class, which are in turn contained
         * // inside the iframes with `my-frame` class
         * .my-frame -> .nested-frame -> body
         *
         * // matches the elements with `target-class` CSS class, which are inside the shadow DOM of the
         * // web component element with `my-web-comp1` class
         * .my-web-comp1 -> .target-class
         * ```
         *
         * This method uses [[querySingleContext]] to perform simple query inside a single context.
         *
         * @category Dom helper methods
         *
         * @param query An enhanced CSS selector
         * @param root The root DOM element (or a `Document`) from which to start the query. Optional, by default
         * its the `document` of the test context.
         */
        query (query : string, root : Element | Document | ShadowRoot = this.window.document) : Element[] {
            if (!query) throw new Error("The provided selector is empty")
            if (!isString(query)) throw new Error("The provided selector is not a string")

            const segments  = saneSplit(query, /\s*->\s*/)

            let currentRoots : Element[] = this.querySingleContext(segments[ 0 ], root)

            for (let i = 1; i < segments.length; i++) {
                const segment   = segments[ i ]

                const newRoots : Element[] = []

                for (let j = 0; j < currentRoots.length; j++) {
                    const currentRoot   = currentRoots[ j ]

                    if (isSameDomainHTMLIFrameElement(currentRoot)) {
                        newRoots.push(...this.querySingleContext(segment, currentRoot.contentDocument))
                    }
                    else if (currentRoot.shadowRoot) {
                        newRoots.push(...this.querySingleContext(segment, currentRoot.shadowRoot))
                    }
                }

                currentRoots    = newRoots
            }

            return currentRoots
        }

        /**
         * Performs a query in the DOM using [[query]] method and returns the 1st element from the results.
         *
         * @category Dom helper methods
         *
         * @param query
         * @param root
         */
        $ (query : string, root : Element | Document = this.window.document) : Element {
            return this.query(query, root)[ 0 ]
        }

        /**
         * Synonym for [[query]].
         *
         * @category Dom helper methods
         *
         * @param query
         * @param root
         */
        $$ (query : string, root : Element | Document = this.window.document) : Element[] {
            return this.query(query, root)
        }


        isActionTarget (a : any) : a is ActionTarget {
            return isActionTarget(a)
        }


        normalizeMouseActionOptions (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) : MouseActionOptions {
            const target        = this.isActionTarget(args[ 0 ]) ? args[ 0 ] : undefined
            const offset        = this.isActionTarget(args[ 0 ]) || args.length === 2 ? args[ 1 ] : args[ 0 ]

            const defaults : MouseActionOptions = {
                target,
                offset              : undefined,

                button              : 'left',

                shiftKey            : false,
                ctrlKey             : false,
                altKey              : false,
                metaKey             : false,

                mouseMovePrecision  : this.mouseMovePrecision,
                allowChild          : true,

                timeout             : this.defaultTimeout,
                sourcePoint         : this.getSourcePoint()
            }

            if (isArray(offset))
                defaults.offset     = offset
            else
                Object.assign(defaults, offset)

            return defaults
        }


        normalizeDragActionOptions (
            ...args :
                | [ options : Partial<DragActionOptions> ]
                | [ source : ActionTarget, target : ActionTarget, options? : Partial<DragActionOptions> ]
        ) : DragActionOptions {
            const source        = args.length === 1 ? undefined : args[ 0 ]
            const target        = args.length === 1 ? undefined : args[ 1 ]
            const options       = args.length === 1 ? args[ 0 ] : args[ 2 ]

            return Object.assign({
                source              : source ?? options?.source ?? options?.from,
                sourceOffset        : options?.sourceOffset ?? options?.fromOffset ?? options?.offset,

                target              : target ?? options?.target ?? options?.to,
                targetOffset        : options?.targetOffset ?? options?.toOffset,
                offset              : undefined,

                button              : 'left',

                shiftKey            : false,
                ctrlKey             : false,
                altKey              : false,
                metaKey             : false,

                dragOnly            : false,

                mouseMovePrecision  : this.mouseMovePrecision,
                allowChild          : true,

                timeout             : this.defaultTimeout,

                sourcePoint         : this.getSourcePoint(),
            } as DragActionOptions, options)
        }


        normalizeKeyboardActionOptions (target : ActionTarget, text : string, options? : Partial<KeyboardActionOptions>) : KeyboardActionOptions {
            return Object.assign({
                target,
                text,

                clearExisting       : false,

                shiftKey            : false,
                ctrlKey             : false,
                altKey              : false,
                metaKey             : false,

                timeout             : this.defaultTimeout,
                delay               : 0,

                sourcePoint         : this.getSourcePoint(),
            } as KeyboardActionOptions, options)
        }


        get cursorPagePosition () : Point {
            return [
                clientXtoPageX(this.simulator.currentPosition[ 0 ], this.window),
                clientYtoPageY(this.simulator.currentPosition[ 1 ], this.window)
            ]
        }


        get cursorViewportPosition () : Point {
            return this.simulator.currentPosition.slice() as Point
        }


        reportActionabilityCheckFailures (
            target          : ActionTarget,
            checks          : ActionableCheck[],
            waitOptions     : WaitForMouseTargetActionableOptions,
            actionOptions   : { sourcePoint : SourcePoint }
        ) {
            // TODO
            // 1) should list detailed failed checks (like for "reachable" for example, it should say
            //    with what other element the target is overlayed, etc
            // 2) in UI, should additionally dynamically display the failing checks while waiting for them

            this.addResult(Assertion.new({
                name        : 'waitForElementActionable',
                passed      : false,
                sourcePoint : actionOptions.sourcePoint ?? waitOptions.sourcePoint,
                annotation  : <div>
                    <div>Waited too long for { waitOptions.actionName } target <span>{ target }</span> to become actionable</div>
                    <div>Failed checks: `{ checks.join(" ") }`</div>
                </div>
            }))
        }


        async waitForKeyboardTargetActionable (action : KeyboardActionOptions, options? : WaitForKeyboardTargetActionableOptions) : Promise<WaitForKeyboardTargetActionableResult> {
            return await this.keepAlive(this.doWaitForKeyboardTargetActionable(action, options))
        }


        async doWaitForKeyboardTargetActionable (action : KeyboardActionOptions, options? : WaitForKeyboardTargetActionableOptions) : Promise<WaitForKeyboardTargetActionableResult> {
            const timeout               = options?.timeout ?? action.timeout ?? this.defaultTimeout
            const silent                = options?.silent ?? false

            if (!silent && !action.sourcePoint && !options?.sourcePoint) throw new Error('Need `sourcePoint` option for non-silent usage of `waitForKeyboardTargetActionable`')

            if (isArray(action.target) && action.target.length > 0) {
                throw new Error("Coordinates as target are not supported for keyboard actions")
            }

            const win               = this.window
            const target            = isArray(action.target) ? this.activeElement : action.target

            let el : Element        = undefined

            let warned : boolean    = false

            let failedChecks : ActionableCheck[]    = []

            const start             = Date.now()

            return new Promise((resolve, reject) => {

                const step = async () => {
                    try {
                        await doStep()
                    } catch (e) {
                        reject(e)
                    }
                }

                const doStep = async () => {
                    const elapsed   = Date.now() - start

                    if (elapsed >= timeout) {
                        if (!silent) this.reportActionabilityCheckFailures(action.target, failedChecks, options, action)

                        resolve({ success : false, actionElement : el, failedChecks })

                        return
                    }

                    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
                    const resolved      = this.resolveActionTargetAll(target)

                    if (!silent && resolved.length > 1) {
                        if (this.onAmbiguousQuery === 'throw')
                            throw new Error(`Query resolved to multiple elements: ${ target }`)
                        else if (this.onAmbiguousQuery === 'warn' && !warned) {
                            // warn about ambiguous target only once
                            warned      = true
                            this.warn(`Query resolved to multiple elements: ${ target }`)
                        }
                    }

                    //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
                    const checks : ActionableCheck[]  = []

                    el              = resolved[ 0 ]

                    if (!el) {
                        checks.push('present')
                        continueWaiting(checks)
                        return
                    }

                    if (!isElementConnected(el)) {
                        checks.push('connected')
                        continueWaiting(checks)
                        return
                    }

                    focusElement(el as HTMLElement)
                    // 2nd time is needed when focusing element inside the iframe in FF
                    focusElement(el as HTMLElement)

                    if (action.clearExisting) {
                        if ('value' in el) {
                            (el as HTMLInputElement).value  = ''
                        }
                    }

                    resolve({ success : true, actionElement : el, failedChecks })
                }

                const continueWaiting = (checks : ActionableCheck[]) => {
                    failedChecks        = checks

                    win.requestAnimationFrame(step)
                }

                step()
            })
        }



        async waitForMouseTargetActionable (action : MouseActionOptions, options? : WaitForMouseTargetActionableOptions) : Promise<WaitForMouseTargetActionableResult> {
            return await this.keepAlive(this.doWaitForMouseTargetActionable(action, options))
        }


        async doWaitForMouseTargetActionable (action : MouseActionOptions, options? : WaitForMouseTargetActionableOptions) : Promise<WaitForMouseTargetActionableResult> {
            const timeout               = options?.timeout ?? action.timeout ?? this.defaultTimeout
            const syncCursor            = options?.syncCursor ?? true
            const silent                = options?.silent ?? false
            const stabilityFrames       = options?.stabilityFrames ?? 2
            const waitForTargetReachable = options?.waitForTargetReachable ?? true

            if (!silent && !action.sourcePoint && !options?.sourcePoint) throw new Error('Need `sourcePoint` option for non-silent usage of `waitForMouseTargetActionable`')

            const actionTarget          = action.target ?? this.simulator.currentPosition.slice() as Point

            if (isArray(actionTarget)) {
                // TODO should wait for the stability of the element at the point

                // if we are given a coordinate system point, check that it is
                const point             = actionTarget.length === 0 ? this.simulator.currentPosition.slice() as Point : actionTarget

                const isVisible         = getViewportRect(this.window).containsPoint(point)

                if (!isVisible) {
                    if (!silent) this.reportActionabilityCheckFailures(actionTarget, [ 'visible' ], options, action)

                    return { success : false, failedChecks : [ 'visible' ], actionPoint : point }
                }

                await this.simulator.simulateMouseMove(point, { mouseMovePrecision : action.mouseMovePrecision, modifierKeys : extractModifierKeys(action) })

                return { success : true, failedChecks : [], actionPoint : point }
            }
            else {
                const target            = actionTarget

                let el : Element        = undefined

                let prevRect : Rect     = undefined
                let prevRect2 : Rect    = undefined

                let counter : number    = 0
                let counter2 : number   = 0

                let warned : boolean    = false

                let failedChecks : ActionableCheck[]    = []

                const win               = this.window

                const start             = Date.now()

                return new Promise((resolve, reject) => {

                    const step = async () => {
                        try {
                            await doStep()
                        } catch (e) {
                            reject(e)
                        }
                    }

                    const doStep = async () => {
                        const elapsed   = Date.now() - start

                        if (elapsed >= timeout) {
                            if (!silent) this.reportActionabilityCheckFailures(actionTarget, failedChecks, options, action)

                            resolve({ success : false, failedChecks, actionElement : el, actionPoint : undefined })

                            return
                        }

                        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
                        const resolved      = this.resolveActionTargetAll(target)

                        if (!silent && resolved.length > 1) {
                            if (this.onAmbiguousQuery === 'throw')
                                throw new Error(`Query resolved to multiple elements: ${ target }`)
                            else if (this.onAmbiguousQuery === 'warn' && !warned) {
                                // warn about ambiguous target only once
                                warned      = true
                                this.warn(`Query resolved to multiple elements: ${ target }`)
                            }
                        }

                        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
                        const checks : ActionableCheck[]  = []

                        el              = resolved[ 0 ]

                        if (!el) {
                            checks.push('present')
                            continueWaiting(true, checks)
                            return
                        }

                        if (!isElementConnected(el)) {
                            checks.push('connected')
                            continueWaiting(true, checks)
                            return
                        }

                        if (!isElementAccessible(el)) {
                            checks.push('accessible')
                            continueWaiting(true, checks)
                            return
                        }

                        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
                        const isInside  = isOffsetInsideElementBox(el, action.offset)

                        let offset : ActionTargetOffset = action.offset

                        let actionPointData : ActionPointData = undefined

                        // if offset point is outside of the element, we take an element from that point
                        // and wait for it stability
                        if (!isInside) {
                            actionPointData         = getActionPointData(el, action.offset)

                            const rect2             = Rect.fromElement(actionPointData.topElementData.el, true)

                            if (!prevRect2 || !prevRect2.isEqual(rect2)) {
                                prevRect2   = rect2
                                counter2    = 0

                                checks.push('stable')
                            } else {
                                counter2++

                                if (counter2 < stabilityFrames - 1) {
                                    checks.push('stable')
                                }
                            }
                        }

                        // the `true` argument returns a rect in global (top-level window) coordinates
                        // and handles the case when the iframe itself is moving
                        const rect      = Rect.fromElement(el, true)

                        // waiting for stability of the element itself (above we possibly waited for
                        // stability of the outside point)
                        if (!prevRect || !prevRect.isEqual(rect)) {
                            prevRect    = rect
                            counter     = 0

                            checks.push('stable')
                        } else {
                            counter++

                            if (counter < stabilityFrames - 1) {
                                checks.push('stable')
                            }
                        }

                        if (lastElement(checks) === 'stable') {
                            continueWaiting(false, checks)
                            return
                        }

                        if (isInside) {
                            if (!isElementPointVisible(el, action.offset, true).visible) {
                                const scrolled  = scrollElementPointIntoView(el, action.offset, true)

                                // TODO should save the rect for the repeated stability check here?
                                // stability check will be repeated because of scroll

                                if (!scrolled || !isElementPointVisible(el, action.offset, true).visible) {
                                    checks.push('visible')
                                    continueWaiting(true, checks)
                                    return
                                }
                            }
                        } else {
                            el              = actionPointData.topElementData.el
                            const rect      = Rect.fromElement(el)

                            offset          = minusPoints(actionPointData.topElementData.localXY, rect.leftTop)

                            if (!isElementPointVisible(el, offset, true).visible) {
                                const scrolled  = scrollElementPointIntoView(el, offset, true)

                                if (!scrolled || !isElementPointVisible(el, offset, true).visible) {
                                    checks.push('visible')
                                    continueWaiting(true, checks)
                                    return
                                }
                            }
                        }

                        // local action point - if offset is not specified it is set to a center of the element's visible area
                        const point         = getViewportActionPoint(el, offset)

                        if (!point) {
                            checks.push('reachable')
                            continueWaiting(false, checks)
                            return
                        }

                        const win           = el.ownerDocument.defaultView
                        const offsets       = getOffsetsMap(win)

                        const globalPoint   = sumPoints(offsets.get(win), point)

                        if (syncCursor && !equalPoints(globalPoint, this.simulator.currentPosition)) {
                            await this.simulator.simulateMouseMove(globalPoint, {
                                mouseMovePrecision  : action.mouseMovePrecision,
                                modifierKeys        : extractModifierKeys(action)
                            })

                            checks.push('reachable')
                            continueWaiting(false, checks)
                            return
                        }

                        if (waitForTargetReachable && isInside) {
                            const topWin        = lastElement(Array.from(parentWindows(win, true)))
                            const elAtPoint     = elementFromPoint(topWin.document, ...point, true).el

                            const reachability  = elAtPoint === el || action.allowChild && (el.contains(elAtPoint) || (
                                isHTMLIFrameElement(el) && isSameDomainIframe(el) && el.contentDocument.documentElement.contains(elAtPoint)
                            ))

                            if (!reachability) {
                                checks.push('reachable')
                                continueWaiting(false, checks)
                                return
                            }
                        }

                        resolve({ success : true, failedChecks : [], actionPoint : globalPoint, actionElement : el })
                    }

                    const continueWaiting = (reset : boolean, checks : ActionableCheck[]) => {
                        if (reset) {
                            // prevEl      = undefined
                            prevRect    = undefined
                            prevRect2   = undefined
                        }

                        failedChecks        = checks

                        win.requestAnimationFrame(step)
                    }

                    step()
                })

            }
        }

        /**
         * Simulates a click on the given [[ActionTarget]] at the given [[ActionTargetOffset]] point. If offset is not provided
         * the action happens in the center of the visible part of the target element.
         *
         * Before performing an action, Siesta waits for the target element to [[AutoWaitingGuide|become actionable]]
         * and synchronize the cursor position.
         *
         * This method has 2 overloads and `target` and `offset` can be given either as positional arguments, or in the form
         * of the [[MouseActionOptions]] object.
         *
         * For example:
         *
         * ```javascript
         * await t.click('.css-class .another-css.class', [ 30, 40 ])
         * await t.click('.css-class .another-css.class', { offset : [ 30, 40 ], ctrlKey : true })
         * await t.click({ target : '.css-class .another-css.class', offset : [ 30, 40 ], ctrlKey : true })
         * ```
         *
         * A special case of
         * ```javascript
         * await t.click()
         * ```
         * is equivalent to `t.click([])` - clicking at the current cursor location.
         *
         * @category User action simulation
         *
         * @param target
         * @param offset
         */
        async click (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async click (options : Partial<MouseActionOptions>) : Promise<any>
        async click (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                actionName      : 'click',
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateClick({ button : action.button, modifierKeys : extractModifierKeys(action) })
            )
        }


        /**
         * Simulates a right click on the given [[ActionTarget]] at the given [[ActionTargetOffset]] point. If offset is not provided
         * the action happens in the center of the visible part of the target element.
         *
         * Before performing an action, Siesta waits for the target element to [[AutoWaitingGuide|become actionable]]
         * and synchronize the cursor position.
         *
         * This method has 2 overloads and `target` and `offset` can be given either as positional arguments, or in the form
         * of the [[MouseActionOptions]] object.
         *
         * For example:
         *
         * ```javascript
         * await t.rightClick('.css-class .another-css.class', [ 30, 40 ])
         * await t.rightClick('.css-class .another-css.class', { offset : [ 30, 40 ], ctrlKey : true })
         * await t.rightClick({ target : '.css-class .another-css.class', offset : [ 30, 40 ], ctrlKey : true })
         * ```
         *
         * A special case of
         * ```javascript
         * await t.rightClick()
         * ```
         * is equivalent to `t.rightClick([])` - clicking at the current cursor location.
         *
         * @category User action simulation
         *
         * @param target
         * @param offset
         */
        async rightClick (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async rightClick (options : Partial<MouseActionOptions>) : Promise<any>
        async rightClick (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                actionName      : 'right click',
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateClick({ button : 'right', modifierKeys : extractModifierKeys(action) })
            )
        }


        /**
         * Simulates a double click on the given [[ActionTarget]] at the given [[ActionTargetOffset]] point. If offset is not provided
         * the action happens in the center of the visible part of the target element.
         *
         * Before performing an action, Siesta waits for the target element to [[AutoWaitingGuide|become actionable]]
         * and synchronize the cursor position.
         *
         * This method has 2 overloads and `target` and `offset` can be given either as positional arguments, or in the form
         * of the [[MouseActionOptions]] object.
         *
         * For example:
         *
         * ```javascript
         * await t.doubleClick('.css-class .another-css.class', [ 30, 40 ])
         * await t.doubleClick('.css-class .another-css.class', { offset : [ 30, 40 ], ctrlKey : true })
         * await t.doubleClick({ target : '.css-class .another-css.class', offset : [ 30, 40 ], ctrlKey : true })
         * ```
         *
         * A special case of
         * ```javascript
         * await t.doubleClick()
         * ```
         * is equivalent to `t.doubleClick([])` - clicking at the current cursor location.
         *
         * @category User action simulation
         *
         * @param target
         * @param offset
         */
        async doubleClick (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async doubleClick (options : Partial<MouseActionOptions>) : Promise<any>
        async doubleClick (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                actionName      : 'double click',
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateDblClick({ button : action.button, modifierKeys : extractModifierKeys(action) })
            )
        }

        /**
         * Simulates a "mouse down" action on the given [[ActionTarget]] at the given [[ActionTargetOffset]] point. If offset is not provided
         * the action happens in the center of the visible part of the target element.
         *
         * Before performing an action, Siesta waits for the target element to [[AutoWaitingGuide|become actionable]]
         * and synchronize the cursor position.
         *
         * This method has 2 overloads and `target` and `offset` can be given either as positional arguments, or in the form
         * of the [[MouseActionOptions]] object.
         *
         * For example:
         *
         * ```javascript
         * await t.mouseDown('.css-class .another-css.class', [ 30, 40 ])
         * await t.mouseDown('.css-class .another-css.class', { offset : [ 30, 40 ], ctrlKey : true })
         * await t.mouseDown({ target : '.css-class .another-css.class', offset : [ 30, 40 ], ctrlKey : true })
         * ```
         *
         * A special case of
         * ```javascript
         * await t.mouseDown()
         * ```
         * is equivalent to `t.mouseDown([])` - clicking at the current cursor location.
         *
         * @category User action simulation
         *
         * @param target
         * @param offset
         */
        async mouseDown (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async mouseDown (options : Partial<MouseActionOptions>) : Promise<any>
        async mouseDown (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                actionName      : 'mouse down',
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateMouseDown({ button : action.button, modifierKeys : extractModifierKeys(action) })
            )
        }


        /**
         * Simulates a "mouse up" action on the given [[ActionTarget]] at the given [[ActionTargetOffset]] point. If offset is not provided
         * the action happens in the center of the visible part of the target element.
         *
         * Before performing an action, Siesta waits for the target element to [[AutoWaitingGuide|become actionable]]
         * and synchronize the cursor position.
         *
         * This method has 2 overloads and `target` and `offset` can be given either as positional arguments, or in the form
         * of the [[MouseActionOptions]] object.
         *
         * For example:
         *
         * ```javascript
         * await t.mouseUp('.css-class .another-css.class', [ 30, 40 ])
         * await t.mouseUp('.css-class .another-css.class', { offset : [ 30, 40 ], ctrlKey : true })
         * await t.mouseUp({ target : '.css-class .another-css.class', offset : [ 30, 40 ], ctrlKey : true })
         * ```
         *
         * A special case of
         * ```javascript
         * await t.mouseUp()
         * ```
         * is equivalent to `t.mouseUp([])` - clicking at the current cursor location.
         *
         * @category User action simulation
         *
         * @param target
         * @param offset
         */
        async mouseUp (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async mouseUp (options : Partial<MouseActionOptions>) : Promise<any>
        async mouseUp (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                actionName      : 'mouse up',
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateMouseUp({ button : action.button, modifierKeys : extractModifierKeys(action) })
            )
        }


        /**
         * Simulates "mouse move" action to the given [[ActionTarget]] at the given [[ActionTargetOffset]] point. If offset is not provided,
         * cursor moves to the center of the visible part of the target element.
         *
         * Before performing mouse move, Siesta waits for the target element to [[AutoWaitingGuide|become actionable]].
         *
         * This method has several overloads and `target` and `offset` can be given either as positional arguments, or in the form
         * of the [[MouseActionOptions]] object.
         *
         * For example:
         *
         * ```javascript
         * await t.moveMouseTo(30, 40)
         * await t.moveMouseTo([ 30, 40 ])
         * await t.moveMouseTo('.css-class .another-css.class', [ 30, 40 ])
         * await t.moveMouseTo('.css-class .another-css.class', { offset : [ 30, 40 ], ctrlKey : true })
         * await t.moveMouseTo({ target : '.css-class .another-css.class', offset : [ 30, 40 ], ctrlKey : true })
         * ```
         *
         * @category User action simulation
         *
         * @param x
         * @param y
         * @param options
         */
        async moveMouseTo (x : number, y : number, options? : Partial<MouseActionOptions>) : Promise<any>
        async moveMouseTo (target : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>)
        async moveMouseTo (options : Partial<MouseActionOptions>)
        async moveMouseTo (
            ...args :
                | [ x : number, y : number, options? : Partial<MouseActionOptions> ]
                | [ target : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const target        = this.isActionTarget(args[ 0 ])
                ? args[ 0 ]
                : isNumber(args[ 0 ]) ? [ args[ 0 ], args[ 1 ] ] as Point : undefined

            const offsetOrOptions = (isNumber(args[ 0 ]) && isNumber(args[ 1 ])
                ? args[ 2 ]
                : this.isActionTarget(args[ 0 ]) ? args[ 1 ] : args[ 0 ]) as ActionTargetOffset | Partial<MouseActionOptions>

            if (target !== undefined && offsetOrOptions && !isArray(offsetOrOptions)) offsetOrOptions.target = target

            const action        = this.normalizeMouseActionOptions(target, offsetOrOptions)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                actionName      : 'mouse move',
                waitForTargetReachable : false
            })
        }


        /**
         * Simulates a relative "mouse move" action, from the current position, by the given delta.
         *
         * This method has several overloads and `delta` can be provided either as a [[Point]] or 2 positional arguments.
         *
         * For example:
         *
         * ```javascript
         * await t.moveMouseBy(30, 40)
         * await t.moveMouseBy([ 30, 40 ], { ctrlKey : true })
         * ```
         *
         * @category User action simulation
         *
         * @param target
         * @param offset
         */
        async moveMouseBy (dx : number, dy : number, options? : Partial<MouseActionOptions>) : Promise<any>
        async moveMouseBy (delta : Point, options? : Partial<MouseActionOptions>)
        async moveMouseBy (
            ...args :
                | [ dx : number, dy : number, options? : Partial<MouseActionOptions> ]
                | [ delta : Point, options? : Partial<MouseActionOptions> ]
        ) {
            const delta     = isNumber(args[ 0 ]) ? [ args[ 0 ], args[ 1 ] ] as Point : args[ 0 ]
            const options   = isNumber(args[ 1 ]) ? args[ 2 ] : args[ 1 ]

            await this.moveMouseTo(sumPoints(this.simulator.currentPosition, delta), options)
        }


        /**
         * Simulates a drag action, from the `source` element, to the `target` element
         *
         * This method has several overloads and `source` and `target` can be provided either as positional arguments, or
         * as properties of the [[DragActionOptions]] object.
         *
         * For example:
         *
         * ```javascript
         * await t.dragTo('#source', '#target', { ctrlKey : true })
         * await t.dragTo({ source : '#source', target : '#target', ctrlKey : true })
         * ```
         *
         * @category User action simulation
         *
         * @param options
         */
        async dragTo (options : Partial<DragActionOptions>) : Promise<any>
        async dragTo (source : ActionTarget, target : ActionTarget, options? : Partial<DragActionOptions>) : Promise<any>
        async dragTo (
            ...args :
                | [ options : Partial<DragActionOptions> ]
                | [ source : ActionTarget, target : ActionTarget, options? : Partial<DragActionOptions> ]
        )
            : Promise<any>
        {
            const dragAction        = this.normalizeDragActionOptions(...args)

            if (!dragAction.target) throw new Error("No drag target provided")

            const sourceMouseAction = Object.assign({}, dragAction, { target : dragAction.source, offset : dragAction.sourceOffset })

            await this.mouseDown(sourceMouseAction)

            const targetMouseAction = Object.assign({}, dragAction, { target : dragAction.target, offset : dragAction.targetOffset })

            await this.moveMouseTo(targetMouseAction)

            if (!dragAction.dragOnly) await this.mouseUp(
                Object.assign({}, dragAction, { target : [] })
            )
        }


        /**
         * Simulates a drag action, from the given `source` element, by the given delta.
         *
         * For example:
         *
         * ```javascript
         * await t.dragBy('#source', [ 10, 20 ], { ctrlKey : true })
         * await t.dragBy([], [ 10, 20 ], { ctrlKey : true }) // drag from current cursor position
         * ```
         *
         * @category User action simulation
         *
         * @param options
         */
        async dragBy (source : ActionTarget, delta : Point, options? : Partial<DragActionOptions>) : Promise<any> {
            if (!delta) throw new Error("No drag delta provided")

            const normalized        = Object.assign({}, options, { sourcePoint : this.getSourcePoint() })

            const sourceMouseAction = Object.assign({}, normalized, { target : source, offset : options?.sourceOffset ?? options?.offset })

            await this.mouseDown(sourceMouseAction)

            await this.moveMouseBy(delta, Object.assign({}, normalized, { target : undefined }))

            if (!options?.dragOnly) await this.mouseUp(
                Object.assign({}, normalized, { target : [] })
            )
        }


        //⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼
        get activeElement () : Element {
            return activeElement(this.window.document)
        }


        /**
         * Simulates keyboard typing on the given `target` element. Performs all actions that a real user would do,
         * including pressing and releasing a keyboard button for every character.
         *
         * If target is provided as `[]` or `null`, the typing will be performed on the currently focused element.
         * Otherwise, target will be resolved and focused.
         *
         * Simulation of pressing the special keys is supported. You can specify them, by using their all uppercased
         * key name inside the square brackets: `[ENTER]`, `[BACKSPACE]`, `[LEFT]`. To type `[ENTER]` as plain text and not as
         * a special character - use double square brackets: `[[ENTER]`<span>]</span>. The full list of special key names is
         * [[KeyNamesGuide|available here]].
         *
         * To specify a control key like "SHIFT / CONTROL / ALT / META" of to be pressed during typing, use the `options`
         * argument.
         *
         * For example:
         *
         * ```javascript
         * await t.type('#source', 'some text[ENTER]', { ctrlKey : true })
         * ```
         *
         * @category User action simulation
         *
         * @param target
         * @param text The text to type
         * @param options Additional options for the action
         */
        async type (target : ActionTarget, text : string, options? : Partial<KeyboardActionOptions>) : Promise<any> {
            const keyboardAction    = this.normalizeKeyboardActionOptions(target ?? this.activeElement, text, options)

            const waitRes       = await this.waitForKeyboardTargetActionable(keyboardAction, {
                actionName      : 'type'
            })

            if (waitRes.success)
                await this.keepAlive(
                    this.simulator.simulateType(text, { delay : options?.delay, modifierKeys : extractModifierKeys(keyboardAction) })
                )
        }


        /**
         * Simulates a single key press on the given `target` element.
         *
         * For example:
         *
         * ```javascript
         * await t.keyPress('#source', 's', { ctrlKey : true })
         * ```
         *
         * @category User action simulation
         *
         * @param target
         * @param key
         * @param options
         */
        async keyPress (target : ActionTarget, key : string, options? : Partial<KeyboardActionOptions>) : Promise<any> {
            const keyboardAction    = this.normalizeKeyboardActionOptions(target ?? this.activeElement, key, options)

            const waitRes       = await this.waitForKeyboardTargetActionable(keyboardAction, {
                actionName      : 'keyPress'
            })

            if (waitRes.success)
                await this.keepAlive(
                    this.simulator.simulateKeyPress(key, { delay : options?.delay, modifierKeys : extractModifierKeys(keyboardAction) })
                )
        }


        /**
         * Simulates a key down action on the given `target` element.
         *
         * For example:
         *
         * ```javascript
         * await t.keyDown('#source', 's')
         * ```
         *
         * @category User action simulation
         *
         * @param target
         * @param key
         */
        async keyDown (target : ActionTarget, key : string) : Promise<any> {
            const keyboardAction    = this.normalizeKeyboardActionOptions(target ?? this.activeElement, key)

            const waitRes       = await this.waitForKeyboardTargetActionable(keyboardAction, {
                actionName      : 'keyDown'
            })

            if (waitRes.success)
                await this.keepAlive(this.simulator.simulateKeyDown(key))
        }


        /**
         * Simulates a key up action on the given `target` element.
         *
         * For example:
         *
         * ```javascript
         * await t.keyUp('#source', 's')
         * ```
         *
         * @category User action simulation
         *
         * @param target
         * @param key
         */
        async keyUp (target : ActionTarget, key : string) : Promise<any> {
            const keyboardAction    = this.normalizeKeyboardActionOptions(target ?? this.activeElement, key)

            const waitRes       = await this.waitForKeyboardTargetActionable(keyboardAction, {
                actionName      : 'keyUp'
            })

            if (waitRes.success)
                await this.keepAlive(this.simulator.simulateKeyUp(key))
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// this is user agent for classic browser automation tests,
// where the test itself is running in the OS process (like Node.js)
// and it operates on the browser page, usually using `page.evaluate()`
// this is how Puppeteer, Playwright and Selenium works

// idea is that the user actions API should be identical
// export class UserAgentExternal extends Mixin(
//     [ Base ],
//     (base : AnyConstructor<Base, typeof Base>) =>
//
//     class UserAgentExternal extends base implements UserAgent {
//
//         simulator           : Simulator     = undefined
//
//
//         async click () {
//         }
//
//
//         async rightClick () {
//         }
//
//
//         async doubleClick () {
//         }
//
//
//         async mouseDown () {
//         }
//
//
//         async mouseUp () {
//         }
//
//
//         async moveMouseTo (x : number, y : number, options? : Partial<MouseActionOptions>) : Promise<any>
//         async moveMouseTo (target : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>)
//         async moveMouseTo (
//             ...args :
//                 | [ x : number, y : number, options? : Partial<MouseActionOptions> ]
//                 | [ target : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
//         ) {
//         }
//
//
//         async moveMouseBy (dx : number, dy : number, options? : Partial<MouseActionOptions>) : Promise<any>
//         async moveMouseBy (delta : Point, options? : Partial<MouseActionOptions>)
//         async moveMouseBy (
//             ...args :
//                 | [ dx : number, dy : number, options? : Partial<MouseActionOptions> ]
//                 | [ delta : Point, options? : Partial<MouseActionOptions> ]
//         ) {
//         }
//
//
//         async type (target : ActionTarget, text : string, options? : Partial<KeyboardActionOptions>) : Promise<any> {
//         }
//
//
//         async keyPress (target : ActionTarget, key : string, options? : Partial<KeyboardActionOptions>) : Promise<any> {
//         }
//
//
//         async keyDown (target : ActionTarget, key : string) : Promise<any> {
//         }
//
//
//         async keyUp (target : ActionTarget, key : string) : Promise<any> {
//         }
//     }
// ) {}
//
