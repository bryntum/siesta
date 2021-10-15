//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Exit codes:
// 2 - inactivity timeout while running the test suite
// 3 - no supported browsers available on this machine
// 4 - no tests to run (probably `include/filter` doesn't match any test url or `exclude` match everything)
// 5 - can't open project page
// 9 - java is not installed or not available in PATH

export enum ExitCodes {
    /**
     * Test suite completed successfully, all tests passed
     */
    'PASSED'        = 0,

    /**
     * Test suite completed successfully, some tests failed
     */
    'FAILED'        = 1,

    /**
     * Test suite completed successfully, some tests failed
     */
    'EXCEPTION_IN_PROJECT_FILE'   = 2,

    /**
     * Incorrect command-line arguments, test suite did not start
     */
    'INCORRECT_ARGUMENTS'   = 6,

    /**
     * Internal exception, please report as a bug.
     */
    'UNHANDLED_EXCEPTION'   = 7,

    /**
     * Dry run exit, for example when no tests are matching the filtering criteria, or after printing the helps screen or package version.
     */
    'DRY_RUN'               = 8,

    /**
     * Incorrect environment, for example, when browser project (or test) is launched directly as Node.js script.
     */
    'INCORRECT_ENVIRONMENT' = 9
}
