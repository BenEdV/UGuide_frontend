# Bootstrap

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.15.

# Development
## Installation
It is recommended that you use [Node Version Manager](https://github.com/nvm-sh/nvm) to manage the version of node being used. You can install it via
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```
The current version of the frontend uses node version 13 use the following commands to install this and the packages for the project
```sh
nvm install 13
nvm use 13
npm install
```
After this you should install the [Angular CLI](https://github.com/angular/angular-cli) with
```sh
npm install -g @angular/cli
```
to be able to use `ng serve` and other functions.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Production Environment Variables
The environment variables for the production build are defined outside of the git repository. Refer to the [LearnLytics repo](https://gitlab.com/LearnLyticsUU/LearnLytics) for information about setting up Docker Compose for environment variables. The variables are then set in [`Dockerfile`](Dockerfile) and then used to rewrite [`environment.prod.ts.temp`](src/environments/environment.prod.ts.temp) with [envsub](https://www.npmjs.com/package/envsub).

## Adding new environment variables
When adding new environment variables you must first add the line
```
ARG NEW_ENV_VAR
```
to the [`Dockerfile`](Dockerfile), and then it is available to be used in [`environment.prod.ts.temp`](src/environments/environment.prod.ts.temp).
