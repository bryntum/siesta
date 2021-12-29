export { Test, it, iit, xit, describe, ddescribe, xdescribe, beforeEach, afterEach, expect } from "./src/siesta/test/Test.js"
import { Test, it, iit, xit, describe, ddescribe, xdescribe, beforeEach, afterEach, expect } from "./src/siesta/test/Test.js"

export { Project } from "./src/siesta/project/Project.js"

export const siestaPackageRootUrl : string = import.meta.url.replace(/[^/]*$/, '')

// backward compat
export const StartTest = (func : (t : Test) => any) => {
    return it('Root', func)
}
