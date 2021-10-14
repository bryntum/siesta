export type Importer = () => Promise<unknown>

export class ImporterMap {
    imports     : Map<string, Importer>         = new Map()


    registerImporter (id : string, importer : Importer) {
        if (this.imports.has(id)) throw new Error(`Importer with id ${ id } already registered`)

        this.imports.set(id, importer)
    }


    getImporter (id : string) : Importer {
        return this.imports.get(id)
    }
}

export const importer = new ImporterMap()

Object.defineProperty(globalThis, '__SIESTA_IMPORTER__', {
    enumerable      : false,
    value           : importer
})


importer.registerImporter('src/rpc/media/MediaBrowserMessagePort.js', async () => import('./rpc/media/MediaBrowserMessagePort.js'))
importer.registerImporter('src/rpc/media/MediaBrowserWebSocketChild.js', async () => import('./rpc/media/MediaBrowserWebSocketChild.js'))
importer.registerImporter('src/rpc/media/MediaNodeIpc.js', async () => import('./rpc/media/MediaNodeIpc.js'))
importer.registerImporter('src/rpc/media/MediaSameContext.js', async () => import('./rpc/media/MediaSameContext.js'))
importer.registerImporter('src/rpc/media/MediaWebWorker.js', async () => import('./rpc/media/MediaWebWorker.js'))

importer.registerImporter('src/siesta/test/port/TestLauncherChild.js', async () => import('./siesta/test/port/TestLauncherChild.js'))
importer.registerImporter('src/siesta/test/port/TestLauncherBrowserChild.js', async () => import('./siesta/test/port/TestLauncherBrowserChild.js'))

importer.registerImporter('src/siesta/reporter/styling/theme_accessible.js', async () => import('./siesta/reporter/styling/theme_accessible.js'))
importer.registerImporter('src/siesta/reporter/styling/theme_dark.js', async () => import('./siesta/reporter/styling/theme_dark.js'))
importer.registerImporter('src/siesta/reporter/styling/theme_light.js', async () => import('./siesta/reporter/styling/theme_light.js'))
importer.registerImporter('src/siesta/reporter/styling/theme_universal.js', async () => import('./siesta/reporter/styling/theme_universal.js'))
