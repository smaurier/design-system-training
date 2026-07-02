import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Design System & UI/UX',
  description: 'Formation Design System : CSS moderne, Tailwind, Radix, shadcn/ui, design tokens, motion, Storybook, accessibilité RGAA, Tamagui cross-platform (débutant → expert)',
  lang: 'fr-FR',
  srcDir: '.',

  // Cohérent avec les autres cours refonte : liens internes non bloquants
  // (labs en cours de renumérotation) ; l'intégrité prereq/next des modules
  // est enforcée séparément par gate-course.ps1.
  ignoreDeadLinks: true,

  // Refonte v1 : le cours vit dans `modules/` + `labs/`. L'ancien `cours/` (v0,
  // conservé comme archive/source d'audit) est exclu du build.
  srcExclude: ['cours/**'],

  // Docs statiques : neutralise l'interpolation Vue `{{ }}` (délimiteurs improbables)
  // pour que les moustaches en prose et les `${{ }}` (GitHub Actions) ne cassent pas le SSR.
  vue: {
    template: {
      compilerOptions: {
        delimiters: ['(%(', ')%)'],
      },
    },
  },

  themeConfig: {
    nav: [
      { text: 'Modules', link: '/modules/01-css-fondamentaux' },
      { text: 'Labs', link: '/labs/lab-01-css-fondamentaux/README' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Modules',
          items: [
            { text: '01 — CSS fondamentaux', link: '/modules/01-css-fondamentaux' },
            { text: '02 — Tailwind CSS', link: '/modules/02-tailwind-css' },
            { text: '03 — Radix UI (headless)', link: '/modules/03-radix-ui' },
            { text: '04 — shadcn/ui', link: '/modules/04-shadcn-ui' },
            { text: '05 — Design tokens', link: '/modules/05-design-tokens' },
            { text: '06 — Animations & Motion', link: '/modules/06-framer-motion' },
            { text: '07 — Storybook', link: '/modules/07-storybook' },
            { text: '08 — Accessibilité RGAA', link: '/modules/08-accessibilite' },
            { text: '09 — Tamagui (cross-platform)', link: '/modules/09-tamagui' },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
      label: 'Sur cette page',
    },

    docFooter: {
      prev: 'Précédent',
      next: 'Suivant',
    },
  },
})
