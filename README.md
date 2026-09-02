# International Computer Exchange Website

[![Security checks](https://github.com/MDCran/ice-website/actions/workflows/security-checks.yml/badge.svg)](https://github.com/MDCran/ice-website/actions/workflows/security-checks.yml) [![CodeQL](https://github.com/MDCran/ice-website/actions/workflows/codeql.yml/badge.svg)](https://github.com/MDCran/ice-website/actions/workflows/codeql.yml)

The public website, solutions catalog, guided solution finder, and live CMS for International Computer Exchange.

## Website preview

Screenshots below are from the live sandbox site at [sandbox.icesales.com](https://sandbox.icesales.com/).

### Homepage

![International Computer Exchange homepage with enterprise technology messaging](docs/screenshots/homepage.png)

### Solutions catalog

![CMS-driven ICE solutions catalog with industry and platform filters](docs/screenshots/solutions-catalog.png)

### AS400 and IBM i managed services

![AS400 hosting and IBM i managed services page](docs/screenshots/solution-detail-as400.png)

### Guided solution finder

![ICE solution finder recommending AS400 services for an IBM i modernization scenario](docs/screenshots/solution-finder.png)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Public routes live under `src/app/(public)`. The page auto-updates as you edit the source files.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
