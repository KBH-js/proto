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
    externalUrl: 'https://drive.google.com/file/d/1BBgtA6_ieEF_RAfXL0rYhCek4xepqWQL/view?usp=sharing',
  },
} as const;

export const isDevelopment = import.meta.env.DEV;
