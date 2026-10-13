# Genomia Forms

React and Vite application for GenomIA. Pages live in `src/pages/`, sections in `src/components/<section>/` with their styles colocated, and shared UI in `src/components/ui/`.

## Hero logo

`src/components/hero/Navbar.tsx` renders `src/assets/genomia.png` in the nav. `HeroSection.css` gives it `logoSpin`: a slow 3D turn around its vertical axis, paused while offscreen and disabled under `prefers-reduced-motion`.

## Development

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

`npm run dev` also runs the Netlify function (`netlify/functions/postular.ts`) and loads `.env` into it, so the "Postula" flow can be tested end to end at http://localhost:5173/#postula without the Netlify CLI. Copy `.env.example` to `.env` and fill in the four variables first; Google sign-in also needs `http://localhost:5173` in the OAuth client's authorized JavaScript origins. Production still runs the function on Netlify.

## Typecheck and production build

```sh
npm run typecheck
npm run build
```

## Preview the production build

```sh
npm run preview
```

