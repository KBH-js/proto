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

  resume: {
    /** Served from public/ — replace public/resume.pdf to update the resume */
    pdfUrl: '/resume.pdf',
  },
} as const;

export const isDevelopment = import.meta.env.DEV;
