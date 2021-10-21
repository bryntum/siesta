Auto waiting
============

Before performing the user action simulation, Siesta waits for the target element to become "actionable".
This means it should pass several "actionability" checks.

Depending on the action, the list of the checks is different.

Actionability checks
====================

- `present` This check passes, when the [[ActionTarget]] query resolves to a target DOM element.
- `connected` This check passes when the target DOM element becomes [connected](https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected) to the DOM tree. For example, the element, newly created with the `document.createElement('div)` will fail this check.
- `accessible` This check passes, when the target DOM element passes the `connected` check, has non-empty [client rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) and is "visible". Visible here means the element's `display` CSS style 
is not `none` and `visibility` CSS style is not `hidden`.
- `visible` This check passes, when the target DOM element passes the `accessible` check, and its [client rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) has non-empty intersection with the viewport (currently visible 
part of the document). Simply said, this check passes when the target is visible on the page (not scrolled out). 
Note, that if this check fails, Siesta will try to scroll the action point into view and if that will fail too, will continue waiting.
- `stable` This check passes, when the target DOM element passes the `visible` check, and its [client rectangle](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) remains exactly the same for the period of 2 consecutive [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) calls. This basically means, the target should not be moving
and/or resizing on the screen.
- `reachable` This check passes, when the target point of the DOM element is directly reachable by the user - it is 
not covered with any other elements, like masks, overlays etc. Note, that it's usually fine, if the element is covered 
with one of its child elements - this check normally passes in this case too. This behavior is controlled with 
the `allowChild` option of the [[MouseActionOptions]] object.

Mouse actions
=============

For the element to become "actionable" in the mouse action, it generally needs to pass all the actionability checks from above.

One exception is, however, the case, when mouse action contains an offset outside the target element, for example:
```javascript
await t.click('#target', [ '100% + 5', '50%' ]) // click 5px to the right of the '#target' element
await t.click('#target', [ '50%', '0% - 5' ]) // click 5px above the '#target' element
```
In this case, Siesta will skip the `reachable` check for the target element, since the action is not going to happen on any of its points. 
Siesta will wait for the `stable` check to pass for the target point however - the whatever element is at that location
it should not move/resize.

Keyboard actions
================

For keyboard actions the only checks that needs to pass are `present` and `connected`.


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
