export type Importer = () => Promise<unknown>

export class ImporterMap {
    imports     : Map<string, Importer>         = new Map()


    registerSymbolImporter (id : string, importer : Importer) {
        if (this.imports.has(id)) throw new Error(`Importer with id ${ id } already registered`)

        this.imports.set(id, importer)
    }


    getSymbolImporter (id : string) : Importer {
        return this.imports.get(id)
    }
}

export const importer = new ImporterMap()

Object.defineProperty(globalThis, '__SIESTA_IMPORTER__', {
    enumerable      : false,
    value           : importer
})
