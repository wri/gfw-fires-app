GFW-Fires
---
Please read this before beginning development to learn how to get started and how to change some simple components of the application.

## Quickstart
- install [node.js](http://nodejs.org/)
- clone this repo `git@github.com:wri/gfw-fires-app.git`
- cd into repo folder `> cd gfw-fires-app`
- install dependencies `> npm install`, bower dependencies will automatically install

## Development
<p>TODO</p>

### Project requirements
- IE10+
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
<p>Production for this application is a Heroku LAMP dynamo that is configured to watch for changes to the master branch. Upon merging develop into master or pushing to master, it will build the latest version of the app and re-host automatically.</p>
<p>This automatic update will take a moment because build/dist artifacts are not committed, the dynamo is configured to install node dependencies, install bower dependencies, and compile the app dist for hosting.</p>

#### Versioning
<p>TODO</p>

##### NOTE: DO NOT UNDER ANY CIRCUMSTANCES COMMIT ANY CREDENTIALS OF ANY KIND

#### TODO
- layers
- meta api infowindows
- analysis submit functionality
- timeline
- search widget functionality
- transparency dropdowns
- print
- fix land use counter
- integrated versioning
- cleanout reference www and set code up as heroku-deployable
