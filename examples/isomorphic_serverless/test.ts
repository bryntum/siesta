// import puppeteer from "puppeteer"
//
// (async () => {
//     const browser   = await puppeteer.launch({
//         headless                : true,
//         ignoreHTTPSErrors       : true,
//         timeout                 : 60000
//     })
//
//     const page      = await browser.newPage()
//
//     await page.goto('http://lh/siesta-monorepo/siesta/index.js')
//
//     const name      = await page.evaluate(async () => {
//
//         const [ modulePort, moduleMedia ]   = await Promise.all([
//             import('http://lh/siesta-monorepo/siesta/src/siesta/test/port/TestLauncher.js'),
//             import('http://lh/siesta-monorepo/siesta/src/rpc/media/MediaBrowserWebSocketChild.js')
//         ])
//
//
//         // const module = await import('http://lh/siesta-monorepo/siesta/src/siesta/test/port/TestLauncher.js')
//         //
//         // return module[ 'TestLauncherChild' ].name
//     })
//
//     console.log("NAME=", name)
//
//     await browser.close()
// })()
//












// import readline from "readline"
// import chalk from "chalk"
// import { delay } from "../../src/util/Helpers.js"
//
// const rl = readline.createInterface({ input : process.stdin, output : process.stdout })
//
// for (let i = 1; i <= 100; i++) console.log(i)
//
// await delay(3000)
//
// // readline.cursorTo(process.stdout, pos.cols, pos.rows)
// readline.moveCursor(process.stdout, 0, -90)
//
// await delay(1000)
//
// // console.log("\b\b")
// console.log("2xx")
// readline.moveCursor(process.stdout, 0, 90)
// // console.log("!")
//
// await delay(1000)
//
//
// // console.log(pos)
//
//
// // rl.write("PROGRESS LINE")
// //
// // readline.clearLine(process.stdout, )
//
// rl.close()
//
// // import { ColorerNodejs } from "../../src/siesta/reporter/ColorerNodejs.js"
// //
// // const c = ColorerNodejs.new()
// //
// //
// // console.log(c.bgRed.black.text("  yo  "))
