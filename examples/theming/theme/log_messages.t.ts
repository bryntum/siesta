import { it } from "../../../index.js"


it('Theming of the log messages (need to set the --log-level option to the appropriate value to see all of them)', async t => {
    t.error("Error message")

    t.warn("Warning message")

    t.log("Log message")

    t.debug("Debug message")

    t.info("Info message")
})
