import { ArbitraryObject } from "../../../util/Helpers.js"
import { span, xml, XmlElement, XmlNode } from "../../jsx/XmlElement.js"
import { SiestaJSX } from "../../jsx/Factory.js"
import { Assertion } from "../Result.js"


//---------------------------------------------------------------------------------------------------------------------
export const assertionTemplate = (ass : Assertion) : XmlElement => {
    return assertion(
        assertion_name(ass.name), ' ',
        assertion_description(ass.description),
        assertion_source(123, 'source/file.js'),
    )
}


export const assertion = (...childNodes : XmlNode[]) : XmlElement =>
    xml({ tagName : 'div', class : 'assertion', childNodes })

export const assertion_name = (name : string) : XmlElement =>
    span('assertion_name', name)

export const assertion_description = (description : string) : XmlElement =>
    span('assertion_description', description)

export const assertion_source = (line : number, file : string) : XmlElement =>
    span('assertion_source', 'at ', span('assertion_source_file', file), ':', span('assertion_source_line', String(line)))



//---------------------------------------------------------------------------------------------------------------------
/* samples of failing assertions:

is:

[is] Assertion description at line 537 of `source/file.t.js`
got      : 123
expected : 1234


isDeeply:

[isDeeply] Assertion description at line 537 of `source/file.t.js`

Provided value is different from the expected. List of differences:

- prop1[ 5 ] is different:
    got      : 'asd'
    expected : 'das'
- prop1.prop2 is an array of length 5 and expected array has length of 3
    extra elements [3..4]: [ 13, 11 ] [[no more than 5]]

- prop2.prop3 is an array of length 3 and expected array has length of 5
    missing elements [3..4]: [ 13, 11 ] [[no more than 5]]

- prop2.get({ id : 13, ... }[[no more than 2, prefer `id/type/key/`).prop3[ 4 ] is different:
    got      : 'asd'
    expected : 'das'
 */
