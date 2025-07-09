# SMO Vidya Authentication Service

ระบบยืนยันตัวตนสำหรับบริการภายในสโมสรนิสิตคณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย

This project provides a secure authentication service for the Science Student's Union (SMO Sci CU) at Chulalongkorn University. It is sit between the user authentication and the student data management, allowing users to log in with their Chulalongkorn University accounts and manage their student information and rights for various applications used by the union to access their data securely.

## User Guide
This project is primarily intended for developers and system administrators who will be working with the authentication service. For end-users, the authentication process is handled automatically through the applications that integrate with this service and does not require direct interaction with this codebase.

## Setup
1. Clone the repository
2. Install [Bun](https://bun.sh/) if you haven't already
   ```bash
   curl https://bun.sh/install | bash
   ```

   Make sure to add Bun to your PATH as instructed by the installer.
3. Install dependencies
   ```bash
   bun install
   ```
4. Duplicate `example.env.vars` to `.env.vars` and fill in the required environment variables.
5. Migrate the database
    ```bash
    bun run db:migrate:dev
    ```
6. Start the development server
    ```bash
    bun run dev
    ```

## Development

This project is separated into several parts:
- **Workers**: The main authentication service running on Cloudflare Workers using D1 database, KV storage, and BetterAuth for authentication management.
- **Frontend**: The user interface for the authentication service, for user login, registration, and data management.

### Running the Development Server
To start the development server, run:
```bash
bun run dev
```

### Testing with OAuth Proxy locally

We use [BetterAuth OAuth Proxy](https://www.better-auth.com/docs/plugins/oauth-proxy) to test the OAuth flow locally. You can just start `dev` server as usual and it just works.

### Working with the Database (not `auth.schema.ts`)

After making changes to the database schema, you can generate the migration files by running:
```bash
bun run db:generate
```

Then apply the migrations to your local database with:
```bash
bun run db:migrate:dev
```

If you want to apply the migrations to the production database, use:
```bash
bun run db:migrate:prod
```

### Updating the Authentication configuration
To update the authentication configuration, you can modify the `workers/auth/index.ts` file. This file contains the configuration for BetterAuth, including the authentication providers, user model, and other settings.

After making changes, you can generate the authentication schema by running:
```bash
bun run auth:update
```

This will automatically update the `workers/db/auth.schema.ts` file with the latest authentication schema. You can then select and apply any conflicts that arise during the update process by the interactive prompt.

After updating the schema and create a migration file, you can apply the migrations to your local database with:
```bash
bun run db:migrate:dev
```

If you want to apply the migrations to the production database, use:
```bash
bun run db:migrate:prod
```

This normally should be done after you have deployed the changes to the production environment.

## Developer Guide

This project is designed for apps that within the supervision of the Science Student's Union (SMO Sci CU) at Chulalongkorn University. It provides a secure and flexible authentication and student's data management system that can be integrated into various applications used by the union.

### API reference

For detailed API documentation, please refer to the [API Reference](https://auth.smovidya-chula.workers.dev/api/auth/reference) page. This documentation provides information on available endpoints, request and response formats, and examples of how to use the API.

### Authentication and Authorization

The authentication uses Google OAuth to allow users to log in with their Chulalongkorn University accounts then collects other information such as name, faculty, department, and program from student directly.

Getting data from University's database is not available yet, so the user must fill in their information manually. The data will be stored in the D1 database and can be accessed through the API.

This service also supports OAuth 2.0 and OpenID Connect (OIDC) protocols, allowing other applications to authenticate users using this service. You can access the OpenID Connect configuration at the following URL:
```
http://auth.smovidya-chula.workers.dev/api/auth/.well-known/openid-configuration
```

## Features
- User authentication using Google OAuth.
- Student data management, including name, faculty, department, and program.
- User impersonation for testing and administrative purposes.
- Support for OAuth 2.0 and OpenID Connect (OIDC) protocols.
- Secure session management with JWT tokens and JWKS (JSON Web Key Set) endpoint.

## Tech stack
- [BetterAuth](https://www.better-auth.com/) for authentication, OIDC, OAuth provider, JWKS, and more.
- [Drizzle ORM](https://orm.drizzle.team/) for database management.
- [Cloudflare Workers](https://workers.cloudflare.com/) for serverless functions.
- [Cloudflare D1](https://developers.cloudflare.com/d1/) for the database.
- [React Router](https://reactrouter.com/) for frontend routing.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear messages.
4. Push your changes to your forked repository.
5. Create a pull request to this main repository!

You can also join our [Discord server](https://discord.gg/bcy2FnXkjs) for discussions and help anytime! And we are more than happy if you can join our ฝ่ายพัฒนาระบบพัฒนาสารสนเทศ, just drop us a message in Discord~

Wait! Don't forget you can always help us in other ways, such as:
- Reporting bugs or issues (bug catchers are always welcome!).
- Suggesting new features or improvements.
- Give feedback on design and usability.
- Helping with documentation (technical writers are always welcome!).
- Testing the application and providing feedback on performance and usability.
- Designing and implementing new features (UI/UX designers are surely short here).

Join our Discord server to discuss how you can contribute!

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Security
If you find any security vulnerabilities, please report them to us in private via email at [smovidya.it.team@gmail.com](mailto:smovidya.it.team@gmail.com) or via our [Discord server](https://discord.gg/bcy2FnXkjs). We will work with you to resolve the issue as quickly as possible.
