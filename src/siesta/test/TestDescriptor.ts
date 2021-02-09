import { Base } from "../../class/Base.js"
import { CI } from "../../iterator/Iterator.js"
import { serializable, Serializable } from "../../serializable/Serializable.js"
import { SerializerXml } from "../../serializer/SerializerXml.js"
import { StringifierXml } from "../../serializer/StringifierXml.js"
import { TreeNode } from "../../tree/TreeNode.js"
import { ArbitraryObject, cloneObject, objectEntriesDeep } from "../../util/Helpers.js"
import { isString } from "../../util/Typeguards.js"
import { IsolationLevel } from "../common/IsolationLevel.js"
import { HasOptions, option } from "../launcher/Option.js"

//---------------------------------------------------------------------------------------------------------------------
@serializable()
export class TestDescriptor extends Serializable.mix(HasOptions.mix(TreeNode.mix(Base))) {
    childNodeT      : TestDescriptor
    parentNode      : TestDescriptor

    title           : string                = ''

    filename        : string                = ''

    @option()
    url             : string

    @option({ defaultValue : [] })
    tags            : string[]

    @option({ defaultValue : false })
    isTodo          : boolean

    @option()
    isolation       : IsolationLevel

    // will be applied directly to test instance
    @option()
    config          : ArbitraryObject

    @option({ defaultValue : false })
    autoCheckGlobals    : boolean

    serializerConfig    : Partial<SerializerXml>   = { maxWide : 4, maxDepth : 4 }
    stringifierConfig   : Partial<StringifierXml>  = { prettyPrint : true }


    planItem (item : TestDescriptor) : TestDescriptor {
        this.appendChild(item)

        return item
    }


    getOptionValueReducers () : { [ key in keyof this ]? : (name : keyof this, parentsAxis : this[]) => this[ typeof name ] } {
        return {
            url     : (name : 'url', parentsAxis : this[]) : this[ typeof name ] => {
                const urlParts      = []

                CI(parentsAxis).forEach(desc => {
                    if (desc.url) {
                        urlParts.push(desc.url.replace(/\/$/, '')); return false
                    }
                    else {
                        urlParts.push(desc.filename)
                    }
                })

                urlParts.reverse()

                return urlParts.join('/')
            }
        }
    }


    $flatten        : this      = undefined

    get flatten () : this {
        if (this.$flatten !== undefined) return this.$flatten

        if (this.childNodes) throw new Error("Can only flatten leaf descriptors, not groups")

        const descriptor        = cloneObject(this)
        descriptor.parentNode   = undefined

        if (!descriptor.url && !descriptor.filename) throw new Error("Descriptor needs to have either `filename` or `url` property defined")

        const parentsAxis       = [ this, ...this.parentsAxis() ]

        const reducers          = this.getOptionValueReducers()

        const defaultReducer    = (name : keyof this, parentsAxis : this[]) : this[ typeof name ] => {
            let res : this[ typeof name ]

            CI(parentsAxis).forEach((desc, index) => {
                if (desc.hasOwnProperty(name) || index === parentsAxis.length - 1) { res = desc[ name ]; return false }
            })

            return res
        }

        objectEntriesDeep(this.$options).forEach(([ key, value ]) => {
            const reducer       = reducers[ key ] || defaultReducer

            descriptor[ key ]   = reducer(key, parentsAxis)
        })

        return this.$flatten    = descriptor
    }


    static fromTestDescriptorArgument<T extends typeof TestDescriptor> (this : T, desc : string | Partial<InstanceType<T>>) : InstanceType<T> {
        if (isString(desc)) {
            return this.new({ title : desc } as Partial<InstanceType<T>>)
        } else {
            return this.new(desc)
        }
    }


    static fromProjectPlanItemDescriptor<T extends typeof TestDescriptor> (this : T, desc : ProjectPlanItemDescriptor<InstanceType<T>>) : InstanceType<T> {
        if (isString(desc)) {
            return this.new({ filename : desc } as Partial<InstanceType<T>>)
        }
        else if (desc.items !== undefined) {
            const groupDesc     = Object.assign({}, desc)

            delete groupDesc.items

            const group         = this.new(groupDesc)

            // need to force-create the `childNodes` array for the case when the `items` array is empty
            // so that this descriptor will be counted as a group, not leaf
            group.childNodes    = []

            desc.items.forEach(item => group.planItem(this.fromProjectPlanItemDescriptor(item)))

            return group
        } else {
            return this.new(desc)
        }
    }
}

export type TestDescriptorArgument = string | Partial<TestDescriptor>

export type ProjectPlanItemDescriptor<DescClass extends TestDescriptor> = string | (Partial<DescClass> & { items? : ProjectPlanItemDescriptor<DescClass>[] })

