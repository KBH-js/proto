export const portfolioConfig = {
  owner: {
    name: 'Byunghoon Kang',
    title: 'Frontend Engineer',
    email: 'byunghoon.kang.job@gmail.com',
  },

  links: {
    github: 'https://github.com/KBH-js',
    linkedin: 'https://www.linkedin.com/in/byunghoon-kang-293369302/',
  },

  /** Source repo for this portfolio — deep-linked from the About "evidence" table */
  repo: 'https://github.com/KBH-js/proto',

  /**
   * Host deployment (About links to it). Remote deployment links are derived
   * from the app registry (remotes.manifest.json entryUrl), not listed here —
   * adding a remote must not require touching this config.
   */
  deployments: {
    host: 'https://proto-six-iota.vercel.app',
  },

  resume: {
    /** Served from public/ — replace public/resume.pdf to update the resume */
    pdfUrl: '/resume.pdf',
  },
} as const;

export const isDevelopment = import.meta.env.DEV;
