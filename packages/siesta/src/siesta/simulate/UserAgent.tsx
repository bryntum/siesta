import { Base } from "../../class/Base.js"
import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { lastElement } from "../../util/Helpers.js"
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
    elementFromPoint,
    isElementAccessible,
    isElementConnected,
    isElementPointVisible,
    isSameDomainIframe,
    parentWindows
} from "../../util_browser/Dom.js"
import { getOffsetsMap, scrollElementPointIntoView } from "../../util_browser/Scroll.js"
import { isHTMLElement, isHTMLIFrameElement, isSVGElement } from "../../util_browser/Typeguards.js"
import { Test } from "../test/Test.js"
import { Assertion, SourcePoint } from "../test/TestResult.js"
import { SiestaModifierKey, SiestaTypeString, TypeOptions } from "./SimulatorKeyboard.js"
import { PointerMovePrecision } from "./SimulatorMouse.js"
import { SimulatorPlaywrightClient } from "./SimulatorPlaywright.js"
import {
    ActionableCheck,
    ActionTarget,
    ActionTargetOffset,
    equalPoints, isActionTarget,
    minusPoints,
    MouseButton,
    Point, Simulator,
    sumPoints
} from "./Types.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type MouseActionOptions      = {
    target              : ActionTarget
    offset              : ActionTargetOffset

    button              : MouseButton

    shiftKey?           : boolean
    ctrlKey?            : boolean
    altKey?             : boolean
    metaKey?            : boolean

    mouseMovePrecision  : PointerMovePrecision
    allowChild          : boolean

    timeout             : number
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type KeyboardActionOptions   = {
    target              : ActionTarget
    text                : SiestaTypeString

    waitForTarget       : boolean
    clearExisting       : boolean

    shiftKey?           : boolean
    ctrlKey?            : boolean
    altKey?             : boolean
    metaKey?            : boolean

    timeout             : number
    // delay between the key down / key up events
    delay               : number
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

    // dragTo (source : ActionTarget, target : ActionTarget) : Promise<any>
    // dragBy (source : ActionTarget, target : ActionTarget) : Promise<any>

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

    syncCursor?             : boolean
    silent?                 : boolean
    timeout?                : number
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

        window                  : Window                        = window

        simulator               : SimulatorPlaywrightClient     = undefined

        onAmbiguousQuery        : 'use_first' | 'warn' | 'throw'   = 'warn'

        // coordinatesSystem   : 'page' | 'viewport'           = 'viewport'


        get mouseMovePrecision () : PointerMovePrecision {
            return { kind : 'last_only', precision : 1 }
        }


        resolveActionTarget (target : ActionTarget) : Element {
            if (target instanceof Array) {
                return elementFromPoint(this.window.document, ...(target.length === 0 ? this.getCursorViewportPosition() : target), true).el
            }
            else {
                return this.normalizeElement(target)
            }
        }


        normalizeElement (el : string | Element, onAmbiguousQuery : 'use_first' | 'warn' | 'throw' = this.onAmbiguousQuery) : Element | undefined {
            if (isString(el)) {
                const resolved      = this.query(el)

                if (resolved.length > 1) {
                    if (onAmbiguousQuery === 'warn')
                        this.warn(`Query resolved to multiple elements: ${ el }`)
                    else if (onAmbiguousQuery === 'throw')
                        throw new Error(`Query resolved to multiple elements: ${ el }`)
                }

                return resolved[ 0 ]
            } else {
                return el
            }
        }


        normalizeElementDetailed (
            el : string | Element, onResolvedToMultiple : 'use_first' | 'warn' | 'throw' = this.onAmbiguousQuery
        )
            : { el : Element, multiple : boolean }
        {
            if (isString(el)) {
                const resolved      = this.query(el)

                return { el : resolved[ 0 ], multiple : resolved.length > 1 }
            } else {
                return { el, multiple : false }
            }
        }


        query (query : string) : Element[] {
            return Array.from(this.window.document.querySelectorAll(query))
        }


        $ (query : string) : Element {
            return this.query(query)[ 0 ]
        }


        $$ (query : string) : Element[] {
            return this.query(query)
        }


        normalizeMouseActionOptions (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) : MouseActionOptions {
            const target        = isActionTarget(args[ 0 ]) ? args[ 0 ] : undefined
            const offset        = isActionTarget(args[ 0 ]) || args.length === 2 ? args[ 1 ] : args[ 0 ]

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
            }

            if (isArray(offset))
                defaults.offset     = offset
            else
                Object.assign(defaults, offset)

            return defaults
        }


        normalizeKeyboardActionOptions (target : ActionTarget, text : string, options? : Partial<KeyboardActionOptions>) : KeyboardActionOptions {
            return Object.assign({
                target,
                text,

                waitForTarget       : true,
                clearExisting       : false,

                shiftKey            : false,
                ctrlKey             : false,
                altKey              : false,
                metaKey             : false,

                timeout             : this.defaultTimeout,
                delay               : 0,
            } as KeyboardActionOptions, options)
        }


        getCursorPagePosition () : Point {
            return [
                clientXtoPageX(this.simulator.currentPosition[ 0 ], this.window),
                clientYtoPageY(this.simulator.currentPosition[ 1 ], this.window)
            ]
        }


        getCursorViewportPosition () : Point {
            return this.simulator.currentPosition.slice() as Point
        }


        reportActionabilityCheckFailures (target : ActionTarget, checks : ActionableCheck[], options : WaitForMouseTargetActionableOptions) {
            // TODO
            // 1) should list detailed failed checks (like for "reachable" for example, it should say
            //    with what other element the target is overlayed, etc
            // 2) in UI, should additionally dynamically display the failing checks while waiting for them

            this.addResult(Assertion.new({
                name        : 'waitForElementActionable',
                passed      : false,
                sourcePoint : options.sourcePoint,
                annotation  : <div>
                    <div>Waited too long for { options.actionName } target <span>{ target }</span> to become actionable</div>
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

            if (!silent && !options?.sourcePoint) throw new Error('Need `sourcePoint` option for non-silent usage of `waitForKeyboardTargetActionable`')

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
                        if (!silent) this.reportActionabilityCheckFailures(action.target, failedChecks, options)

                        resolve({ success : false, actionElement : el, failedChecks })

                        return
                    }

                    //-----------------
                    const res       = this.normalizeElementDetailed(target)

                    if (!silent && res.multiple) {
                        if (this.onAmbiguousQuery === 'throw')
                            throw new Error(`Query resolved to multiple elements: ${ target }`)
                        else if (this.onAmbiguousQuery === 'warn' && !warned) {
                            // warn about ambiguous target only once
                            warned      = true
                            this.warn(`Query resolved to multiple elements: ${ target }`)
                        }
                    }

                    //-----------------
                    const checks : ActionableCheck[]  = []

                    el              = res.el

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

                    (el as HTMLElement).focus({ preventScroll : true })

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

            if (!silent && !options?.sourcePoint) throw new Error('Need `sourcePoint` option for non-silent usage of `waitForMouseTargetActionable`')

            const actionTarget          = action.target ?? this.simulator.currentPosition.slice() as Point

            if (isArray(actionTarget)) {
                // if we are given a coordinate system point, check that it is
                const point             = actionTarget.length === 0 ? this.simulator.currentPosition.slice() as Point : actionTarget

                const isVisible         = getViewportRect(this.window).containsPoint(point)

                if (!isVisible) {
                    if (!silent) this.reportActionabilityCheckFailures(actionTarget, [ 'visible' ], options)

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
                            if (!silent) this.reportActionabilityCheckFailures(actionTarget, failedChecks, options)

                            resolve({ success : false, failedChecks, actionElement : el, actionPoint : undefined })

                            return
                        }

                        //-----------------
                        const res       = this.normalizeElementDetailed(target)

                        if (!silent && res.multiple) {
                            if (this.onAmbiguousQuery === 'throw')
                                throw new Error(`Query resolved to multiple elements: ${ target }`)
                            else if (this.onAmbiguousQuery === 'warn' && !warned) {
                                // warn about ambiguous target only once
                                warned      = true
                                this.warn(`Query resolved to multiple elements: ${ target }`)
                            }
                        }

                        //-----------------
                        const checks : ActionableCheck[]  = []

                        el              = res.el

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

                        //-----------------
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
                            if (!isElementPointVisible(el, action.offset, true)) {
                                const scrolled  = scrollElementPointIntoView(el, action.offset, true)

                                // TODO should save the rect for the repeated stability check here?
                                // stability check will be repeated because of scroll

                                if (!scrolled || !isElementPointVisible(el, action.offset, true)) {
                                    checks.push('visible')
                                    continueWaiting(true, checks)
                                    return
                                }
                            }
                        } else {
                            el              = actionPointData.topElementData.el
                            const rect      = Rect.fromElement(el)

                            offset          = minusPoints(actionPointData.topElementData.localXY, rect.leftTop)

                            if (!isElementPointVisible(el, offset, true)) {
                                const scrolled  = scrollElementPointIntoView(el, offset, true)

                                if (!scrolled || !isElementPointVisible(el, offset, true)) {
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

                        if (isInside) {
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


        async click (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async click (options : Partial<MouseActionOptions>) : Promise<any>
        async click (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'click',
                timeout         : action.timeout
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateClick({ button : action.button, modifierKeys : extractModifierKeys(action) })
            )
        }


        async rightClick (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async rightClick (options : Partial<MouseActionOptions>) : Promise<any>
        async rightClick (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'right click',
                timeout         : action.timeout
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateClick({ button : 'right', modifierKeys : extractModifierKeys(action) })
            )
        }


        async doubleClick (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async doubleClick (options : Partial<MouseActionOptions>) : Promise<any>
        async doubleClick (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'double click',
                timeout         : action.timeout
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateDblClick({ button : action.button, modifierKeys : extractModifierKeys(action) })
            )
        }


        async mouseDown (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async mouseDown (options : Partial<MouseActionOptions>) : Promise<any>
        async mouseDown (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'mouse down',
                timeout         : action.timeout
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateMouseDown({ button : action.button, modifierKeys : extractModifierKeys(action) })
            )
        }


        async mouseUp (target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>) : Promise<any>
        async mouseUp (options : Partial<MouseActionOptions>) : Promise<any>
        async mouseUp (
            ...args :
                | [ target? : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const action        = this.normalizeMouseActionOptions(...args)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'mouse up',
                timeout         : action.timeout
            })

            if (waitRes.success) await this.keepAlive(
                this.simulator.simulateMouseUp({ button : action.button, modifierKeys : extractModifierKeys(action) })
            )
        }


        async moveMouseTo (x : number, y : number, options? : Partial<MouseActionOptions>) : Promise<any>
        async moveMouseTo (target : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions>)
        async moveMouseTo (options : Partial<MouseActionOptions>)
        async moveMouseTo (
            ...args :
                | [ x : number, y : number, options? : Partial<MouseActionOptions> ]
                | [ target : ActionTarget, offset? : ActionTargetOffset | Partial<MouseActionOptions> ]
                | [ options : Partial<MouseActionOptions> ]
        ) {
            const target        = isActionTarget(args[ 0 ])
                ? args[ 0 ]
                : isNumber(args[ 0 ]) ? [ args[ 0 ], args[ 1 ] ] as Point : undefined

            const offset        = (isNumber(args[ 0 ]) && isNumber(args[ 1 ])
                ? args[ 2 ]
                : isActionTarget(args[ 0 ]) ? args[ 1 ] : args[ 0 ]) as ActionTargetOffset | Partial<MouseActionOptions>

            const action        = this.normalizeMouseActionOptions(target, offset)

            const waitRes       = await this.waitForMouseTargetActionable(action, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'mouse move',
                timeout         : action.timeout
            })
        }


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


        get activeElement () : Element {
            return this.window.document.activeElement
        }


        async type (target : ActionTarget, text : string, options? : Partial<KeyboardActionOptions>) : Promise<any> {
            const keyboardAction    = this.normalizeKeyboardActionOptions(target ?? this.activeElement, text, options)

            const waitRes       = await this.waitForKeyboardTargetActionable(keyboardAction, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'type',
                timeout         : keyboardAction.timeout
            })

            if (waitRes.success)
                await this.keepAlive(
                    this.simulator.simulateType(text, { delay : options?.delay, modifierKeys : extractModifierKeys(keyboardAction) })
                )
        }


        async keyPress (target : ActionTarget, key : string, options? : Partial<KeyboardActionOptions>) : Promise<any> {
            const keyboardAction    = this.normalizeKeyboardActionOptions(target ?? this.activeElement, key, options)

            const waitRes       = await this.waitForKeyboardTargetActionable(keyboardAction, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'keyPress',
                timeout         : keyboardAction.timeout
            })

            if (waitRes.success)
                await this.keepAlive(
                    this.simulator.simulateKeyPress(key, { delay : options?.delay, modifierKeys : extractModifierKeys(keyboardAction) })
                )
        }


        async keyDown (target : ActionTarget, key : string) : Promise<any> {
            const keyboardAction    = this.normalizeKeyboardActionOptions(target ?? this.activeElement, key)

            const waitRes       = await this.waitForKeyboardTargetActionable(keyboardAction, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'keyDown',
                timeout         : keyboardAction.timeout
            })

            if (waitRes.success)
                await this.keepAlive(this.simulator.simulateKeyDown(key))
        }


        async keyUp (target : ActionTarget, key : string) : Promise<any> {
            const keyboardAction    = this.normalizeKeyboardActionOptions(target ?? this.activeElement, key)

            const waitRes       = await this.waitForKeyboardTargetActionable(keyboardAction, {
                sourcePoint     : this.getSourcePoint(),
                actionName      : 'keyUp',
                timeout         : keyboardAction.timeout
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
