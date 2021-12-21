Getting started with Siesta in Sencha environment
================================================

Siesta is a stress-free JavaScript/TypeScript testing tool. It is ubiquitous - tests can be run in browsers, Node.js and Deno, on Linux, macOS and Windows.
Moreover, in browsers, both in-process and out-of-process execution is supported.

In this guide, we assume a setup, pointed toward running tests for code written with Sencha framework.

Sencha-related functionality of Siesta is based on the generic browser layer. Please familiarize yourself with the [[GettingStartedBrowserGuide|Getting started with Siesta in browser environment]] guide first.


Importing API
=============

When targeting sencha environment for running tests, import the Siesta API from the `@bryntum/siesta/sencha.js` entry file.


Action target extensions. Component query. Composite query.
============

The most important extension implemented in the Sencha layer is extension of the [[ActionTarget]] type. This type is extended to [[ActionTargetSencha]].

This means in the methods, that accepts [[ActionTarget]] one can additionally provide an `Ext.Component` or `Ext.Element`
instance. Also, the semantic of the string selector is extended with [[componentQuery|component query]] and [[compositeQuery|composite query]].

Component query selector is distinguished from the regular CSS selector by the leading `>>` symbol:
```js
await t.click('>>panel[title=My Panel]')
```
Such query is resolved to the main elements of the matching components.

Composite query is distinguished from the regular CSS query by the presence of the `=>` separator.

This symbol splits the query into 2 parts (hence the name) - the 1st part is a component query and 2nd -
a regular CSS query. First, the component query is performed, then - the CSS query inside the main elements
of all matching components.

```js
await t.click('panel[title=My Panel] => .my-class')
```
Such query is resolved to the DOM elements, matching the CSS query (2nd part) inside the main elements of components,
matching the component query (1st part).


Additional assertions
=====================

Sencha layer also provides various convenience helper methods and assertions. For a full list please refer to the [[TestSencha]] documentations,
here we'll list only most commonly used:

- [[waitForComponentQuery]]
- [[waitForComponentQueryVisible]]
- [[waitForCompositeQuery]]
- [[componentQueryExists]]


Additional test descriptor configs
==================================

The most important additional configs, added by the Sencha layer are [[waitForExtReady]] and [[waitForAppReady]].
[[waitForExtReady]] is enabled by default, it just waits for the `Ext.onReady()` callback to happen before starting
the test. And [[waitForAppReady]] should be enabled when testing a SenchaCmd application. 


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
