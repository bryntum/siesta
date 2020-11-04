import path from 'path'
import fs from 'fs'
import glob from 'glob'
import { Base } from "../../class/Base.js"
import { AnyConstructor, Mixin } from "../../class/Mixin.js"
import { scanDir } from "../../util/FileSystem.js"
import { TestDescriptor } from "../test/Test.js"
import { Dispatcher } from "./Dispatcher.js"

//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanItem extends Base {
    parentItem      : ProjectPlanGroup  = undefined

    id              : string            = ''

    name            : string            = ''

    filename        : string            = ''

    descriptor      : Partial<TestDescriptor>   = TestDescriptor.new()


    initialize<T extends ProjectPlanItem> (props? : Partial<T>) {
        if (props) {
            if (props.descriptor === undefined)
                delete props.descriptor
            else
                props.descriptor    = TestDescriptor.fromPlainObject(props.descriptor)
        }

        props && Object.assign(this, props)
    }


    merge (another : ProjectPlanItem) {
        if (this.parentItem) {
            if (another.parentItem && this.parentItem !== another.parentItem) throw new Error("Can not merge items")
        }
        else if (!another.parentItem) {
            // do nothing
        }
        else {
            this.parentItem     = another.parentItem
        }

        if (another.id !== this.id || another.name !== this.name || another.filename !== this.filename) throw new Error("Illegal state")

        this.descriptor.merge(another.descriptor)
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ProjectPlanGroup extends ProjectPlanItem {
    items           : ProjectPlanItem[]                 = []

    itemsMap        : Map<string, ProjectPlanItem>      = new Map()


    planItem (item : ProjectPlanItem) {
        const existing      = this.itemsMap.get(item.id)

        if (existing)
            existing.merge(item)
        else {
            this.items.push(item)
            this.itemsMap.set(item.id, item)
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
export class ProjectOptions {

}


//---------------------------------------------------------------------------------------------------------------------
export class Project extends Mixin(
    [ Base ],
    (base : AnyConstructor<Base, typeof Base>) =>

    class Project extends base {
        baseDir         : string            = path.dirname(process.argv[ 1 ])

        name            : string            = ''

        options         : Partial<TestDescriptor>           = undefined

        plan            : ProjectPlanGroup                  = undefined
        planMap         : Map<string, ProjectPlanItem>      = new Map()


        createPlanGroup (dir : string, descriptor? : Partial<TestDescriptor>) : ProjectPlanGroup {
            const existing      = this.planMap.get(dir)

            if (existing) {
                if (existing instanceof ProjectPlanGroup) {
                    if (descriptor) existing.descriptor.merge(descriptor)

                    return existing
                } else
                    throw new Error("Plan group already declared as file")
            }

            const newGroup = ProjectPlanGroup.new({ id : dir, name : path.basename(dir), filename : dir, descriptor })

            this.planMap.set(newGroup.id, newGroup)

            return newGroup
        }


        planGlob (globPattern : string, descriptor? : Partial<TestDescriptor>) {
            const files = glob.sync(globPattern, { cwd : this.baseDir, matchBase : true, ignore : '**/node_modules/**' })

            files.forEach(file => this.planFile(file, descriptor))
        }


        planDir (dir : string, descriptor? : Partial<TestDescriptor>) {
            const dirname       = path.resolve(this.baseDir, dir)

            const planGroup     = this.createPlanGroup(dirname, descriptor)

            scanDir(dirname, (entry : fs.Dirent, filename : string) => {
                if (/\.t\.m?js$/.test(filename)) this.planFile(filename)
            })
        }


        planFile (file : string, descriptor? : Partial<TestDescriptor>) {
            const filename  = path.resolve(this.baseDir, file)

            const stats     = fs.statSync(filename)

            if (!stats.isFile()) throw new Error(`Not a file provided to \`planFile\`: ${file}, base dir: ${this.baseDir}`)

            const dir       = path.dirname(filename)
            const name      = path.basename(filename)

            const group     = this.createPlanGroup(dir)

            const planItem  = ProjectPlanItem.new({ id : filename, name, filename, descriptor, parentItem : group })

            group.planItem(planItem)
        }


        finalizePlan () {

        }


        async start () {
            debugger

            const dispatcher    = Dispatcher.new({ project : this })

            await dispatcher.start()
        }
    }
) {}
