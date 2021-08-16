[//]: # (The canonical source of this file is '/resources/docs_src/README.md')
[//]: # (That file is copied to the /README.md during `scripts/build_docs.sh` command)
[//]: # (Do not edit the /README.md directly)

<a target="_blank" href="https://siesta.works"><img src="./resources/readme_header_1.svg"></a>

<a href="https://www.npmjs.com/package/@bryntum/siesta"><img alt="link to npm package" src="https://img.shields.io/npm/v/@bryntum/siesta"></a>

Siesta is a stress-free, ubiquitous, open-source JavaScript/TypeScript testing tool, 
developed at [Bryntum](https://www.bryntum.com/) starting from the 2009.

Version 6 is a complete rewrite, using a modern technology stack and the decade of test driven development experience.

Main features:

- One test tool to run them all. Siesta can run tests in browsers, Node.js and Deno environments.
- Supports parallel execution
- Provides accurate and well-formatted deep diff for equality assertion

Siesta powers the test suites of all [Bryntum products](https://www.bryntum.com) and thousands of our clients. 


Supported target environments
=============================

Siesta can run the test in browsers, Node.js and Deno. 

Siesta supports modern, ever-green browsers only - Chrome, Firefox, Safari and Edge Chromium. IE and legacy Edge are not supported.

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
deno install -n siesta -A -q --unstable --no-check https://cdn.jsdelivr.net/npm/@bryntum/siesta@latest/bin/siesta-deno.js
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
    <td style="text-align:center"><img alt="Node.js build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Siesta6isomorphicTargetNodeJs)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Deno build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Siesta6isomorphicTargetDeno)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Chrome build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Isomorphic_Siesta6isomorphicTargetChrome)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Firefox build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Isomorphic_Siesta6isomorphicTargetFirefox)/statusIcon.svg"/></td>
    <td style="text-align:center"><img alt="Safari build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Isomorphic_Siesta6isomorphicTargetSafari)/statusIcon.svg"/></td>
</tr>
<tr>
    <td nowrap style="white-space: nowrap">Siesta Node.js 12</td>
    <td style="text-align:center"><img alt="Node.js 12 build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Siesta6NodeJsSpecificTargetNodeJs)/statusIcon.svg"/></td>
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
    <td style="text-align:center"><img alt="Deno build status" src="http://teamcity.bryntum.com/app/rest/builds/buildType:(id:Siesta6_Siesta6DenoSpecificTargetDeno)/statusIcon.svg"/></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
    <td style="background-color: #eee"></td>
</tr>
</table>


Documentation
=============

Please start reading from one the following guides, corresponding to the environment, in which you'd like to run the tests:

[[GettingStartedNodejsGuide|Getting started with Siesta in Node.js environment]]

[[GettingStartedDenoGuide|Getting started with Siesta in Deno environment]]

[[GettingStartedBrowserGuide|Getting started with Siesta in browser environment]]


Resources
===========

Website: https://siesta.works

Github repo: https://github.com/bryntum/siesta


Connect
=======

We welcome all feedback - please tell us what works well in Siesta, what causes trouble and what any other features you would like to see implemented.

Please report any found bugs in the [issues tracker](https://github.com/bryntum/siesta/issues)

Ask questions in the [forum](https://bryntum.com/forum/viewforum.php?f=20)

Chat live at [Discord](https://discord.gg/6mwJZGnwbq)

Follow the [development blog](https://www.bryntum.com/blog/)


COPYRIGHT AND LICENSE
=================

MIT License

Copyright (c) 2009-2021 Bryntum, Nickolay Platonov
