import { Test } from "./src/siesta/test/Test.js"

export { Project } from "./src/siesta/project/Project.js"

export const it = (name : string, func : (t : Test) => any) => {}

export const describe = it
