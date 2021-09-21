// import { AnyConstructor, Mixin } from "../../../class/Mixin.js"
// import { Test } from "../Test.js"
//
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// export class TestNodejs extends Mixin(
//     [ Test ],
//     (base : AnyConstructor<Test, typeof Test>) =>
//
//     class TestNodejs extends base {
//     }
// ) {}
//
//
//
//
//
// // //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// // export class TestEnvironmentContext extends Base {
// //     topTest             : Test              = undefined
// //
// //     // $topTest     : Test              = undefined
// //     //
// //     //
// //     // get topTest () : Test {
// //     //     if (this.$topTest !== undefined) return this.$topTest
// //     //
// //     //     return this.$topTest = this.buildTopTest()
// //     // }
// //     //
// //     // set topTest (value : Test) {
// //     //     this.$topTest = value
// //     // }
// //     //
// //     //
// //     // initialize<T extends Base> (props? : Partial<T>) {
// //     //     super.initialize(props)
// //     //
// //     //     if (isNodejs()) {
// //     //         const processFilename       = process.argv[ 1 ]
// //     //
// //     //         if (/\.t\.js$/.test(processFilename)) {
// //     //             this.launchStandaloneNodejsTest()
// //     //         }
// //     //     }
// //     // }
// //     //
// //     //
// //     // buildTopTest () : Test {
// //     //     if (isNodejs()) {
// //     //         const processFilename       = process.argv[ 1 ]
// //     //
// //     //         const topTest           = this.topTest = Test.new({
// //     //             descriptor      : TestDescriptor.new({ filename : processFilename }),
// //     //
// //     //             reporter        : TestLaunchTestSide.new()
// //     //         })
// //     //
// //     //         return topTest
// //     //     }
// //     // }
// //     //
// //     //
// //     // async launchStandaloneNodejsTest () {
// //     //     await Promise.resolve()
// //     //
// //     //     this.topTest.start()
// //     // }
// // }
