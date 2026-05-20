# AdminPanelWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

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

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Authentication

The app ships with a mock `AuthService` (demo credentials `admin@dashstack.com` / `admin123`) and a real `AuthRepository` that targets a separate auth backend over JWT plus an httpOnly refresh cookie. Switching between the two is controlled by `src/environments/environment*.ts`:

| Key | Dev (`environment.ts`) | Prod (`environment.production.ts`) |
|-----|------------------------|-------------------------------------|
| `useMockAuth` | `true` | `false` |
| `apiBaseUrl` | `http://localhost:4000/api` | placeholder — set the real backend URL before deploy |

Production builds use `fileReplacements` in `angular.json` to swap the file. The full design — endpoints, interceptors, SSR caveats, security trade-offs — lives in [docs/auth-development.md](docs/auth-development.md).

### E2E credentials

Playwright reads test credentials from environment variables and falls back to the demo account when they are unset (handy while the mock is enabled):

```bash
E2E_USER_EMAIL=...      # see .env.example
E2E_USER_PASSWORD=...
```

Never commit real credentials. Wire these through CI secrets (GitHub Actions / Azure Pipelines).

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
