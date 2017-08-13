![Visual Studio Team Services](https://kasunkodagoda.visualstudio.com/_apis/public/build/definitions/a6819d70-02f9-4711-8ff6-ae44bb52a8d1/30/badge)
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

These configurations are found in the _**ZAP API Configuration**_ section and _**Active Scan Options**_ section.

![Required Configuration Options](https://raw.githubusercontent.com/kasunkv/owasp-zap-vsts-task/master/screenshots/task-added-3-configs-required.PNG)

### Required Options
* **ZAP API Url** : The fully qualified domain name (FQDN) with out the protocol. (Eg. _zap.example.com_)
* **API Key** : The API key for ZAP. Details about obtaining the API can be found on the [Official Documentation](https://github.com/zaproxy/zaproxy/wiki/FAQapikey)
* **Target URL** : Target URL where the active scan is performed against.

## Active Scan Options
This configuration section includes the parameters that need to be sent to perform the active scan against the target.

![Active Scan Options](https://raw.githubusercontent.com/kasunkv/owasp-zap-vsts-task/master/screenshots/active-scan-options.PNG)

### Available Options
* **Target URL** : _(Required)_ Target URL where the active scan is performed against.
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


