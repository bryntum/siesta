import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { LogLevel, LogMethod } from "../../logger/Logger.js"
import { TreeNodeMapped } from "../../tree/TreeNodeMapped.js"
import { AssertionWaitForCreation } from "../test/assertion/AssertionAsync.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { Assertion, Exception, LogMessage, SourcePoint, TestNodeResult } from "../test/TestResult.js"
import { TestNodeResultReactive } from "../test/TestResultReactive.js"
import { Dispatcher } from "./Dispatcher.js"


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
    filename    : string,
    url         : string,
    urlAbs      : string,

    topTest     : JSONReportTestCaseNode
}


export type JSONReportDirectoryNode = {
    type        : 'dir',
    title       : string,
    filename    : string,
    url         : string,
    urlAbs      : string,

    items       : (JSONReportDirectoryNode | JSONReportTestFileNode)[]
}


export type JSONReportRootNode = {
    type        : 'project',
    title       : string,

    startDate   : Date,
    endDate     : Date,

    passed      : boolean,

    items       : (JSONReportDirectoryNode | JSONReportTestFileNode)[]
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestLaunchResult extends Mixin(
    [ TreeNodeMapped, Base ],
    (base : ClassUnion<typeof TreeNodeMapped, typeof Base>) =>

    class TestLaunchInfo extends base {
        childNodeT          : this

        descriptor          : TestDescriptor            = undefined

        mostRecentResult    : TestNodeResultReactive    = undefined


        asJSONReportRootNode (dispatcher : Dispatcher) : JSONReportRootNode {
            if (this.parentNode) throw new Error("This method can only be called on root node")

            return {
                type        : 'project',
                title       : this.descriptor.title,

                startDate   : dispatcher.launcher.reporter.startTime,
                endDate     : dispatcher.launcher.reporter.endTime,

                // TODO
                passed      : true, //this.mostRecentResult.passed,

                items       : this.childNodes.map(childDescriptor =>
                    childDescriptor.isLeaf()
                        ? childDescriptor.mostRecentResult ? childDescriptor.asJSONReportTestFileNode() : undefined
                        : childDescriptor.asJSONReportDirectoryNode()
                ).filter(node => Boolean(node))
            }
        }


        asJSONReportDirectoryNode () : JSONReportDirectoryNode {
            if (this.isLeaf()) throw new Error("This method can only be called on directory node")

            return {
                type        : 'dir',

                title       : this.descriptor.title,
                filename    : this.descriptor.filename,
                url         : this.descriptor.url,
                urlAbs      : this.descriptor.urlAbs,

                items       : this.childNodes.map(childDescriptor =>
                    childDescriptor.isLeaf()
                        ? childDescriptor.mostRecentResult ? childDescriptor.asJSONReportTestFileNode() : undefined
                        : childDescriptor.asJSONReportDirectoryNode()
                ).filter(node => Boolean(node))
            }
        }


        asJSONReportTestFileNode () : JSONReportTestFileNode {
            if (!this.isLeaf()) throw new Error("This method can only be called on leaf node")

            return {
                type    : 'file',

                title       : this.descriptor.title,
                filename    : this.descriptor.filename,
                url         : this.descriptor.url,
                urlAbs      : this.descriptor.urlAbs,

                topTest : testNodeResultAsJSONReportTestCaseNode(this.mostRecentResult)
            }
        }
    }
) {}


const testNodeResultAsJSONReportTestCaseNode = (result : TestNodeResult) : JSONReportTestCaseNode => {
    return {
        type        : 'testcase',
        title       : result.descriptor.title,

        startDate   : result.startDate,
        endDate     : result.endDate,

        isTodo      : result.descriptor.isTodo,
        passed      : result.passed,

        items       : result.resultLog.map(result => {
            if (result instanceof TestNodeResult)
                return testNodeResultAsJSONReportTestCaseNode(result)
            else if (result instanceof LogMessage)
                return {
                    type        : 'logmessage',
                    level       : LogLevel[ result.level ],
                    messageType : result.type,
                    // TODO render to string
                    message     : result.message + ''
                } as JSONReportLogMessageNode
            else if ((result instanceof Assertion) && !(result instanceof AssertionWaitForCreation))
                return {
                    type        : 'assertion',
                    name        : result.name,
                    passed      : result.passed,
                    sourcePoint : result.sourcePoint,
                    description : result.description,
                    // TODO render to string
                    annotation  : result.annotation + ''
                } as JSONReportSyncAssertionNode
            else if (result instanceof AssertionWaitForCreation)
                return {
                    type        : 'assertion_waitfor',
                    name        : result.name,
                    passed      : result.passed,
                    sourcePoint : result.sourcePoint,
                    description : result.description,
                    elapsed     : result.resolution.elapsedTime,
                    timeoutHappened : result.resolution.timeoutHappened,
                    exception       : result.resolution.exception,
                    // TODO render to string
                    annotation  : result.annotation + ''
                } as JSONReportWaitForAssertionNode
            else if (result instanceof Exception)
                return {
                    type        : 'exception',
                    message     : result.text
                } as JSONReportExceptionNode
        })
    }
}
