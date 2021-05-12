Siesta sample test suite targeting Deno 
==========================================

This is an example of testing very simple Deno package with Siesta.

Package has the only module in `src/module.js`, tests are in `tests/`, Siesta project file is `tests/index.js`

Note, this test suite contains intentional failures to demonstrate the failing assertions.

Setting up
----------

Change the current working directory to the example:

```shell
cd examples/deno
```

Complete the setup with `npm`:

```shell
npm install
```

Launch
------

We can launch the project file directly, as a Deno executable:

```shell
deno --allow-read --allow-env --unstable --quiet tests/index.js
```

Documentation
-------------

If you are just starting with Siesta, please consult this guide:

[[GettingStartedNodejsGuide|Getting started with Siesta in Node.js environment]]


Github repo
===========

https://github.com/bryntum/siesta


Connect
=======

We welcome all feedback - please tell us what works well in Siesta, what causes trouble and what any other features you would like to see implemented.

Please report any found bugs in the [issues tracker](https://github.com/bryntum/siesta/issues)

Ask questions in the [forum](https://bryntum.com/forum/viewforum.php?f=20)

Chat live at [Discord](https://discord.gg/jErxFxY)

Follow the [development blog](https://www.bryntum.com/blog/)


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
