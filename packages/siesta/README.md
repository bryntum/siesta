[//]: # (The canonical source of this file is '/resources/docs_src/README.md')
[//]: # (That file is copied to the /README.md during `scripts/build_docs.sh` command)
[//]: # (Do not edit the /README.md directly)

<a target="_blank" href="https://siesta.works"><img src="./packages/siesta/resources/images/readme_header.svg"></a>

<a href="https://www.npmjs.com/package/@bryntum/siesta"><img alt="link to npm package" src="https://img.shields.io/npm/v/@bryntum/siesta"></a>

Siesta is a stress-free, ubiquitous & open-source JavaScript/TypeScript testing tool 
developed by [Bryntum](https://www.bryntum.com/) since 2009.

Version 6 is a complete rewrite, using a modern technology stack and a decade of test driven development experience.

Main features:

- One test tool to run all types of tests. Siesta can run tests in all modern browsers, Node.js and Deno. Moreover,
in browsers, both in-process and out-of-process execution models are supported, so that you can choose the most 
appropriate one
- Supports parallel execution
- Supports native simulation of user actions, like clicking, typing etc. 
- Provides accurate and well-formatted deep diff for equality assertion

Siesta powers the test suites of all [Bryntum products](https://www.bryntum.com) and thousands of our clients. 


Supported environments
=============================

Siesta can run the test in browsers (both in-process and out-of-process), Node.js and Deno. 

Siesta supports modern, ever-green browsers only - Chrome, Firefox, Safari and Edge Chromium. IE, legacy Edge and quirks mode are not supported.

Siesta supports all maintained LTS releases of Node.js. 

Siesta supports the latest release of Deno.


Installation
=============

Node.js environment:
```shell
npm install @bryntum/siesta --save-dev
```

Deno environment:
```shell
deno install -n siesta -A -q --unstable --no-check https://cdn.jsdelivr.net/npm/@bryntum/siesta@latest/bin/siesta_deno.js
```

Build statuses
==============

<table>
<tr>
    <th align="left">Build</th>
    <th><img width="50" src="https://bryntum.com/site-images/nodejs.png" alt="Node.js"/></th>
    <th><img width="50" src="https://bryntum.com/site-images/deno.png" alt="Deno"/></th>
    <th><img width="50" src="https://bryntum.com/temp/browserlogos/chrome_256x256.png" alt="Chrome"/></th>
    <th><img width="50" src="https://bryntum.com/temp/browserlogos/firefox_256x256.png" alt="Firefox"/></th>
    <th><img width="50" src="https://bryntum.com/temp/browserlogos/safari_256x256.png" alt="Safari"/></th>
</tr>
<tr>
    <td nowrap style="white-space: nowrap">Siesta isomorphic</td>
    <td style="text-align:center"><img alt="Node.js build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Isomorphic_Siesta6isomorphicTargetNode12new)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Deno build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Isomorphic_Siesta6isomorphicTargetDeno)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Chrome build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Isomorphic_Siesta6isomorphicTargetChrome_2)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Firefox build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Isomorphic_Siesta6isomorphicTargetFirefox)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Safari build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Isomorphic_Siesta6isomorphicTargetSafari)/statusIcon.svg"/></td>
</tr>
<tr>
    <td nowrap style="white-space: nowrap">Siesta browser</td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
    <td style="text-align:center"><img alt="Chrome build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Siesta6Browser_Siesta6browserTargetChrome)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Firefox build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Siesta6Browser_Siesta6browserTargetFirefox)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Safari build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Siesta6Browser_Siesta6browserTargetSafari)/statusIcon.svg"/></td>
</tr>
<tr>
    <td nowrap style="white-space: nowrap">Siesta Node.js 12</td>
    <td style="text-align:center"><img alt="Node.js 12 build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_NodeJsSpecific_Siesta6NodeJsSpecificTargetNodeJs12)/statusIcon.svg"/></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
</tr>
<tr>
    <td nowrap style="white-space: nowrap">Siesta Node.js 14</td>
    <td style="text-align:center"><img alt="Node.js 14 build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_NodeJsSpecific_Siesta6NodeJsSpecificTargetNodeJs14)/statusIcon.svg"/></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
</tr>
<tr>
    <td nowrap style="white-space: nowrap">Siesta Node.js 16</td>
    <td style="text-align:center"><img alt="Node.js 16 build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_NodeJsSpecific_Siesta6NodeJsSpecificTargetNodeJs16)/statusIcon.svg"/></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
</tr>
<tr>
    <td nowrap style="white-space: nowrap">Siesta Deno</td>
    <td style="background-color: #eee"></td>
    <td style="text-align:center"><img alt="Deno build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_DenoSpecific_Siesta6DenoSpecificTargetDeno)/statusIcon.svg"/></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
</tr>
</table>


Documentation
=============

Please start reading from one the following guides, corresponding to the environment, in which you'd like to run the tests:

[Getting started with Siesta in Node.js environment](https://bryntum.github.io/siesta/docs/modules/Guide__Getting_started_Node_js.html)

[Getting started with Siesta in Deno environment](https://bryntum.github.io/siesta/docs/modules/Guide__Getting_started_Deno.html)

[Getting started with Siesta in browser environment](https://bryntum.github.io/siesta/docs/modules/Guide__Getting_started_browser.html)

[Getting started with Siesta in Sencha framework environment](https://bryntum.github.io/siesta/docs/modules/Guide__Getting_started_Sencha.html)


Resources
===========

Website: https://siesta.works

Github repo: https://github.com/bryntum/siesta

Connect
=======

We welcome all feedback, so please let us know how we can improve your testing experience and reduce friction in your TDD cycle.

Please report any bugs found and request features in the [issues tracker](https://github.com/bryntum/siesta/issues)

Ask questions in the [forum](https://bryntum.com/forum/viewforum.php?f=20)

Chat live at [Discord](https://discord.gg/6mwJZGnwbq)

Follow the [development blog](https://www.bryntum.com/blog/)


Attribution
===========

This software contains icons from the following icon packs (licensed under Creative Common 2.5/3.0 Attribution licenses)

- <https://fontawesome.com/>


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
