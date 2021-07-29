/** @jsx ChronoGraphJSX.createElement */

import { ReactiveArray } from "@bryntum/chronograph/src/chrono2/data/Array.js"
import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { ChronoGraphJSX, ElementSource, PropertySource } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"
import { ComponentElement, ReactiveElement } from "../../../chronograph-jsx/ElementReactivity.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { LogLevel } from "../../../logger/Logger.js"
import { relative } from "../../../util/Path.js"
import { Dispatcher } from "../../launcher/Dispatcher.js"
import { TestLaunchInfo } from "../../launcher/TestLaunchInfo.js"
import { ProjectSerializableData } from "../../project/ProjectDescriptor.js"
import { sourcePointTemplate } from "../../reporter/Reporter.js"
import { TestDescriptor } from "../../test/TestDescriptor.js"
import { Assertion, Exception, LogMessage, TestNodeResult, TestNodeResultReactive, TestResult } from "../../test/TestResult.js"
import { TreeComponent } from "../components/TreeComponent.js"

ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
@entity()
export class TestNodeResultComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class TestNodeResultComponent extends base {
        props       : Component[ 'props' ] & {
            testNode        : PropertySource<TestNodeResultReactive>
            dispatcher      : Dispatcher
            launchInfo      : TestLaunchInfo
        }

        launchInfo  : TestLaunchInfo                = undefined
        testNode    : TestNodeResultReactive        = undefined
        dispatcher  : Dispatcher                    = undefined


        render () : ReactiveElement {
            // const nodesToShow : TestResult[]  = testNode.resultLog.filter(result => this.needToShowResult(result, testNode.isTodo))

            const Self      = this.constructor as typeof TestNodeResultComponent
            const testNode  = this.testNode

            const children  = (testNode.$.resultLog as ReactiveArray<TestResult>).map(
                (result : TestResult) =>
                    <leaf>{
                        (result instanceof TestNodeResultReactive)
                            ?
                                <Self dispatcher={ this.dispatcher } launchInfo={ this.launchInfo } testNode={ result }></Self>
                            :
                                (result instanceof Assertion)
                                    ?
                                        <AssertionComponent dispatcher={ this.dispatcher } launchInfo={ this.launchInfo } testNode={ testNode } assertion={ result }></AssertionComponent>
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

            const expandedState = this.testNode.expandedState != null
                ?
                    this.testNode.expandedState
                :
                    this.testNode.passed && this.testNode.parentNode ? 'collapsed' : 'expanded'

            const el = <TreeComponent
                // @ts-ignore
                onmousedown     = { e => this.onMouseDown(e) }
                class           = { testNode.isRoot ? 'test-file-comp' : 'subtest-comp' }
                state           = { expandedState }
            >
                {
                    testNode.isRoot ?
                        [ testNodeState(testNode), ' ', testNodeUrlTemplate(testNode.descriptor, this.dispatcher.projectData) ]
                        :
                        [
                            <span onclick={ () => testNode.toggleChecked() } class="icon">
                                <i class={ () => testNode.checked ? 'far fa-check-square' : 'far fa-square' }></i>
                            </span>,
                            testNodeState(testNode), ' ',
                            testNode.isTodo ? <span class="accented">[todo] </span> : '',
                            <span class='subtest-title'>{ testNode.descriptor.title }</span>,
                        ]
                }
                { children }
            </TreeComponent> as ComponentElement<TreeComponent>

            // save changes in `state` atom of the TreeComponent to the `expanded
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



//---------------------------------------------------------------------------------------------------------------------
@entity()
export class AssertionComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class AssertionComponent extends base {
        props           : Component[ 'props' ] & {
            testNode        : TestNodeResultReactive
            assertion       : Assertion
            dispatcher      : Dispatcher
            launchInfo      : TestLaunchInfo
        }

        assertion       : Assertion                 = undefined
        testNode        : TestNodeResultReactive    = undefined
        dispatcher      : Dispatcher                = undefined
        launchInfo      : TestLaunchInfo            = undefined


        render () : Element {
            const testNode      = this.testNode
            const assertion     = this.assertion
            const launcher      = this.dispatcher.launcher

            const cls   = testNode.isTodo ?
                assertion.passed ? 'assertion_icon_pass_todo' : 'assertion_icon_pass'
            :
                assertion.passed ? 'assertion_icon_pass' : 'assertion_icon_fail'

            const passed                    = assertion.passed || testNode.isTodo
            const canShowSourceContext      = assertion.sourcePoint

            const sourceContext             = launcher.sourceContext
            const shouldShowSourceContext   = sourceContext > 0

            return <div class="assertion">
                <span class={ `icon assertion_icon ${ cls }` }><i class={ assertion.passed ? 'far fa-check-circle' : 'far fa-times-circle' }></i></span>{ ' ' }
                <span class="assertion_name">{ assertion.name }</span>
                <span class="assertion_description">{ assertion.description ? ' ' + assertion.description : '' }</span>
                { assertion.sourcePoint && !shouldShowSourceContext ? [ ' at line ', <span class="assertion_source_line">{ assertion.sourcePoint.line }</span> ] : false }
                {
                    () => !passed && canShowSourceContext && this.launchInfo.testSources && shouldShowSourceContext
                        ?
                            <pre class='assertion_annotation'>
                                { launcher.render(sourcePointTemplate(assertion.sourcePoint, this.launchInfo.testSources, sourceContext)) }
                            </pre>
                        :
                            // sources loading spinner
                            null
                }
                {
                    !passed && assertion.annotation
                        ? <pre class='assertion_annotation'>{ launcher.render(assertion.annotation) }</pre>
                        : null
                }
            </div>
        }
    }
) {}



//---------------------------------------------------------------------------------------------------------------------
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


//---------------------------------------------------------------------------------------------------------------------
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
            const exception     = this.exception

            return <div class="exception">
                <div class='exception_icon'> EXCEPTION </div>
                <div class='indented'>{ exception.stack || exception }</div>
            </div>
        }
    }
) {}



const testFilePass = (testNode : TestNodeResult) : Element => {
    return <span class='test_file_pass'>PASS</span>
}

const testFileFail = (testNode : TestNodeResult) : Element => {
    return <span class='test_file_fail'>FAIL</span>
}

const subTestPass = (testNode : TestNodeResult) : Element => {
    return <span class='icon sub_test_pass'><i class='fas fa-check'></i></span>
}

const subTestFail = (testNode : TestNodeResult) : Element => {
    return <span class='icon sub_test_fail'><i class='fas fa-times-circle'></i></span>
}


const testNodeState = (testNode : TestNodeResult) : ElementSource => {
    if (testNode.isRoot) {
        return () => testNode.passed ? testFilePass(testNode) : testFileFail(testNode)
    } else {
        if (testNode.state === 'ignored') {
            return () => <span class='icon'><i class="far fa-eye-slash"></i></span>
        } else
            return () => testNode.passed ? subTestPass(testNode) : subTestFail(testNode)
    }
}

const testNodeUrlTemplate = (desc : TestDescriptor, projectData : ProjectSerializableData) : Element => {
    const rel       = relative(projectData.projectPlan.url, desc.url)
    const match     = /(.*\/)?([^\/]+)/.exec(rel)

    return <span>
        <span class="test_file_url_dirname">{ match[ 1 ] || '' }</span><span class="test_file_url_filename">{ match[ 2 ] }</span>
    </span>
}
