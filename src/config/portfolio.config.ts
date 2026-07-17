export const portfolioConfig = {
  owner: {
    name: 'Byunghoon Kang',
    title: 'Frontend Engineer',
    email: 'byunghoon.kang.job@gmail.com',
  },

  links: {
    github: 'https://github.com/KBH-js',
    linkedin: 'https://www.linkedin.com/in/byunghoon-kang-293369302/',
    email: 'mailto:byunghoon.kang.job@gmail.com',
  },

  /** Source repo for this portfolio — deep-linked from the About "evidence" table */
  repo: 'https://github.com/KBH-js/proto',

  /** Live deployments this desktop actually loads at runtime (About links to these) */
  deployments: {
    host: 'https://proto-six-iota.vercel.app',
    calculator: 'https://remote-calculator-sage.vercel.app',
    notes: 'https://remote-notes.vercel.app',
    network: 'https://remote-network.vercel.app',
    compute: 'https://remote-compute.vercel.app',
  },

  resume: {
    /** Served from public/ — replace public/resume.pdf to update the resume */
    pdfUrl: '/resume.pdf',
  },
} as const;

export const isDevelopment = import.meta.env.DEV;
