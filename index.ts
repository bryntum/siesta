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
