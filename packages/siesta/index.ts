import { importer } from "./src/importer/Importer.js"

export { Project } from "./src/siesta/project/Project.js"

export { Test, it, iit, xit, describe, ddescribe, xdescribe, beforeEach, afterEach, expect } from "./src/siesta/test/Test.js"

export const siestaPackageRootUrl : string = import.meta.url.replace(/index\.js$/, '')

importer.registerImporter('src/rpc/media/MediaBrowserMessagePort.js', async () => import('./src/rpc/media/MediaBrowserMessagePort.js'))
importer.registerImporter('src/rpc/media/MediaBrowserWebSocketChild.js', async () => import('./src/rpc/media/MediaBrowserWebSocketChild.js'))
importer.registerImporter('src/rpc/media/MediaNodeIpc.js', async () => import('./src/rpc/media/MediaNodeIpc.js'))
importer.registerImporter('src/rpc/media/MediaSameContext.js', async () => import('./src/rpc/media/MediaSameContext.js'))
importer.registerImporter('src/rpc/media/MediaWebWorker.js', async () => import('./src/rpc/media/MediaWebWorker.js'))

importer.registerImporter('src/siesta/test/port/TestLauncher.js', async () => import('./src/siesta/test/port/TestLauncher.js'))
importer.registerImporter('src/siesta/test/port/TestLauncherBrowser.js', async () => import('./src/siesta/test/port/TestLauncherBrowser.js'))

importer.registerImporter('src/siesta/reporter/styling/theme_accessible.js', async () => import('./src/siesta/reporter/styling/theme_accessible.js'))
importer.registerImporter('src/siesta/reporter/styling/theme_dark.js', async () => import('./src/siesta/reporter/styling/theme_dark.js'))
importer.registerImporter('src/siesta/reporter/styling/theme_light.js', async () => import('./src/siesta/reporter/styling/theme_light.js'))
importer.registerImporter('src/siesta/reporter/styling/theme_universal.js', async () => import('./src/siesta/reporter/styling/theme_universal.js'))
