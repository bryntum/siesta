import { Project } from "../../main.js"
import { Test as CustomTestClass } from "../../src/siesta/test/Test.js"

const project = Project.new({
    name                    : 'Siesta test suite',

    // global project-specific options as configs
    someProjectOption       : false,

    // global test-specific options
    options                 : { testClass : CustomTestClass }
})


project.planGlob('**/*.t.js')

project.planDir('tests', { testClass : CustomTestClass })

project.planFile('tests2/some_test.t.js', { testClass : CustomTestClass })

project.start()

