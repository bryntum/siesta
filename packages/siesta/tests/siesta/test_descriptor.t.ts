import { iit, it } from "../../index.js"
import { TestDescriptor } from "../../src/siesta/test/TestDescriptor.js"
import { TestDescriptorBrowser } from "../../src/siesta/test/TestDescriptorBrowser.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to flatten the descriptor options', t => {
    const rootDesc      = TestDescriptor.new({
        url     : '.',
        isTodo  : true
    })


    const childDesc     = rootDesc.planItem(TestDescriptor.new({ url : 'some.t.js' }))

    t.is(childDesc.flatten.isTodo, true, 'Should "inherit" the `isTodo` value from parent')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it({ title : 'Nested test descriptors should extend parent descriptor', defaultTimeout : 1000 }, t => {
    t.is(t.descriptor.defaultTimeout, 1000)

    t.it('Nesting level 1', t => {
        t.is(t.descriptor.defaultTimeout, 1000)

        t.it('Nesting level 2', t => {
            t.is(t.descriptor.defaultTimeout, 1000)
        })
    })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Inheritance from group', t => {
    let rootBrowserDesc : TestDescriptorBrowser

    t.beforeEach(() => {
        rootBrowserDesc      = TestDescriptorBrowser.new({
            url         : '.',
            preload     : [ 'root_preload' ]
        })
    })

    t.it('Regular test should inherit `preload` config from project', t => {
        const childDesc     = rootBrowserDesc.planItem(TestDescriptorBrowser.new({ url : 'some' }))

        t.equal(
            childDesc.flatten.preload,
            [ { type : 'js', url : './root_preload', isEcmaModule : false } ],
        )
    })


    t.it('Regular test should inherit `preload` config from directory', t => {
        const dirDesc       = rootBrowserDesc.planItem(
            TestDescriptorBrowser.new({ url : 'some', preload : [ 'group_preload' ] })
        )

        const childDesc     = dirDesc.planItem(TestDescriptorBrowser.new({ url : 'some' }))

        t.equal(
            childDesc.flatten.preload,
            [ { type : 'js', url : './some/group_preload', isEcmaModule : false } ],
        )
    })


    t.it('Test should not inherit `preload` if it has `pageUrl` set', t => {
        const childDesc     = rootBrowserDesc.planItem(TestDescriptorBrowser.new({ url : 'some', pageUrl : 'url' }))
        t.equal(
            childDesc.flatten.preload,
            undefined,
        )
    })


    t.it('If provided, test should use own `preload`, regardless of `pageUrl`', t => {
        const childDesc     = rootBrowserDesc.planItem(TestDescriptorBrowser.new({ url : 'some', pageUrl : 'url', preload : [ 'test_preload' ] }))

        t.equal(
            childDesc.flatten.preload,
            [ { type : 'js', url : './some/test_preload', isEcmaModule : false } ],
        )
    })


    t.it('Should stop inheritance of `preload` on the directory with `pageUrl` set', t => {
        const dirDesc       = rootBrowserDesc.planItem(
            TestDescriptorBrowser.new({ url : 'some', pageUrl : 'url' })
        )

        const childDesc     = dirDesc.planItem(TestDescriptorBrowser.new({ url : 'some' }))

        t.equal(
            childDesc.flatten.preload,
            undefined,
        )
    })


    t.it('Should not stop inheritance of `preload` on the directory with `pageUrl` set, if it is set to `inherit`', t => {
        const dirDesc       = rootBrowserDesc.planItem(
            TestDescriptorBrowser.new({ url : 'some', pageUrl : 'url' })
        )

        const childDesc     = dirDesc.planItem(TestDescriptorBrowser.new({ url : 'some', preload : 'inherit' }))

        t.equal(
            childDesc.flatten.preload,
            [ { type : 'js', url : './root_preload', isEcmaModule : false } ]
        )
    })


    t.it('Should still inherit from root, if group has preload set to `inherit`', t => {
        const dirDesc       = rootBrowserDesc.planItem(
            TestDescriptorBrowser.new({ url : 'some', pageUrl : 'url', preload : 'inherit' })
        )

        const childDesc     = dirDesc.planItem(TestDescriptorBrowser.new({ url : 'some' }))

        t.equal(
            childDesc.flatten.preload,
            [ { type : 'js', url : './root_preload', isEcmaModule : false } ]
        )
    })


    t.it('Should inherit from group, if group has both `pageUrl` and `preload`', t => {
        const dirDesc       = rootBrowserDesc.planItem(
            TestDescriptorBrowser.new({ url : 'some', pageUrl : 'url', preload : 'group_preload' })
        )

        const childDesc     = dirDesc.planItem(TestDescriptorBrowser.new({ url : 'some' }))

        t.equal(
            childDesc.flatten.preload,
            [ { type : 'js', url : './some/group_preload', isEcmaModule : false } ]
        )
    })
})


it('`pageUrl` defined on the project node and combined with `preload` should not stop inheritance', t => {
    const rootBrowserDesc      = TestDescriptorBrowser.new({
        url         : '.',
        preload     : [ 'root_preload' ],
        pageUrl     : 'url'
    })

    const childDesc     = rootBrowserDesc.planItem(TestDescriptorBrowser.new({ url : 'some.t.js' }))

    t.equal(
        childDesc.flatten.preload,
        [ { type : 'js', url : './root_preload', isEcmaModule : false } ]
    )
})


// TODO
// t.it('`preload` defined in the test config (in the test file itself) should be taken into account`', function (t) {
//     var harness     = t.getHarness({
//     }, [], true)
//
//     harness.normalizeDescriptors([
//         {
//             url             : 'test5',
//             testConfig      : {
//                 preload     : [ 'preload5' ]
//             }
//         }
//     ])
//
//     t.isDeeply(
//         harness.getDescriptorConfig(harness.getScriptDescriptor('test5'), 'preload'),
//         [ 'preload5' ],
//         "Test5 should get the preloads from `testConfig` (which is defined from the test file content)"
//     )
// })


// t.it('Should support synonims for config option names', function (t) {
//     var harness     = t.getHarness({
//         separateContext     : 'harnessValue'
//     }, [], true)
//
//     harness.normalizeDescriptors([
//         {
//             group               : 'Group1',
//             enablePageRedirect  : 'group1Value',
//
//             items           : [
//                 {
//                     url             : 'test1'
//                 },
//                 {
//                     url                 : 'test2',
//                     enablePageRedirect  : 'test2Value'
//                 }
//             ]
//         },
//         {
//             url             : 'test3',
//             testConfig      : {
//                 separateContext     : 'test3Value'
//             }
//         },
//         'test4'
//     ])
//
//     Joose.A.each([ 'test1', 'test2', 'test3', 'test4' ], function (url, i) {
//         t.isDeeply(
//             harness.getDescriptorConfig(harness.getScriptDescriptor(url), 'separateContext'),
//             harness.getDescriptorConfig(harness.getScriptDescriptor(url), 'enablePageRedirect'),
//             "Values should be identical for all descriptors: " + url
//         )
//     })
//
// })
