# BarCode

A real-time barcode scanner web application built with Angular 20.2 that uses your device's camera to detect and read barcodes.

## Live Demo

🔗 **[https://tmac12.github.io/barCode/](https://tmac12.github.io/barCode/)**

> **Note:** Camera access requires HTTPS or localhost. The GitHub Pages deployment uses HTTPS, so the camera will work properly.

## Features

- Real-time barcode scanning using device camera
- Support for multiple barcode formats via Barcode Detector API
- Responsive design with video preview
- Error handling for camera permissions and browser compatibility
- Built with Angular 20.2 using zoneless change detection and signals

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
