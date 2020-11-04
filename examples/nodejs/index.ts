import { Project } from "../../main.js"
import { Test as CustomTestClass } from "../../src/siesta/test/Test.js"

const project = Project.new({
    name                    : 'Siesta test suite',

    // global test-specific options
    options                 : { testClass : CustomTestClass }
})

project.planDir('basic', { tags : [ 'aa' ], testClass : CustomTestClass })

project.planFile('basic/assertions.t.js', { tags : [ 'aa', 'bb' ] })

// project.planGlob('advanced/**/*.t.js')


project.planFile('advanced/assertions.t.js', { testClass : CustomTestClass })

project.start()

