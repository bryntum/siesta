import { ColorerNodejs } from "../../src/siesta/reporter/ColorerNodejs.js"

const c = ColorerNodejs.new()


console.log(c.bgRed.black.text("  yo  "))
