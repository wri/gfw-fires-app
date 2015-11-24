# GFW-Fires
> Please read this before beginning development to learn how to get started and how to change some simple components of the application.



## Getting Started

<p>This project has a few dependencies you will need installed to get started.</p>

### Installing node.js if you do not have it already.
<p>View the <a href='http://nodejs.org/'>node.js</a> homepage and install.</p>

### Clone the Repo
<p>If you haven't already done so, clone the repo.</p>

### Install dependencies
<p>TODO</p>



## Development
<p>TODO</p>

### Architecture overview
### Npm scripts
### Build Process


## Configurations

### Language
<p>This application is intended to be availbale in both english and indonesian, all text that should be translated should be in the correct locals file found in the i18n folder.</p>

### Environment Variables
<p>TODO</p>



## Git Workflow

#### Main Development
<p>Developers should aim to stay close to the latest version of the development branch. Small fixes and tweaks are appropriate as small commits that are made directly to the develop branch.</p>
<p>Anything sizeable should be a focused (affecting only relevant files to avoid conflicts) and well named feature branch that is properly merged back and deleted upon completion.</p>

#### Continuous Integration off Master
<p>Production for this application is a Heroku LAMP dynamo that is configured to watch for changes to the master branch. Upon merging develop into master or pushing to master, it will build the latest version of the app and re-host automatically.<p>
<p>This automatic update will take a moment because build/dist artifacts are not committed, the dynamo is configured to install node dependencies, install bower dependencies, and compile the app dist for hosting.<p>

#### Versioning
<p>TODO</p>

##### NOTE: DO NOT UNDER ANY CIRCUMSTANCES COMMIT ANY CREDENTIALS OF ANY KIND
