import { Serializable, serializable } from "typescript-serializable-mixin/index.js"
import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { XmlElement } from "../../jsx/XmlElement.js"
import { LogLevel, LogMethod } from "../../logger/Logger.js"
import { TreeNodeMapped } from "../../tree/TreeNodeMapped.js"
import { typeOf } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { stripAnsiControlCharacters } from "../../util_nodejs/Terminal.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { AssertionWaitForCreation } from "../test/assertion/AssertionAsync.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { Assertion, Exception, LogMessage, SourcePoint, TestNodeResult } from "../test/TestResult.js"
import { TestNodeResultReactive } from "../test/TestResultReactive.js"
import { Dispatcher } from "./Dispatcher.js"
import { LauncherDescriptor } from "./Launcher.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type HTMLReportData = {
    projectData         : ProjectSerializableData
    launcherDescriptor  : LauncherDescriptor
    launchResult        : TestLaunchResult
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type JSONReportLogMessageNode = {
    type        : 'logmessage',

    messageType : 'log' | 'console' | 'output'

    level       : LogMethod

    message     : string
}


export type JSONReportExceptionNode = {
    type        : 'exception',

    message     : string,
}


export type JSONReportSyncAssertionNode = {
    type        : 'assertion',
    name        : string,

    passed      : boolean,

    sourcePoint : SourcePoint

    description : string,
    annotation  : string
}


export type JSONReportWaitForAssertionNode = {
    type        : 'assertion_waitfor',
    name        : string,

    elapsed     : number,

    passed      : boolean,

    sourcePoint : SourcePoint

    description : string,
    annotation  : string,

    timeoutHappened : boolean
    exception       : string
}


export type JSONReportTestCaseNode = {
    type        : 'testcase',
    title       : string,

    startDate   : Date,
    endDate     : Date,

    passed      : boolean,
    isTodo      : boolean

    items       : (
        | JSONReportTestCaseNode
        | JSONReportSyncAssertionNode
        | JSONReportExceptionNode
        | JSONReportLogMessageNode
        | JSONReportWaitForAssertionNode
    )[]
}


export type JSONReportTestFileNode = {
    type        : 'file',
    title       : string,
    url         : string,
    urlAbs      : string,

    topTest     : JSONReportTestCaseNode
}


export type JSONReportDirectoryNode = {
    type        : 'dir',
    title       : string,
    url         : string,
    urlAbs      : string,

    items       : (JSONReportDirectoryNode | JSONReportTestFileNode)[]
}


export type JSONReportRootNode = {
    type        : 'project',
    title       : string,
    url         : string,
    urlAbs      : string,

    startDate   : Date,
    endDate     : Date,

    passed      : boolean,

    items       : (JSONReportDirectoryNode | JSONReportTestFileNode)[]
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@serializable({ id : 'TestLaunchResult' })
export class TestLaunchResult extends Mixin(
    [ Serializable, TreeNodeMapped, Base ],
    (base : ClassUnion<typeof Serializable, typeof TreeNodeMapped, typeof Base>) =>

    class TestLaunchResult extends base {
        childNodeT          : this

        descriptor          : TestDescriptor            = undefined

        mostRecentResult    : TestNodeResultReactive    = undefined


        get passed () : boolean {
            if (this.isLeaf()) return this.mostRecentResult ? this.mostRecentResult.passed : true

            return this.childNodes.every(childNode => childNode.passed === true)
        }


        nonEmptyChildren (dispatcher : Dispatcher) : (JSONReportDirectoryNode | JSONReportTestFileNode)[] {
            return this.childNodes.map(childDescriptor => {
                if (childDescriptor.isLeaf() && !childDescriptor.mostRecentResult) return undefined

                if (childDescriptor.isLeaf())
                    return childDescriptor.asJSONReportTestFileNode(dispatcher)
                else {
                    const node      = childDescriptor.asJSONReportDirectoryNode(dispatcher)

                    // do not include empty directories in the report
                    return node.items.length > 0 ? node : undefined
                }
            }).filter(node => Boolean(node))
        }


        asJSONReportRootNode (dispatcher : Dispatcher) : JSONReportRootNode {
            if (this.parentNode) throw new Error("This method can only be called on root node")

            return {
                type        : 'project',
                title       : this.descriptor.title,

                startDate   : dispatcher.launcher.reporter.startTime,
                endDate     : dispatcher.launcher.reporter.endTime,

                passed      : this.passed,
                url         : this.descriptor.url,
                urlAbs      : this.descriptor.urlAbs,

                items       : this.nonEmptyChildren(dispatcher)
            }
        }


        asJSONReportDirectoryNode (dispatcher : Dispatcher) : JSONReportDirectoryNode {
            if (this.isLeaf()) throw new Error("This method can only be called on directory node")

            return {
                type        : 'dir',

                title       : this.descriptor.title,
                url         : this.descriptor.url,
                urlAbs      : this.descriptor.urlAbs,

                items       : this.nonEmptyChildren(dispatcher)
            }
        }


        asJSONReportTestFileNode (dispatcher : Dispatcher) : JSONReportTestFileNode {
            if (!this.isLeaf()) throw new Error("This method can only be called on leaf node")

            return {
                type        : 'file',

                title       : this.descriptor.title,
                url         : this.descriptor.url,
                urlAbs      : this.descriptor.urlAbs,

                topTest     : testNodeResultAsJSONReportTestCaseNode(this.mostRecentResult, dispatcher)
            }
        }


        asJUnitReportRootNode (dispatcher : Dispatcher) : XmlElement {
            if (this.parentNode) throw new Error("This method can only be called on root node")

            const launcher      = dispatcher.launcher

            const startTime     = dispatcher.launcher.reporter.startTime
            const endTime       = dispatcher.launcher.reporter.endTime

            const testSuiteNode = XmlElement.new({
                tagName     : 'testsuite',

                attributes  : {
                    name        : this.descriptor.title || 'No title',
                    timestamp   : startTime.toJSON(),
                    time        : (endTime.getTime() - startTime.getTime()) / 1000,
                    hostname    : ''
                }
            })

            // let properties          = options.properties
            //
            // if (properties) {
            //     let propertiesNode  = testSuiteNode.appendChild({
            //         tag         : 'properties'
            //     })
            //
            //     Joose.O.each(properties, function (value, name) {
            //         propertiesNode.appendChild({
            //             tag         : 'property',
            //
            //             attributes  : {
            //                 name        : name,
            //                 value       : value
            //             }
            //         })
            //     })
            // }

            let totalTests      = 0
            let totalErrors     = 0
            let totalFailures   = 0

            const projectPlanItemsToLaunch  = dispatcher.projectPlanItemsToLaunch

            projectPlanItemsToLaunch.forEach(descriptor => {
                totalTests++

                const testCaseNode  = XmlElement.new({
                    tagName         : 'testcase',

                    attributes      : {
                        name        : descriptor.urlAbs,
                        classname   : 'siesta/test'
                    }
                })

                const result        = dispatcher.resultsMappingById.get(descriptor.guid)

                if (!result || !result.mostRecentResult) {
                    totalErrors++

                    testCaseNode.appendChild(XmlElement.new({
                        tagName         : 'error',
                        childNodes      : [
                            'Missing result node'
                        ]
                    }))
                } else {
                    const testNodeResult    = result.mostRecentResult

                    // if (descriptor.sessionId != null) testCaseNode.setAttribute('sessionId', descriptor.sessionId)

                    testCaseNode.setAttribute('time', (testNodeResult.endDate.getTime() - testNodeResult.startDate.getTime()) / 1000)

                    let hasException        = false
                    let totalAssertions     = 0
                    let failedAssertions    = 0

                    for (const assertion of testNodeResult.eachAssertionAndExceptionDeep()) {
                        if (assertion instanceof Exception) {
                            totalAssertions++
                            totalErrors++

                            hasException    = true

                            testCaseNode.appendChild(XmlElement.new({
                                tagName         : 'error',
                                attributes      : {
                                    type        : typeOf(assertion.exception)
                                },
                                childNodes      : [
                                    assertion.text
                                ]
                            }))
                        }
                        else if (assertion instanceof Assertion) {
                            totalAssertions++

                            if (!assertion.passed) {
                                failedAssertions++

                                testCaseNode.appendChild(XmlElement.new({
                                    tagName     : 'failure',

                                    attributes  : {
                                        message     : assertion.description || '',
                                        type        : assertion.name || 'FAIL'
                                    },

                                    childNodes      : assertion.annotation
                                        ? [ stripAnsiControlCharacters(launcher.render(assertion.annotation)) ]
                                        : undefined
                                }))
                            }
                        }
                    }

                    testCaseNode.setAttribute('totalAssertions', totalAssertions)
                    testCaseNode.setAttribute('failedAssertions', failedAssertions)

                    // test has failed, but w/o exception - some other reason
                    if (!hasException && !result.passed) totalFailures++
                }

                testSuiteNode.appendChild(testCaseNode)
            })

            testSuiteNode.setAttribute('tests', totalTests)
            testSuiteNode.setAttribute('errors', totalErrors)
            testSuiteNode.setAttribute('failures', totalFailures)

            return testSuiteNode
        }
    }
) {}


const testNodeResultAsJSONReportTestCaseNode = (result : TestNodeResult, dispatcher : Dispatcher) : JSONReportTestCaseNode => {
    const launcher      = dispatcher.launcher

    return {
        type        : 'testcase',
        title       : result.descriptor.title,

        startDate   : result.startDate,
        endDate     : result.endDate,

        isTodo      : result.descriptor.isTodo,
        passed      : result.passed,

        items       : result.resultLog.map(result => {
            if (result instanceof TestNodeResult)
                return testNodeResultAsJSONReportTestCaseNode(result, dispatcher)
            else if (result instanceof LogMessage)
                return {
                    type            : 'logmessage',
                    level           : LogLevel[ result.level ],
                    messageType     : result.type,
                    message         : result.message.map(message =>
                        isString(message) ? message : stripAnsiControlCharacters(launcher.render(message))
                    ).join('\n')
                } as JSONReportLogMessageNode
            else if ((result instanceof Assertion) && !(result instanceof AssertionWaitForCreation))
                return {
                    type            : 'assertion',
                    name            : result.name,
                    passed          : result.passed,
                    sourcePoint     : result.sourcePoint,
                    description     : result.description,
                    annotation      : result.annotation ? stripAnsiControlCharacters(launcher.render(result.annotation)) : undefined
                } as JSONReportSyncAssertionNode
            else if (result instanceof AssertionWaitForCreation)
                return {
                    type            : 'assertion_waitfor',
                    name            : result.name,
                    passed          : result.passed,
                    sourcePoint     : result.sourcePoint,
                    description     : result.description,
                    elapsed         : result.resolution.elapsedTime,
                    timeoutHappened : result.resolution.timeoutHappened,
                    exception       : result.resolution.exception,
                    annotation      : result.annotation ? stripAnsiControlCharacters(launcher.render(result.annotation)) : undefined
                } as JSONReportWaitForAssertionNode
            else if (result instanceof Exception)
                return {
                    type            : 'exception',
                    message         : result.text
                } as JSONReportExceptionNode
        })
    }
}
