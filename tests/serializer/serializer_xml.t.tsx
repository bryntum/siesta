import { it } from "../../main.js"
import { SiestaJSX } from "../../src/jsx/Factory.js"
import { SerializerXml } from "../../src/serializer/SerializerXml.js"

it('Serialization should work', async t => {
    t.equal(SerializerXml.serialize(1), <serialization><number>1</number></serialization>)

    t.equal(SerializerXml.serialize("2"), <serialization><string>{ "2" }</string></serialization>)

    t.equal(SerializerXml.serialize(Symbol(1)), <serialization><symbol>Symbol(1)</symbol></serialization>)

    t.equal(
        SerializerXml.serialize({ prop1 : 1, prop2 : 2 }),
        <serialization>
            <object size={ 2 }>
                <object_entry>
                    <object_entry_key><string>prop1</string></object_entry_key><object_entry_value><number>1</number></object_entry_value>
                </object_entry>
                <object_entry>
                    <object_entry_key><string>prop2</string></object_entry_key><object_entry_value><number>2</number></object_entry_value>
                </object_entry>
            </object>
        </serialization>
    )

    t.equal(
        SerializerXml.serialize([ 1, 2 ]),
        <serialization>
            <array length={ 2 }>
                <number>1</number>
                <number>2</number>
            </array>
        </serialization>
    )
})


it('Should not show "out of wide" properties', async t => {
    t.equal(
        SerializerXml.serialize({ prop1 : 1, prop2 : 2, prop3 : 3 }, { maxDepth : 1, maxWide : 2 }),
        <serialization>
            <object size={ 3 }>
                <object_entry>
                    <object_entry_key><string>prop1</string></object_entry_key><object_entry_value><number>1</number></object_entry_value>
                </object_entry>
                <object_entry>
                    <object_entry_key><string>prop2</string></object_entry_key><object_entry_value><number>2</number></object_entry_value>
                </object_entry>
                <out_of_wide></out_of_wide>
            </object>
        </serialization>
    )

    t.equal(
        SerializerXml.serialize([ 1, 2, 3 ], { maxDepth : 1, maxWide : 2 }),
        <serialization>
            <array length={ 3 }>
                <number>1</number>
                <number>2</number>
                <out_of_wide></out_of_wide>
            </array>
        </serialization>
    )

    t.equal(
        SerializerXml.serialize(new Set([ 1, 2, 3 ]), { maxDepth : 1, maxWide : 2 }),
        <serialization>
            <set size={ 3 }>
                <number>1</number>
                <number>2</number>
                <out_of_wide></out_of_wide>
            </set>
        </serialization>
    )

    t.equal(
        SerializerXml.serialize(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]), { maxDepth : 1, maxWide : 2 }),
        <serialization>
            <map size={ 3 }>
                <map_entry><map_entry_key><number>1</number></map_entry_key><map_entry_value><number>1</number></map_entry_value></map_entry>
                <map_entry><map_entry_key><number>2</number></map_entry_key><map_entry_value><number>2</number></map_entry_value></map_entry>
                <out_of_wide></out_of_wide>
            </map>
        </serialization>
    )
})


it('Should include class name into serialization', async t => {

    class SomeClass {
        a : number          = 1
    }

    t.equal(
        SerializerXml.serialize(new SomeClass()),
        <serialization>
            <object size={ 1 } constructorName="SomeClass">
                <object_entry>
                    <object_entry_key><string>a</string></object_entry_key><object_entry_value><number>1</number></object_entry_value>
                </object_entry>
            </object>
        </serialization>
    )
})


it('Serialization of cyclic structures should include references information', async t => {
    const a     = { a : undefined }
    a.a         = a

    t.equal(
        SerializerXml.serialize(a),
        <serialization>
            <object size={ 1 } refId="1">
                <object_entry>
                    <object_entry_key><string>a</string></object_entry_key><object_entry_value><reference>1</reference></object_entry_value>
                </object_entry>
            </object>
        </serialization>
    )

    const b     = { b : undefined, c : undefined }
    b.b         = b
    b.c         = b

    t.equal(
        SerializerXml.serialize(b),
        <serialization>
            <object size={ 2 } refId="1">
                <object_entry>
                    <object_entry_key><string>b</string></object_entry_key><object_entry_value><reference>1</reference></object_entry_value>
                </object_entry>
                <object_entry>
                    <object_entry_key><string>c</string></object_entry_key><object_entry_value><reference>1</reference></object_entry_value>
                </object_entry>
            </object>
        </serialization>
    )
})


