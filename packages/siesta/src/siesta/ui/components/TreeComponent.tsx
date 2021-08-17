/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
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
            stateBox?                   : TreeComponent[ 'stateBox' ]
            iconCls?                    : TreeComponent[ 'iconCls' ]
            collapsible?                : TreeComponent[ 'collapsible' ]
            iconClsSource?              : TreeComponent[ 'iconClsSource' ]
            extraIconSource?            : TreeComponent[ 'extraIconSource' ]
            extraCollapseIconSource?    : TreeComponent[ 'extraCollapseIconSource' ]
        }

        @field()
        state           : 'collapsed' | 'expanded'      = 'expanded'

        stateBox        : Box<'collapsed' | 'expanded'> = undefined

        @field()
        collapsible     : boolean                       = true

        extraIconSource         : () => ElementSource   = () => undefined
        extraCollapseIconSource : () => ElementSource   = () => undefined

        @field()
        iconCls         : [ string, string ]            = undefined

        iconClsSource   : () => [ string, string ]      = undefined


        toggle () {
            this.setState(this.getState() === 'expanded' ? 'collapsed' : 'expanded')
        }


        onExpandCollapseClick () {
            this.toggle()

            this.el.dispatchEvent(new CustomEvent<TreeComponent>('treecomponent-expand-click', { bubbles : true, detail : this }))
        }


        setState (value : 'collapsed' | 'expanded') {
            if (this.stateBox)
                this.stateBox.write(value)
            else
                this.state = value
        }


        getState () : 'collapsed' | 'expanded' {
            if (this.stateBox) {
                const state         = this.stateBox.read()

                if (state != null) return state
            }

            return this.state
        }


        render () : Element {
            return <tree style={ () => this.collapsible ? '--leaf-offset: 3rem' : '--leaf-offset: 1.5rem' }>
                {
                    () => {
                        const extra     = this.extraCollapseIconSource()

                        if (extra) return extra

                        return this.collapsible
                            ?
                                <span onclick={ () => this.onExpandCollapseClick() } class="icon ripple">
                                    <i class={ () => this.getState() === 'expanded' ? 'fas fa-caret-down' : 'fas fa-caret-right' }></i>
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
                                    <i class={ () => this.getState() === 'expanded' ? iconCls[ 0 ] : iconCls[ 1 ] }></i>
                                </span>
                            :
                                null
                    }
                }
                { () => this.getState() === 'expanded' ? this.children : this.children[ 0 ] }
            </tree>
        }
    }
) {}
