import { ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { ExtComponent, ExtElement, TestSenchaPre } from "../TestSenchaPre.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class AssertionGrid extends Mixin(
    [ TestSenchaPre ],
    (base : ClassUnion<typeof TestSenchaPre>) =>

    class AssertionGrid extends base {

        // /**
        //  * Waits for the rows of a gridpanel or tree panel (or view) to render and then calls the supplied callback. Please note, that if the store of the grid has no records,
        //  * the condition for this waiter will never be fullfilled.
        //  *
        //  * @param {Ext.view.Table/Ext.panel.Table/String} view The view or a ComponentQuery matching a view
        //  * @param {Function} callback A function to call when the condition has been met.
        //  * @param {Object} scope The scope for the callback
        //  * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
        //  */
        // waitForRowsVisible (view, callback, scope, timeout) {
        //     if (typeof view === 'function') {
        //         timeout     = scope
        //         scope       = callback
        //         callback    = view
        //         view       = this.Ext() && this.cq1('tableview') || 'tableview'
        //     }
        //
        //     let cmp = this.Ext() && this.normalizeComponent(view, true)
        //     let me = this
        //
        //     if (!cmp && typeof view === 'string') {
        //         // Make sure CQ returns a result first
        //         return this.waitForCQ(view, function (result) { this.waitForRowsVisible(result[0], callback, scope, timeout) }, this)
        //     } else {
        //         let checkerFn
        //
        //         // Handle case of locking grid (Ext JS 4+ only)
        //         if (cmp.normalGrid) {
        //             let selector = cmp.normalGrid.getView().itemSelector
        //
        //             checkerFn = function () {
        //                 if (!cmp.rendered || !cmp.normalGrid.rendered || !cmp.lockedGrid.rendered) return
        //
        //                 let lockedResult = this.query(selector, cmp.lockedGrid.getView().getEl().dom)
        //                 let normalResult = this.query(selector, cmp.normalGrid.getView().getEl().dom)
        //
        //                 if (lockedResult.length > 0 && normalResult.length > 0) {
        //                     return {
        //                         lockedRows : lockedResult,
        //                         normalRows : normalResult
        //                     }
        //                 }
        //             }
        //         } else {
        //             let view = (cmp.getView && cmp.getView()) || cmp
        //             let selector = view.itemSelector || view.rowSelector // Handling Ext 4 + Ext 3 cases
        //
        //             checkerFn = function () {
        //                 if (!cmp.rendered) return
        //
        //                 let result = this.query(selector, view.el.dom)
        //
        //                 if (result.length > 0) {
        //                     return result
        //                 }
        //             }
        //         }
        //
        //
        //         return this.waitFor({
        //             method          : checkerFn,
        //             callback        () {
        //                 // Grid might be refreshing itself multiple times during initialization which can
        //                 // break tests easily
        //                 let as = me.beginAsync()
        //
        //                 me.global.setTimeout(function () {
        //                     me.endAsync(as)
        //                     callback.call(scope || me)
        //                 }, 100)
        //             }
        //             timeout         : timeout,
        //             assertionName   : 'waitForRowsVisible',
        //             description     : ' ' + Siesta.Resource('Siesta.Test.ExtJS.Grid').get('waitForRowsVisible') + ' "' + cmp.id + '"'
        //         })
        //     }
        // }

        // /**
        //  * Utility method which returns the first grid row element.
        //  *
        //  * Please also refer to the {@link #getRow} method for additional information about the buffered renderer case.
        //  *
        //  * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
        //  * @return {Ext.Element} The element of the first row in the grid.
        //  */
        // getFirstRow (grid) {
        //     grid = this.normalizeComponent(grid)
        //
        //     return this.getRow(grid, 0)
        // }
        //
        // /**
        //  * Utility method which returns the first grid cell element (the one at (0, 0) coordinates).
        //  *
        //  * Please also refer to the {@link #getRow} method for additional information about the buffered renderer case.
        //  *
        //  * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
        //  *
        //  * @return {Ext.Element} The element of the first cell in the grid.
        //  */
        // getFirstCell (panel) {
        //     panel = this.normalizeComponent(panel)
        //
        //     return this.getCell(panel, 0, 0)
        // }

        /**
         * Utility method which returns a grid row DOM element. If the grid is locking, then the row element from the locked grid is returned
         * (from the left part).
         *
         * Please note, that if the grid uses buffered rendering, you need to make sure the row with the required index
         * is currently rendered (as buffered renderer only renders a part of the dataset). This can be done
         * with the `grid.ensureVisible()` call, please refer to ExtJS grid docs:
         *
         * ```js
         * grid.ensureVisible(80, {
         *     callback () {
         *         var row     = t.getRow(80);
         *         var cell    = t.getCell(grid, 80, 0);
         *
         * });
         * ```
         *
         * @param target The table panel instance or a component query, matching a panel
         * @param index The row index in the whole dataset
         *
         * @category Sencha: Grid
         */
        getRow  (target : string | ExtComponent, index : number) : ExtElement {
            const Ext       = this.Ext

            let grid        = this.resolveExtComponent(target)

            let domNode

            // Sencha Modern
            if (Ext.grid.Grid && (grid instanceof Ext.grid.Grid)) {
                let rowCmp  = grid.getViewItems()[ index ]

                domNode     = rowCmp && rowCmp.element
            } else {
                // Sencha Classic
                // if this is a locking grid, grab from locked grid
                grid        = grid.lockedGrid || grid

                if (grid.getView().bufferedRenderer) {
                    let record  = grid.getStore().getRange(index, index + 1)[ 0 ]

                    if (record) {
                        domNode = grid.getView().getNode(record)
                    }
                } else
                    domNode     = grid && this.query(grid.getView().itemSelector, grid.getView().getEl().dom)[ index ]
            }

            return domNode && Ext.get(domNode)
        }

        /**
         * Utility method which returns the cell at the supplied row and col position.
         *
         * Please also refer to the [[getRow]] method for additional information about the buffered renderer case.
         *
         * @return The element of the grid cell at specified position.
         *
         * @param target The panel or a ComponentQuery matching a panel
         * @param row The row index
         * @param col The column index
         *
         * @category Sencha: Grid
         */
        getCell (target : string | ExtComponent, row : number, col : number) : ExtElement {
            const grid      = this.resolveExtComponent(target)

            let rowEl       = grid && this.getRow(grid, row)
            let cellNode    = rowEl && this.query(grid.view.cellSelector, rowEl.dom)[ col ]

            return cellNode && this.Ext.get(cellNode)
        }

    //     /**
    //      * Utility method which returns the last cell for the supplied row.
    //      *
    //      * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
    //      * @param {Int} row The row index
    //      *
    //      * @return {Ext.Element} The element of the grid cell at specified position.
    //      */
    //     getLastCellInRow (grid, row) {
    //         grid = this.normalizeComponent(grid)
    //
    //         return this.getCell(grid, row, grid.headerCt.getColumnCount() - 1)
    //     }
    //
    //     /**
    //      * This assertion passes if the passed string is found in the passed grid's cell element.
    //      *
    //      * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
    //      * @param {Int} row The row index
    //      * @param {Int} column The column index
    //      * @param {String/RegExp} string The string to find or RegExp to match
    //      * @param {String} [description] The description for the assertion
    //      */
    //     matchGridCellContent (grid, rowIndex, colIndex, string, description) {
    //         grid = this.normalizeComponent(grid)
    //
    //         let view = grid.getView(),
    //             Ext = this.Ext(),
    //             cell = this.getCell(grid, rowIndex, colIndex).child('.' + Ext.baseCSSPrefix + 'grid-cell-inner')
    //
    //         let isRegExp    = this.typeOf(string) == 'RegExp'
    //         let content     = cell.dom.innerHTML
    //
    //         if (isRegExp ? string.test(content) : content.indexOf(string) != -1) {
    //             this.pass(description, {
    //                 descTpl     : isRegExp ? 'Cell content {content} matches regexp {string}' : 'Cell content {content} has a string {string}',
    //                 content     : content,
    //                 string      : string
    //             })
    //         } else {
    //             this.fail(description, {
    //                 assertionName   : 'matchGridCellContent',
    //
    //                 got         : cell.dom.innerHTML,
    //                 gotDesc     : 'Cell content',
    //
    //                 need        : string,
    //                 needDesc    : 'String matching',
    //
    //                 annotation  : 'Row index: ' + rowIndex + ', column index: ' + colIndex
    //             })
    //         }
    //     }
    //
    //
    //     /**
    //      * This method performs either a click or double click on the specified grid cell
    //      * (depending from the [clicksToEdit](http://docs.sencha.com/extjs/4.2.2/#!/api/Ext.grid.plugin.Editing-cfg-clicksToEdit)
    //      * config of its editing plugin), then waits until the `input` selector appears under the cursor and calls the provided callback.
    //      * The callback will receive the DOM `&lt;input&gt; element as the 1st argument.
    //      *
    //      * In some browsers the editor is shown with delay, so its highly recommended to use this method when editing cells.
    //      * Typical usage will be:
    //      *
    //
    // t.chain(
    //     function (next) {
    //         t.clickToEditCell(grid, 0, 1, next)
    //     },
    //     function (next, inputEl) {
    //         t.type(inputEl, "my text", next)
    //     }
    // )
    //
    //      *
    //      *
    //      * @param {Ext.grid.Panel/String} grid The grid panel or a ComponentQuery matching a panel
    //      * @param {Int} rowIndex The row index
    //      * @param {Int} colIndex The column index
    //      * @param {Function} callback The callback to call once the `input` selector appears under the cursor
    //      * @param {String} selector Custom selector to wait for, instead of `input`.
    //      */
    //     clickToEditCell  (grid, rowIndex, colIndex, callback, selector) {
    //         let Ext             = this.getExt()
    //
    //         grid                = this.normalizeComponent(grid)
    //
    //         let editingPlugin   = grid && grid.editingPlugin
    //
    //         if (!editingPlugin || !(editingPlugin instanceof Ext.grid.plugin.CellEditing)) {
    //             this.fail("No grid, or grid has no editing plugin, or its not a Ext.grid.plugin.CellEditing plugin")
    //
    //             callback && callback(null)
    //
    //             return
    //         }
    //
    //         let me      = this
    //
    //         this[ editingPlugin.clicksToEdit == 2 ? 'doubleClick' : 'click' ](this.getCell(grid, rowIndex, colIndex), function () {
    //             // manually force editing if it didn't get started by the click
    //             if (!editingPlugin.getActiveEditor()) editingPlugin.startEditByPosition({ row : rowIndex, column : colIndex })
    //
    //             me.waitForSelectorAtCursor(selector || '.x-editor,input', callback)
    //         })
    //     }
    //
    //     getTrimmedCellContent (grid, row, column) {
    //         let cell = this.getCell(grid, row, column)
    //
    //         return cell.dom.innerText.trim()
    //     }
    //
    //     /**
    //      * Assertion method which passes if the grid cell is empty.
    //      *
    //      * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
    //      * @param {Int} rowIndex The row index
    //      * @param {Int} colIndex The column index
    //      * @param {String} message The assertion message
    //      *
    //      * @return {Ext.Element} The element of the grid cell at specified position.
    //      */
    //     assertCellIsEmpty (grid, row, column, message) {
    //         this.is(this.getTrimmedCellContent(grid, row, column), '', message)
    //     }
    //
    //     /**
    //      * Wait-for method which waits until the chosen grid cell is empty.
    //      *
    //      * @param {Ext.panel.Table/String} panel The panel or a ComponentQuery matching a panel
    //      * @param {Int} rowIndex The row index
    //      * @param {Int} colIndex The column index
    //      * @param {Object} scope The 'this' object for the callback
    //      * @param {Int} timeout The timeout in ms
    //      * @param {Function} callback The callback called when the condition is fulfilled
    //      *
    //      * @return {Ext.Element} The element of the grid cell at specified position.
    //      */
    //     waitForCellEmpty (grid, row, column, scope, timeout, callback) {
    //         if (typeof scope === 'function') {
    //             callback    = scope
    //         } else if (typeof timeout === 'function') {
    //             callback    = timeout
    //         }
    //
    //         this.waitFor({
    //             method          : function () {
    //                 return this.getTrimmedCellContent(grid, row, column).length === 0
    //             },
    //             callback        : function () {
    //                 callback.call(scope || this)
    //             },
    //             timeout         : timeout,
    //             assertionName   : 'waitForCellEmpty',
    //             description     : ' ' + Siesta.Resource('Siesta.Test.ExtJS.Grid').get('waitForCellEmpty')
    //         })
    //     }
    }
) {}
