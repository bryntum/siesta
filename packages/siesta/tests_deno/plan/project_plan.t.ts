// @ts-ignore
import * as path from "https://deno.land/std@0.94.0/path/mod.ts"
import { iit, it } from "../../deno.js"
import { ProjectDeno } from "../../deno.js"
import { TestDescriptor } from "../../src/siesta/test/TestDescriptor.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const __filename    = path.fromFileUrl(import.meta.url)
const __dirname     = path.dirname(__filename)

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const extract   = (desc : TestDescriptor) => {
    return {
        url         : desc.url,
        children    : desc.childNodes?.map(extract)
    }
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to plan individual files inside the project directory', async t => {

    const project       = ProjectDeno.new({
        baseUrl     : path.resolve(__dirname, '../@sample_test_suites/deno/')
    })

    project.planFile('test_1.t.js')
    // should normalize the path to be relative to the project file
    project.planFile('../deno/test_2.t.js')

    await project.finalizePlan()

    t.equal(
        extract(project.projectPlan),
        {
            url         : project.baseUrl,
            children    : [
                {
                    url         : 'test_1.t.js',
                    children    : undefined
                },
                {
                    url         : 'test_2.t.js',
                    children    : undefined
                }
            ]
        }
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to plan individual files outside the project directory', async t => {

    const project       = ProjectDeno.new({
        baseUrl     : path.resolve(__dirname, '../@sample_test_suites/deno/')
    })

    project.planFile('../isomorphic/test_1.t.js')
    project.planFile('../browser/test_2.t.js')

    await project.finalizePlan()

    t.equal(
        extract(project.projectPlan),
        {
            url         : project.baseUrl,
            children    : [
                {
                    url         : path.resolve(__dirname, '../@sample_test_suites/'),
                    children    : [
                        {
                            url         : 'isomorphic',
                            children    : [
                                {
                                    url         : 'test_1.t.js',
                                    children    : undefined
                                }
                            ]
                        },
                        {
                            url         : 'browser',
                            children    : [
                                {
                                    url         : 'test_2.t.js',
                                    children    : undefined
                                }
                            ]
                        },
                    ]
                }
            ]
        }
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should plan the project file directory by default', async t => {

    const project       = ProjectDeno.new({
        baseUrl     : path.resolve(__dirname, '../@sample_test_suites/deno/')
    })

    await project.finalizePlan()

    t.equal(
        extract(project.projectPlan),
        {
            url         : project.baseUrl,
            children    : [
                {
                    url         : 'test_1.t.js',
                    children    : undefined
                },
                {
                    url         : 'test_2.t.js',
                    children    : undefined
                }
            ]
        }
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to plan the glob pattern', async t => {

    const project       = ProjectDeno.new({
        baseUrl     : path.resolve(__dirname, '../@sample_test_suites/deno/')
    })

    project.planGlob('*est_[0-9]*.t.js')

    await project.finalizePlan()

    t.equal(
        extract(project.projectPlan),
        {
            url         : project.baseUrl,
            children    : [
                {
                    url         : 'test_1.t.js',
                    children    : undefined
                },
                {
                    url         : 'test_2.t.js',
                    children    : undefined
                }
            ]
        }
    )
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be able to exclude files by the glob pattern', async t => {

    const project       = ProjectDeno.new({
        baseUrl     : path.resolve(__dirname, '../@sample_test_suites/deno/')
    })

    project.planGlob('*est_[0-9]*.t.js')

    project.excludeGlob('*2*')

    await project.finalizePlan()

    t.equal(
        extract(project.projectPlan),
        {
            url         : project.baseUrl,
            children    : [
                {
                    url         : 'test_1.t.js',
                    children    : undefined
                }
            ]
        }
    )
})
