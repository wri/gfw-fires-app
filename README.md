GFW-Fires
---
Please read this before beginning development to learn how to get started and how to change some simple components of the application.

## Quickstart
- install [node.js](http://nodejs.org/)
- clone this repo `git clone git@github.com:wri/gfw-fires-app.git`
- cd into repo folder `> cd gfw-fires-app`
- install dependencies `> npm install`
- start serving and build `> npm run start`
- visit `localhost:3000/home`

## Development
TODO


### Project requirements
- IE10+
### Architecture overview
### Npm scripts
### Build Process

## Configurations

### Language
This application is intended to be available in both english and indonesian, all text that should be translated should be in the correct locals file found in the i18n folder.

### Environment Variables
TODO

## Git Workflow

#### Main Development
Developers should aim to stay close to the latest version of the development branch. Small fixes and tweaks are appropriate as small commits that are made directly to the develop branch.
Anything sizeable should be a focused (affecting only relevant files to avoid conflicts) and well named feature branch that is properly merged back and deleted upon completion.

#### Continuous Integration off Master
Production for this application is a Heroku LAMP dynamo that is configured to watch for changes to the master branch. Upon merging develop into master or pushing to master, it will build the latest version of the app and re-host automatically.
This automatic update will take a moment because build/dist artifacts are not committed, the dynamo is configured to install node dependencies, install bower dependencies, and compile the app dist for hosting.

#### Versioning
TODO

### App Pages
- [Map](http://localhost:3000/map/) - `http://localhost:3000/map/`
- [Report](http://localhost:3000/report) - `http://localhost:3000/report`

##### NOTE: DO NOT UNDER ANY CIRCUMSTANCES COMMIT ANY CREDENTIALS OF ANY KIND

#### TODO
- fix inconsistent carousel loading (Slick not a function)
- layers
- meta api infowindows
- timeline
- transparency dropdowns
- print
- fix land use counter
- honeypots - analysis, subscription, story submit
- google analytics events
- .htaccess redirects (/ -> /en/home, /en/ -> /en/home)
- verify and delete unused remote branches (KarlaRenschler-patch-1, Lucas, popup-enhance)
- set code up as heroku-deployable
- update media query variables from mobile mobile-small to tablet and mobile (bojan knows about this)
- analysis submit functionality

- indonesian translation plan:
  - use node and transifex to translate i18n/en/locals.js strings and save them to i18n/id/locals.js
  - to keep things simple, it's recommended to make this a manual script that is only run on version update deployments when text has been added

- completed:
  - search widget functionality
  - integrated versioning
  - cleanout reference www
  - percentage in peatland fires on home carousel
  - sourcemaps for styl & js
