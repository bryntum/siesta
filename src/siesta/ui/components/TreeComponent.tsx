/** @jsx ChronoGraphJSX.createElement */

import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ChronoGraphJSX, ElementSource } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../../chronograph-jsx/Component.js"

ChronoGraphJSX

//---------------------------------------------------------------------------------------------------------------------
export class TreeComponent extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) =>

    class TreeComponent extends base {
        props : Component[ 'props' ] & {
            state?                      : TreeComponent[ 'state' ]
            iconCls?                    : TreeComponent[ 'iconCls' ]
            collapsible?                : TreeComponent[ 'collapsible' ]
            iconClsSource?              : TreeComponent[ 'iconClsSource' ]
            extraIconSource?            : TreeComponent[ 'extraIconSource' ]
            extraCollapseIconSource?    : TreeComponent[ 'extraCollapseIconSource' ]
        }

        @field()
        state           : 'collapsed' | 'expanded'      = 'expanded'

        @field()
        collapsible     : boolean                       = true

        extraIconSource         : () => ElementSource   = () => undefined
        extraCollapseIconSource : () => ElementSource   = () => undefined

        @field()
        iconCls         : [ string, string ]            = undefined

        iconClsSource   : () => [ string, string ]      = undefined


        toggle () {
            this.state  = this.state === 'expanded' ? 'collapsed' : 'expanded'
        }


        render () : Element {
            return <tree style={ () => this.collapsible ? '--leaf-offset: 3rem' : '--leaf-offset: 1.5rem' }>
                {
                    () => {
                        const extra     = this.extraCollapseIconSource()

                        if (extra) return extra

                        return this.collapsible
                            ?
                                <span onclick={() => this.toggle()} class="icon">
                                    <i class={() => this.state === 'expanded' ? 'fas fa-caret-down' : 'fas fa-caret-right'}></i>
                                </span>
                            :
                                null
                    }
                }
                {
                    this.extraIconSource()
                }
                {
                    () => {
                        const iconCls   = this.iconClsSource?.() || this.iconCls

                        return iconCls
                            ?
                                <span class="icon title-icon">
                                    <i class={ () => this.state === 'expanded' ? iconCls[ 0 ] : iconCls[ 1 ] }></i>
                                </span>
                            :
                                null
                    }
                }
                { () => this.state === 'expanded' ? this.children : this.children[ 0 ] }
            </tree>
        }
    }
) {}
