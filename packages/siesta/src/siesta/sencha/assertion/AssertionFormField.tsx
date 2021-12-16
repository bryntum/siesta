import { ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { ExtComponent, TestSenchaPre } from "../TestSenchaPre.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionFormField extends Mixin(
    [ TestSenchaPre ],
    (base : ClassUnion<typeof TestSenchaPre>) =>

    class AssertionFormField extends base {

        /**
         * Passes if the passed field has the expected value.
         *
         * @param target A form field or a component query selector
         * @param value A value to compare to.
         * @param description The description of the assertion
         */
        fieldHasValue (target : string | ExtComponent, value : unknown, description? : string) {
            const field = this.resolveExtComponent(target)

            this.assertEqualityInternal(
                'fieldHasValue',
                field.getValue() === value,
                this.isAssertionNegated,
                field.getValue(),
                value,
                description
            )
        }


        /**
         * Passes if the passed field has no value ("" or `null`).
         *
         * @param target A form field or a component query selector
         * @param description The description of the assertion
         */
        isFieldEmpty (target : string | ExtComponent, description? : string) {
            const field     = this.resolveExtComponent(target)
            const value     = field.getValue()

            this.assertEqualityInternal(
                'isFieldEmpty',
                value == null || value === '',
                this.isAssertionNegated,
                value,
                "",
                description
            )
        }


        /**
         * Sets a value to an Ext Component. A faster way to set a value than manually calling "type" into
         * a text field for example. A value is set by calling either the `setChecked` or `setRawValue` or
         * `setValue` method of the component.
         *
         * @param component A component instance or a component query to resolve
         * @param value
         */
        setFieldValue (component : ExtComponent | string, value : unknown) {
            component   = this.resolveExtComponent(component);

            // semi-colon needed
            (component.setChecked || component.setRawValue || component.setValue).call(component, value)
        }


        // deprecated
        setValue (component : ExtComponent | string, value : unknown) {
            this.setFieldValue(component, value)
        }
    }
) {}
