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