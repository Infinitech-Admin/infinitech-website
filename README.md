# Next.js & HeroUI Template

This is a template for creating applications using Next.js 14 (app directory) and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/heroui/next-app-template)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## How to Use

### Use the template with create-next-app

To create a new project based on this template using `create-next-app`, run the following command:

```bash
npx create-next-app -e https://github.com/heroui-inc/next-app-template
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

### Admin RBAC configuration

Superadmin signs in with the password configured as server-side `ADMIN_PASSWORD` in the Laravel environment; no Superadmin email or user record is needed. Restricted personnel use their personnel email address and generated password. Public registration is unavailable. Configure server-only `LARAVEL_API_URL` and `LARAVEL_SERVICE_TOKEN` for the Next.js runtime. `LARAVEL_SERVICE_TOKEN` must match the Laravel backend value and must not use a `NEXT_PUBLIC_` prefix. Apply backend migrations before use. The authenticated user’s directory and action permissions are checked server-side on each protected page/API request. Superadmins can delegate individual Admin-directory actions; delegated access managers can only assign actions they themselves hold. Initial/reissued personnel passwords are shown once in User Access Management for secure manual delivery.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).
