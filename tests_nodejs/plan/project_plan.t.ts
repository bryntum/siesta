import path from "path"
import { fileURLToPath } from "url"
import { it, ProjectNodejs } from "../../nodejs.js"
import { TestDescriptor } from "../../src/siesta/test/TestDescriptor.js"

//---------------------------------------------------------------------------------------------------------------------
const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)

//---------------------------------------------------------------------------------------------------------------------
const extract   = (desc : TestDescriptor) => {
    return {
        url         : desc.url,
        filename    : desc.filename,
        children    : desc.childNodes?.map(extract)
    }
}

//---------------------------------------------------------------------------------------------------------------------
it('Should be able to plan individual files inside the project directory', async t => {

    const project       = ProjectNodejs.new({
        baseUrl     : path.resolve(__dirname, '../@sample_test_suites/nodejs/')
    })

    project.planFile('test_1.t.js')
    // should normalize the path to be relative to the project file
    project.planFile('../nodejs/test_2.t.js')

    project.finalizePlan()


    t.equal(
        extract(project.projectPlan),
        {
            url         : project.baseUrl,
            filename    : '',
            children    : [
                {
                    url         : 'test_1.t.js',
                    filename    : 'test_1.t.js',
                    children    : undefined
                },
                {
                    url         : 'test_2.t.js',
                    filename    : 'test_2.t.js',
                    children    : undefined
                }
            ]
        }
    )
})


//---------------------------------------------------------------------------------------------------------------------
it('Should be able to plan individual files outside the project directory', async t => {

    const project       = ProjectNodejs.new({
        baseUrl     : path.resolve(__dirname, '../@sample_test_suites/nodejs/')
    })

    project.planFile('../isomorphic/test_1.t.js')
    project.planFile('../browser/test_2.t.js')

    project.finalizePlan()

    t.equal(
        extract(project.projectPlan),
        {
            url         : project.baseUrl,
            filename    : '',
            children    : [
                {
                    url         : '..',
                    filename    : '@sample_test_suites',
                    children    : [
                        {
                            url         : '../isomorphic',
                            filename    : 'isomorphic',
                            children    : [
                                {
                                    url         : '../isomorphic/test_1.t.js',
                                    filename    : 'test_1.t.js',
                                    children    : undefined
                                }
                            ]
                        },
                        {
                            url         : '../browser',
                            filename    : 'browser',
                            children    : [
                                {
                                    url         : '../browser/test_2.t.js',
                                    filename    : 'test_2.t.js',
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


//---------------------------------------------------------------------------------------------------------------------
it('Should plan the project file directory by default', async t => {

    const project       = ProjectNodejs.new({
        baseUrl     : path.resolve(__dirname, '../@sample_test_suites/nodejs/')
    })

    project.finalizePlan()

    t.equal(
        extract(project.projectPlan),
        {
            url         : project.baseUrl,
            filename    : '',
            children    : [
                {
                    url         : 'test_1.t.js',
                    filename    : 'test_1.t.js',
                    children    : undefined
                },
                {
                    url         : 'test_2.t.js',
                    filename    : 'test_2.t.js',
                    children    : undefined
                }
            ]
        }
    )
})
