import { getImportMapFromProjectFiles, writeImportMapFile } from "@jsenv/node-module-import-map"

const projectDirectoryUrl = new URL("./", import.meta.url)

writeImportMapFile(
    [
        getImportMapFromProjectFiles({
            projectDirectoryUrl,
        }),
    ],
    {
        projectDirectoryUrl,
        importMapFileRelativeUrl: "./project.importmap",
    },
).then()
