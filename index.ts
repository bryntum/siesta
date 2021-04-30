export { Project } from "./src/siesta/project/Project.js"

export { Test, it, iit, xit, describe, ddescribe, xdescribe, beforeEach, afterEach, expect } from "./src/siesta/test/Test.js"

export const siestaPackageRootUrl : string = import.meta.url.replace(/index\.js$/, '')
