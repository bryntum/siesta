import { it } from "../../index.js"
import { anyNumberApprox } from "../../src/compare_deep/FuzzyMatcher.js"
import { SiestaJSX } from "../../src/jsx/Factory.js"
import { Serialization, SerializationArray, SerializerXml } from "../../src/serializer/SerializerXml.js"


it('Serialization should work for atoms', async t => {
    t.equal(SerializerXml.serialize(undefined), <Serialization><undefined></undefined></Serialization>, '`undefined` serialization')

    t.equal(SerializerXml.serialize(null), <Serialization><null></null></Serialization>, '`null` serialization')

    t.equal(SerializerXml.serialize(false), <Serialization><boolean>false</boolean></Serialization>, 'Boolean serialization')

    t.equal(SerializerXml.serialize(1), <Serialization><number>1</number></Serialization>, 'Number serialization')

    t.equal(SerializerXml.serialize("2"), <Serialization><string>"2"</string></Serialization>, 'String serialization')

    t.equal(SerializerXml.serialize(new Date(2020, 1, 1)), <Serialization><date>new Date("2020/01/01 00:00:00.0")</date></Serialization>, 'Date serialization')

    t.equal(SerializerXml.serialize(() => {}), <Serialization><function>{ '() => { }' }</function></Serialization>, 'Function serialization')

    t.equal(SerializerXml.serialize(function name () {}), <Serialization><function>{ 'function name() { }' }</function></Serialization>, 'Function serialization')

    t.equal(SerializerXml.serialize(Symbol(1)), <Serialization><symbol>Symbol(1)</symbol></Serialization>, 'Symbol serialization')
})


it('Serialization should work for objects', async t => {
    t.equal(
        SerializerXml.serialize({}),
        <Serialization>
            <object size={ 0 }></object>
        </Serialization>
    )

    t.equal(
        SerializerXml.serialize({ prop1 : 1, prop2 : 2 }),
        <Serialization>
            <object size={ 2 }>
                <object_entry>
                    <object_entry_key><string>"prop1"</string></object_entry_key><object_entry_value><number>1</number></object_entry_value>
                </object_entry>
                <object_entry>
                    <object_entry_key><string>"prop2"</string></object_entry_key><object_entry_value><number>2</number></object_entry_value>
                </object_entry>
            </object>
        </Serialization>
    )
})

it('Serialization should work for arrays', async t => {
    t.equal(
        SerializerXml.serialize([ 1, 2 ]),
        <Serialization>
            <SerializationArray length={ 2 }>
                <number>1</number>
                <number>2</number>
            </SerializationArray>
        </Serialization>
    )
})


it('Serialization should work for sets', async t => {
    t.equal(
        SerializerXml.serialize(new Set([ 1, 2 ])),
        <Serialization>
            <set size={ 2 }>
                <number>1</number>
                <number>2</number>
            </set>
        </Serialization>
    )
})


it('Serialization should work for maps', async t => {
    t.equal(
        SerializerXml.serialize(new Map([ [ 1, '1' ], [ 2, '2' ] ])),
        <Serialization>
            <map size={ 2 }>
                <map_entry>
                    <map_entry_key><number>1</number></map_entry_key>
                    <map_entry_value><string>"1"</string></map_entry_value>
                </map_entry>
                <map_entry>
                    <map_entry_key><number>2</number></map_entry_key>
                    <map_entry_value><string>"2"</string></map_entry_value>
                </map_entry>
            </map>
        </Serialization>
    )
})


it('Should not include "out of depth" properties', async t => {
    t.equal(
        SerializerXml.serialize({ prop1 : 1, prop2 : { prop3 : 3 } }, { maxDepth : 1 }),
        <Serialization>
            <object size={ 2 }>
                <object_entry>
                    <object_entry_key><string>"prop1"</string></object_entry_key><object_entry_value><number>1</number></object_entry_value>
                </object_entry>
                <object_entry>
                    <object_entry_key><string>"prop2"</string></object_entry_key><object_entry_value><out_of_depth constructorName="Object"></out_of_depth></object_entry_value>
                </object_entry>
            </object>
        </Serialization>
    )
})


it('Should not include "out of wide" properties', async t => {
    t.equal(
        SerializerXml.serialize({ prop1 : 1, prop2 : 2, prop3 : 3 }, { maxDepth : 1, maxWide : 2 }),
        <Serialization>
            <object size={ 3 }>
                <object_entry>
                    <object_entry_key><string>"prop1"</string></object_entry_key><object_entry_value><number>1</number></object_entry_value>
                </object_entry>
                <object_entry>
                    <object_entry_key><string>"prop2"</string></object_entry_key><object_entry_value><number>2</number></object_entry_value>
                </object_entry>
                <out_of_wide></out_of_wide>
            </object>
        </Serialization>
    )

    t.equal(
        SerializerXml.serialize([ 1, 2, 3 ], { maxDepth : 1, maxWide : 2 }),
        <Serialization>
            <SerializationArray length={ 3 }>
                <number>1</number>
                <number>2</number>
                <out_of_wide></out_of_wide>
            </SerializationArray>
        </Serialization>
    )

    t.equal(
        SerializerXml.serialize(new Set([ 1, 2, 3 ]), { maxDepth : 1, maxWide : 2 }),
        <Serialization>
            <set size={ 3 }>
                <number>1</number>
                <number>2</number>
                <out_of_wide></out_of_wide>
            </set>
        </Serialization>
    )

    t.equal(
        SerializerXml.serialize(new Map([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]), { maxDepth : 1, maxWide : 2 }),
        <Serialization>
            <map size={ 3 }>
                <map_entry><map_entry_key><number>1</number></map_entry_key><map_entry_value><number>1</number></map_entry_value></map_entry>
                <map_entry><map_entry_key><number>2</number></map_entry_key><map_entry_value><number>2</number></map_entry_value></map_entry>
                <out_of_wide></out_of_wide>
            </map>
        </Serialization>
    )
})


it('Should include class name into serialization', async t => {

    class SomeClass {
        a : number          = 1
    }

    t.equal(
        SerializerXml.serialize(new SomeClass()),
        <Serialization>
            <object size={ 1 } constructorName="SomeClass">
                <object_entry>
                    <object_entry_key><string>"a"</string></object_entry_key><object_entry_value><number>1</number></object_entry_value>
                </object_entry>
            </object>
        </Serialization>
    )
})


it('Serialization of cyclic structures should include references information', async t => {
    const a     = { a : undefined }
    a.a         = a

    t.equal(
        SerializerXml.serialize(a),
        <Serialization>
            <object size={ 1 } refId={ 1 }>
                <object_entry>
                    <object_entry_key><string>"a"</string></object_entry_key><object_entry_value><reference refId={ 1 }></reference></object_entry_value>
                </object_entry>
            </object>
        </Serialization>
    )

    const b     = { b : undefined, c : undefined }
    b.b         = b
    b.c         = b

    t.equal(
        SerializerXml.serialize(b),
        <Serialization>
            <object size={ 2 } refId={ 1 }>
                <object_entry>
                    <object_entry_key><string>"b"</string></object_entry_key><object_entry_value><reference refId={ 1 }></reference></object_entry_value>
                </object_entry>
                <object_entry>
                    <object_entry_key><string>"c"</string></object_entry_key><object_entry_value><reference refId={ 1 }></reference></object_entry_value>
                </object_entry>
            </object>
        </Serialization>
    )
})


it('Should serialize placeholders as numbers', async t => {

    t.equal(
        SerializerXml.serialize(anyNumberApprox(10)),
        <Serialization><number>10±0.5</number></Serialization>,
        'Number serialization'
    )
})
