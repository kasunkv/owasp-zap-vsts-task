[![Travis](https://img.shields.io/travis/rust-lang/rust.svg?style=flat-square)](https://travis-ci.org/kasunkv/owasp-zap-vsts-task.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/kasunkv/owasp-zap-vsts-task/badge.svg)](https://coveralls.io/github/kasunkv/owasp-zap-vsts-task)
[![bitHound Overall Score](https://www.bithound.io/github/kasunkv/owasp-zap-vsts-task/badges/score.svg)](https://www.bithound.io/github/kasunkv/owasp-zap-vsts-task)
[![Known Vulnerabilities](https://snyk.io/test/github/kasunkv/owasp-zap-vsts-task/badge.svg)](https://snyk.io/test/github/kasunkv/owasp-zap-vsts-task)
[![dependencies Status](https://david-dm.org/kasunkv/owasp-zap-vsts-task/status.svg?style=flat-square)](https://david-dm.org/kasunkv/owasp-zap-vsts-task)
[![devDependencies Status](https://david-dm.org/kasunkv/owasp-zap-vsts-task/dev-status.svg?style=flat-square)](https://david-dm.org/kasunkv/owasp-zap-vsts-task?type=dev)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![Best Practices](https://bestpractices.coreinfrastructure.org/projects/1188/badge)](https://bestpractices.coreinfrastructure.org/projects/1188)
[![GitHub release](https://img.shields.io/github/release/kasunkv/owasp-zap-vsts-task.svg?style=flat-square)](https://github.com/kasunkv/owasp-zap-vsts-task/releases/latest)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://github.com/kasunkv/owasp-zap-vsts-task/blob/master/LICENSE.md)
[![Visual Studio Marketplace](https://img.shields.io/badge/Visual%20Studio%20Marketplace-install-brightgreen.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=kasunkodagoda.owasp-zap-scan)
# OWASP Zed Attack Proxy Scan Task
Visual Studio Team Services build/release task for running OWASP ZAP automated security tests. Run active scan against a target with security risk thresholds and ability to generate the scan report.

## Using OWASP Zed Attack Proxy Scan Task

Follow the instructions given below to add and configure OWASP Zed Attack Proxy Task in your build/release pipeline.

## Prerequisites
* You need to have OWASP Zed Attach Proxy installed (eg. On a Virtual Machine) and exposed so it can be accessed over the internet. [The following article Installing & Configuring OWASP ZAP on an Azure Virtual Machine](https://wpdevkvk.wordpress.com/2017/07/21/automated-security-testing-with-owasp-zed-attack-proxy-1-installing-configuring-owasp-zap-on-an-azure-virtual-machine/) will provide a detailed guide on how to do it.
* Obtain the API Key required to access the ZAP API by following the instructions on the [Official Documentation](https://github.com/zaproxy/zaproxy/wiki/FAQapikey).

### Add the OWASP Zed Attack Proxy Scan Task
Install the OWASP Zed Attack Proxy Scan Task in to your Visual Studio Team Services account and search for the task in the available tasks. The task will appear in the _Test_ section of the task list. Add it to your build/release task.

![Add OWASP Zed Attack Proxy Task](https://raw.githubusercontent.com/kasunkv/owasp-zap-vsts-task/master/screenshots/add-owasp-zap-scan.PNG)

## Required Configuration
OWASP Zed Attack Proxy Scan task has some required configuration options that needed to be provided.

These configurations are found in the _**ZAP API Configuration**_ section.

![Required Configuration Options](https://raw.githubusercontent.com/kasunkv/owasp-zap-vsts-task/master/screenshots/task-added-3-configs-required.PNG)

### Required Options
* **ZAP API Url** : The fully qualified domain name (FQDN) with out the protocol. (Eg. _zap.example.com_)
* **API Key** : The API key for ZAP. Details about obtaining the API can be found on the [Official Documentation](https://github.com/zaproxy/zaproxy/wiki/FAQapikey)
* **Target URL** : Target URL where the active scan is performed against.


## Spider Scan Options
This configuration section includes the parameters that need to be sent to perform the active scan against the target.

![Spider Scan Options](https://raw.githubusercontent.com/kasunkv/owasp-zap-vsts-task/master/screenshots/spider-scan-options.png)

### Available Options
* **Execute Spider Scan** : Enable to run a spider scan on the target.
* **Recurse** : _(Optional)_ Enable to use the nodes underneath the one specified target to seed the spider.
* **Subtree Only** : _(Optional)_ Enable to restrict the spider under the target url subtree.
* **Context Name** : _(Optional)_ Set to constrain the scan to a Context.
* **Max Children To Crawl** : _(Optional)_ Set to limit the number of children scanned.

## Active Scan Options
This configuration section includes the parameters that need to be sent to perform the active scan against the target.

![Active Scan Options](https://raw.githubusercontent.com/kasunkv/owasp-zap-vsts-task/master/screenshots/active-scan-options.PNG)

### Available Options
* **Execute Active Scan** : Enable to run a active scan on the target.
* **Context ID** : _(Optional)_ Context identifier of the Scan context.
* **Recurse** : _(Optional)_ Set recurse option to scan URLs under the given target URL.
* **In Scope Only** : _(Optional)_ Set In Scope only to true to constrain the scan to URLs that are in scope (ignored if a Context is specified).
* **Scan Policy Name** : _(Optional)_ Scan Policy Name allows to specify the scan policy (if none is given it uses the default scan policy).
* **Method** : _(Optional)_ Allow you to select a given request in conjunction with the given URL.
* **POST Data** : _(Optional)_ Allow you to select a given request in conjunction with the given URL.


## Configure Verification
This configuration section includes the parameters that need to be sent to perform the active scan against the target.

![Configure Verification](https://raw.githubusercontent.com/kasunkv/owasp-zap-vsts-task/master/screenshots/configure-verifications.PNG)

### Available Options
* **Enable Verifications** : Enable to add thresholds for security risk types and fail the build if the threshold is exceeded.
* **High Risk Alert Threshold** : Number of Maximum allowed High Risk Alerts. If the number of high risk alerts equals or exceeds, the build will fail.
* **Medium Risk Alert Threshold** : Number of Maximum allowed High Medium Alerts. If the number of high risk alerts equals or exceeds, the build will fail.
* **Low Risk Alert Threshold** : Number of Maximum allowed Low Risk Alerts. If the number of high risk alerts equals or exceeds, the build will fail.


## Configure Reports
This configuration section includes the parameters that need to be sent to perform the active scan against the target.

![Configure Reports](https://raw.githubusercontent.com/kasunkv/owasp-zap-vsts-task/master/screenshots/configure-reports.PNG)

### Available Options
* **Report Type** : Select the type of report you want generated. Available types are _**HTML**_, _**XML**_ & _**Markdown**_.
* **Destination Folder** : The destination folder that the report file is created. You can use [variables](https://go.microsoft.com/fwlink/?LinkID=550988). Eg. _$(agent.builddirectory)_.
* **Report Filename** : Name of the report file, without the extension. Extension is determined by the _**Report Type**_. Eg. _OWASP-ZAP-Report-2017-00-00_.



# Contributing to OWASP Zed Attack Proxy Scan Task

## Found a Bug?

* Check currently listed [Issues](https://github.com/kasunkv/owasp-zap-vsts-task/issues) to make sure its **not already listed.**
* If not [Open a New Issue](https://github.com/kasunkv/owasp-zap-vsts-task/issues/new) for the Bug. Include a **detailed description including a proper title that is meaningful and a clear description** with
as much relevant details regarding the issue as possible.

## Fixed a Bug?

* Open a New Pull Request with the fix.
* We are using a **strict commit guideline** with the OWASP Zed Attack Proxy Scan Task project. Please read the details in the **Commit Guideline** before you make commits.

## Add/Suggest a New Feature, or Change Existing One?

* Add your suggestions to the [Gitter]() Chat for the project.
* After getting a discussion going, Create a new Issue related to the feature in the Issues section. Add detailed description with a title for the issue.
* Follow the **Commit Guideline** mentioned bellow when committing.
* Create a Pull Request when you are done with the feature.

## Have Questions?

* All of your questions are welcome. Post them in the [Gitter]() chat for the project.


# Commit Guidelines (Git Commit Convention)

A strict commit guidelines are followed so that its easy to do release with semantic versioning. [Semantic Release](https://github.com/semantic-release/semantic-release) package is used to do this. [Commitizen](https://www.npmjs.com/package/commitizen) is used with [Commitizen Conventional Changelog](https://www.npmjs.com/package/cz-conventional-changelog) to add proper commit messages. Git hooks  created using [ghooks](https://www.npmjs.com/package/ghooks) are inplace to enforce the commit format used in the project.
Each commit message consists of a header, a body and a footer. The header has a special format that includes a type, a scope and a subject. The commit message format is bellow.

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Header is mandatory and the scope is optional, But its encouraged to add a scope. Footer is also optional.
To perform a commit follow these steps

```sh
# Add the files you want to commit
$ git add <FILES_TO_COMMIT>

# Use the configured ghook
$ npm run commit
```

[Read More](http://commitizen.github.io/cz-cli/) to learn about Commitizen and its conventions.

# Current Contributors

A special thanks to all the [Contributors](https://github.com/kasunkv/owasp-zap-vsts-task/graphs/contributors) of the OWASP Zed Attack Proxy Scan Task Project.
**Your valuable contributions are most welcome. :)**