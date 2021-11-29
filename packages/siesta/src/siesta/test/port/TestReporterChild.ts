import { ClassUnion, Mixin } from "typescript-mixin-class"
import { Port, remote } from "../../../rpc/port/Port.js"
import { LUID } from "../../common/LUID.js"
import { TestDescriptor } from "../TestDescriptor.js"
import { AssertionAsyncResolution, TestResultLeaf } from "../TestResult.js"
import { TestReporter } from "./TestReporterParent.js"

// IMPORTANT: Note, that this side of the `TestReporter` interface is placed into its own file
// this is to keep the test bundle small and free from parent-side dependencies

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class TestReporterChild extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) =>

    class TestReporterChild extends base implements TestReporter {
        @remote()
        onSubTestStart : (rootTestId : LUID, testNodeId : LUID, parentTestNodeId : LUID, descriptor : TestDescriptor, startDate : Date) => Promise<any>

        @remote()
        onSubTestFinish : (rootTestId : LUID, testNodeId : LUID, isIgnored : boolean, endDate : Date) => Promise<any>

        @remote()
        onResult : (rootTestId : LUID, testNodeId : LUID, result : TestResultLeaf) => Promise<any>

        @remote()
        onAssertionFinish : (rootTestId : LUID, testNodeId : LUID, assertion : AssertionAsyncResolution) => Promise<any>
    }
) {}
