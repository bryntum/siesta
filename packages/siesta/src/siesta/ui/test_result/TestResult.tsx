/** @jsx ChronoGraphJSX.createElement */

import { ReactiveArray } from "@bryntum/chronograph/src/chrono2/data/Array.js"
import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { ChronoGraphJSX, ElementSource, PropertySource } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"
import { ComponentElement, ReactiveElement } from "../../../chronograph-jsx/ElementReactivity.js"
import { JsonDeepDiffElement } from "../../../compare_deep/DeepDiffRendering.js"
import { JsonDeepDiffComponent } from "../../../compare_deep/JsonDeepDiffComponent.js"
import { RenderCanvas } from "../../../jsx/RenderBlock.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { XmlElement } from "../../../jsx/XmlElement.js"
import { LogLevel } from "../../../logger/Logger.js"
import { relative } from "../../../util/Path.js"
import { ProjectSerializableData } from "../../project/ProjectDescriptor.js"
import { sourcePointTemplate } from "../../reporter/Reporter.js"
import { TestDescriptor } from "../../test/TestDescriptor.js"
import {
    Assertion,
    AssertionAsyncCreation,
    Exception,
    LogMessage,
    TestNodeResult,
    TestResult
} from "../../test/TestResult.js"
import { TestNodeResultReactive } from "../../test/TestResultReactive.js"
import { TreeComponent } from "../components/TreeComponent.js"
import { DashboardCore } from "../DashboardCore.js"
import { TestLaunchInfo } from "../TestLaunchInfo.js"

ChronoGraphJSX

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@entity()
export class TestNodeResultComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class TestNodeResultComponent extends base {
        props       : Component[ 'props' ] & {
            testNode        : PropertySource<TestNodeResultReactive>
            dashboard       : TestNodeResultComponent[ 'dashboard' ]
            launchInfo      : TestNodeResultComponent[ 'launchInfo' ]
        }

        launchInfo  : TestLaunchInfo                = undefined
        testNode    : TestNodeResultReactive        = undefined
        dashboard   : DashboardCore                 = undefined


        render () : ReactiveElement {
            const Self      = this.constructor as typeof TestNodeResultComponent
            const testNode  = this.testNode

            const children  = (testNode.$.resultLog as ReactiveArray<TestResult>).map(
                (result : TestResult) =>
                    <leaf>{
                        (result instanceof TestNodeResultReactive)
                            ?
                                <Self dashboard={ this.dashboard } launchInfo={ this.launchInfo } testNode={ result }></Self>
                            :
                                (result instanceof Assertion)
                                    ?
                                        <AssertionComponent dashboard={ this.dashboard } launchInfo={ this.launchInfo } testNode={ testNode } assertion={ result }></AssertionComponent>
                                    :
                                    (result instanceof LogMessage)
                                        ?
                                            <LogMessageComponent logMessage={ result }></LogMessageComponent>
                                        :
                                            (result instanceof Exception)
                                                ?
                                                    <ExceptionComponent exception={ result }></ExceptionComponent>
                                                :
                                                    <span>Unknown element</span>
                    }</leaf>
            )

            const expandedState = testNode.expandedState != null
                ?
                    testNode.expandedState
                :
                    testNode.passed && testNode.parentNode ? 'collapsed' : 'expanded'

            const el = <TreeComponent
                // @ts-ignore
                onmousedown     = { e => this.onMouseDown(e) }
                class           = { testNode.isRoot ? 'test-file-comp' : 'subtest-comp' }
                state           = { expandedState }
                extraCollapseIconSource = {
                    () => testNode.state === 'ignored'
                        ? <span class="icon"><i class='fas fa-circle' style='visibility: hidden'></i></span>
                        : undefined
                }
            >
                {
                    testNode.isRoot
                        ?
                            [ testNodeStateIcon(testNode), ' ', testNodeUrlTemplate(testNode.descriptor, this.dashboard.projectData) ]
                        :
                            [
                                <span onclick={ () => testNode.toggleChecked() } class="icon">
                                    <i class={ () => testNode.checked ? 'far fa-check-square' : 'far fa-square' }></i>
                                </span>,
                                testNodeStateIcon(testNode), ' ',
                                testNode.isTodo ? <span class="accented">[todo] </span> : '',
                                <span class='subtest-title'>{ testNode.descriptor.title }</span>,
                            ]
                }
                { children }
            </TreeComponent> as ComponentElement<TreeComponent>

            // save changes in `state` atom of the TreeComponent to the `expandedState`
            (el.comp.$.state as Box<TreeComponent[ 'state' ]>).commitValueOptimisticHook.on((atom, value) => this.testNode.expandedState = value)

            return el
        }


        onMouseDown (e : MouseEvent) {
            const testResultEl : ComponentElement<TestNodeResultComponent> = (e.target as Element).closest('.test-file-comp, .subtest-comp')

            // prevent the text selection on double click only (still works for mouse drag)
            if (testResultEl && e.detail > 1) e.preventDefault()
        }
    }
) {}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@entity()
export class AssertionComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class AssertionComponent extends base {
        props           : Component[ 'props' ] & {
            testNode        : AssertionComponent[ 'testNode' ]
            assertion       : AssertionComponent[ 'assertion' ]
            dashboard       : AssertionComponent[ 'dashboard' ]
            launchInfo      : AssertionComponent[ 'launchInfo' ]
        }

        assertion       : Assertion                 = undefined
        testNode        : TestNodeResultReactive    = undefined
        dashboard       : DashboardCore             = undefined
        launchInfo      : TestLaunchInfo            = undefined


        upgradeComponent (cmp : XmlElement) : Component | undefined {
            if (cmp instanceof JsonDeepDiffElement)
                return JsonDeepDiffComponent.new({
                    difference  : cmp.difference
                })

            return undefined
        }


        render () : Element {
            const testNode                  = this.testNode
            const assertion                 = this.assertion
            const sourcePoint               = assertion.sourcePoint
            const dashboard                 = this.dashboard
            const sourceContext             = dashboard.launcherDescriptor.sourceContext
            const shouldShowSourceContext   = sourceContext > 0

            return <div class="assertion">{
                () => {
                    if ((assertion instanceof AssertionAsyncCreation) && !assertion.resolution) {
                        return [
                            <span class={ `icon assertion_icon assertion_icon_waiting` }><i class='far fa-hourglass'></i></span>,
                            ' ',
                            <span class="assertion_name">{ assertion.name }</span>,
                            <span class="assertion_description">{ assertion.description ? ' ' + assertion.description : '' }</span>,
                            sourcePoint && !shouldShowSourceContext
                                ? [ ' at line ', <span class="assertion_source_line">{ sourcePoint.line }</span> ]
                                : null
                        ]
                    }
                    else {
                        const cls       = testNode.isTodo ?
                            assertion.passed ? 'assertion_icon_pass_todo' : 'assertion_icon_pass'
                        :
                            assertion.passed ? 'assertion_icon_pass' : 'assertion_icon_fail'

                        const passed    = assertion.passed || testNode.isTodo

                        return [
                            <span class={ `icon assertion_icon ${ cls }` }><i class={ assertion.passed ? 'far fa-check-circle' : 'far fa-times-circle' }></i></span>,
                            ' ' ,
                            assertion.negated ? <span class="assertion_name_negation">not: </span> : null, <span class="assertion_name">{ assertion.name }</span>,
                            <span class="assertion_description">{ assertion.description ? ' ' + assertion.description : '' }</span>,
                            sourcePoint && !shouldShowSourceContext
                                ? [ ' at line ', <span class="assertion_source_line">{ sourcePoint.line }</span> ]
                                : null,
                            () => !passed && sourcePoint && this.launchInfo.testSources && shouldShowSourceContext
                                ?
                                    <pre class='assertion_annotation'>
                                        {
                                            dashboard.renderer.render(
                                                sourcePointTemplate(sourcePoint, this.launchInfo.testSources, sourceContext),
                                                RenderCanvas.new({ maxWidth : dashboard.renderer.getMaxLen() })
                                            )
                                        }
                                    </pre>
                                :
                                    // TODO very low prio, sources loading spinner
                                    null,
                            !passed && assertion.annotation
                                ?
                                    this.upgradeComponent(assertion.annotation)?.el
                                        ?? <pre class='assertion_annotation'>{
                                            dashboard.renderer.render(assertion.annotation, RenderCanvas.new({ maxWidth : dashboard.renderer.getMaxLen() }))
                                        }</pre>
                                : null
                        ]
                    }
                }
            }</div>
        }
    }
) {}



//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@entity()
export class LogMessageComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class LogMessageComponent extends base {
        props           : Component[ 'props' ] & {
            logMessage          : LogMessage
        }

        logMessage          : LogMessage        = undefined


        render () : Element {
            let tagText : string
            let classSuffix : string

            const logMessage    = this.logMessage

            const logLevelName  = LogLevel[ logMessage.level ]

            if (logMessage.type === 'log') {
                tagText         = logLevelName.toUpperCase()
                classSuffix     = logLevelName.toLowerCase()
            }
            else if (logMessage.type === 'console') {
                tagText         = `CONSOLE.${ logLevelName.toUpperCase() }`
                classSuffix     = logLevelName.toLowerCase()
            }
            else {
                tagText         = logMessage.outputType === 'stdout' ? 'STD_OUT' : 'STD_ERR'
                classSuffix     = logMessage.outputType === 'stdout' ? 'log' : 'error'
            }

            return <div class="log_message">
                <span class='log_message_icon'>ⓘ</span>
                <span class={ `log_message_${ classSuffix }` }> { tagText } </span>
                { ' ' }
                { logMessage.message }
            </div>
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@entity()
export class ExceptionComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class ExceptionComponent extends base {
        props           : Component[ 'props' ] & {
            exception       : Exception
        }

        exception       : Exception             = undefined


        render () : Element {
            return <div class="exception">
                <span class='exception_icon'>{ this.exception.title ?? 'EXCEPTION' }</span>
                <pre>{ this.exception.text }</pre>
            </div>
        }
    }
) {}


const testNodeStateIcon = (testNode : TestNodeResult) : ElementSource => {
    if (testNode.isRoot) {
        return () => !testNode.passed
            ? <span class='test_file_fail'>FAIL</span>
            : testNode.state === 'completed'
                ? <span class='test_file_pass'>PASS</span>
                : <span class='test_file_runs'>RUNS</span>
    } else {
        return () => testNode.state === 'ignored'
            ? <span class='icon'><i class="far fa-eye-slash"></i></span>
            : !testNode.passed
                ? <span class='icon sub_test_fail'><i class='fas fa-times-circle'></i></span>
                : testNode.state === 'completed'
                    ? <span class='icon sub_test_pass'><i class='fas fa-check'></i></span>
                    : <span class='icon sub_test_runs'><i class='fas fa-running'></i></span>
    }
}

const testNodeUrlTemplate = (desc : TestDescriptor, projectData : ProjectSerializableData) : Element => {
    const rel       = relative(projectData.projectPlan.url, desc.url)
    const match     = /(.*\/)?([^\/]+)/.exec(rel)

    return <span>
        <span class="test_file_url_dirname">{ match[ 1 ] || '' }</span><span class="test_file_url_filename">{ match[ 2 ] }</span>
    </span>
}
