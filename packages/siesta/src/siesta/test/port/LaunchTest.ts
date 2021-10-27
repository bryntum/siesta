export const preLaunchTest =

    async (url : string, testDescriptorStr : string, delayStart : number = 0) : Promise<boolean> => {

        Object.defineProperty(globalThis, '__SIESTA_GLOBAL_TEST_DESC_STR__', {
            enumerable      : false,
            value           : testDescriptorStr
        })

        // this start delay allows the dev tools to initialize
        if (delayStart > 0) await new Promise(resolve => setTimeout(resolve, delayStart))

        await import(/* @vite-ignore */url)

        return Boolean(globalThis.__SIESTA_IMPORTER__)
    }

// we now use `resources/blank.html` page as a starter page for a test
// so no need for extra switch to the standards mode via document.write
// which worked only in Firefox anyway
// TODO remove this after some time
// export const preLaunchTestBrowser =
//     // embed the `preLaunchTest` sources, since this function will be executed in the remote environment
//     globalThis.eval(
//         (async (url : string, testDescriptorStr : string, delayStart : number = 0) : Promise<boolean> => {
//             const doc           = document
//
//             doc.open()
//
//             doc.write([
//                 '<!DOCTYPE html>',
//                 '<html>',
//                     '<head>',
//                     '</head>',
//                     '<body>',
//                     '</body>',
//                 '</html>'
//             ].join(''))
//
//             doc.close()
//
//             return preLaunchTest(url, testDescriptorStr, delayStart)
//         })
//             .toString()
//             .replace(/preLaunchTest/, `(${ preLaunchTest.toString() })`)
//     )
//
