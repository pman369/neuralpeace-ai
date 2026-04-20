import { Module, Category, ExpertiseLevel } from './types';

export const MODULES: Module[] = [
  {
    id: '1',
    title: 'Prefrontal Cortex Synthesis',
    description: 'A comprehensive look at executive function regulation through the lens of modern connectivity mapping.',
    category: 'Neuroanatomy',
    expertise: 'Practitioner',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAX-I9GoYGWxxH5u-WDZfkverd7sBcrdRFw5SMIFVbcbFjJNU6ua1h3TXFaDAQ7KOkPd5gMaSdrTXZbb_Wv-GMKqzMGyQAuSmyN8UaWkFhCxrc4hi031Ct4QCzEPQkka9y-DRtCeW86toX1FZeL27VW6ZP_QytMmad3H9v-G2oZw3D69D8H6IquU1GsjCkmjVV_oks1RS6HK0oGvqTHSnVcxyHt493m93gc_Tpc70-O1tXdMV4NPvgELFxglDL6b16HCtNVa25FGVo',
    readTime: '12 mins read',
  },
  {
    id: '2',
    title: 'Bayesian Inference Models',
    description: 'How probabilistic modeling predicts sensory perception and motor control in complex environmental states.',
    category: 'Computational',
    expertise: 'Expert',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD01a97ejCpwS8UU5BQogY28YZ8ojgntR7e7P94-W61ctJqMzy9KBonBo038wSniM8IMx8uFeiBTN2oMaQEwnc63oLEaZ-bxt6yy2Cknbsu-oriQxhSfMmoXpDvECXa4r4zhW5j08ABoXwCt_RMnDnSEtyA35RAQQC4RPEONQ-HBmStXl-a-yZX_nNCopEI_JrFkRMiD-pY82ElAf6YcILfGjkjZLwRtHmIAKcP4rp23xjG8ZKd0k3cOkvL8jQx0oDJLOfQXWSynGo',
    readTime: '25 mins read',
  },
  {
    id: '3',
    title: 'fMRI Protocol Basics',
    description: 'A beginner-friendly guide to experimental design and initial data cleaning for functional neuroimaging.',
    category: 'Methods',
    expertise: 'Novice',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARoQzCDMjoEGixktInclp5bk4NuggHUedO8vZS3HPTmZOFzVDGPknGCQWzBWW_up8COPyZrMxr7UsXyX0gwflo--HziTNm-ObloYL6RGIfz04bAJ68vLnCFWzwGU_E5zTS9o73FydYZ1OZQUImMICqt2GBKN3GKWcZRpp1tTOV8WNC3ftXY-svo0sqzQCATJbYa-PnkKuWH_RG7rX1gKynuIbRTZhnCC78lupbAk6nGE5Xm-ligWkRJcR1fyVuX9jrFVpz-BD2Ygs',
    readTime: '8 mins read',
  },
  {
    id: '4',
    title: 'Cognitive Load Theory',
    description: 'Analyzing the relationship between working memory capacity and instructional design efficiency.',
    category: 'Psychology',
    expertise: 'Practitioner',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGw8eSfdM6ig4cdutozUjMmzYNJ27utbPankUvID8mdsSIEzxHDIaXsOl8xsSvj-nFCAS-O5b_sAfOqDeUcVo68XD6fuuxEcq8islQntALhFi-d3HRmNaxxojuYgKyyZqjKLyYQSo-G2Cd-Uv2v2qjjGwRBPKbzRBv7Cn7MaGcUeiusfRuKeiErYw4qrA8zV-21oTuNn8a8FDyYKq_cIZ3ERQs3uYbMOjkusYV8lPNkuKVyvLZ1bzRnuDRSHKGcZE3ZH2tjngTtCU',
    readTime: '15 mins read',
  },
  {
    id: '5',
    title: 'Hippocampal Neurogenesis',
    description: 'Advanced study on the biological mechanisms of adult neuron formation and memory consolidation.',
    category: 'Neuroanatomy',
    expertise: 'Expert',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlD65-tFVnddScEFV2TrMxN0yR3iPc9KAm14Mh-ZdkHyUy_SQlBcxky4QzSnfPj3lsPYvseuRLsgw9WH5uADRthjYP57km-MUFYBwKr6KgHnI5YV8ZXjXv-ZtZMX1Q6mYHZ5q3R4GhqZewy3SYFFJwiVGcNFCz40Zb3H7KTSiXWS1sZVWmLKYmt7AnFr82PWvdpUxJd8MXgy368clSUn43wtnKJuj3dZUJKbgyzYlunkJkinwRH2TAuNQROZonxDqS0_pdpsIg_V4',
    readTime: '40 mins read',
  },
  {
    id: '6',
    title: 'Introduction to Neurofeedback',
    description: 'Understanding the basics of EEG-driven therapeutic interventions for anxiety and sleep regulation.',
    category: 'Therapeutics',
    expertise: 'Novice',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK7YN18eAeLEdwxTZ-J8Zg1DhStYVpseTRfuLol3HLZrUChzoPbMc7WZ3mvDkHnh0TULgt6ZfOm9Cx7boPftP58TFyXE4zyYoP0q4TyjdFUs2cZMIEYlG_cdU7Sh4g_g2KvoKP9tgZmJnWI7ol2hTHl44iSKWVdOC6Y4-rPf_wwWvyYk9zfdIc1PQcUTpamtsuDf5cJUf3WWrTe8e3X9s1a59IbT9SphdaszUi6tyhzQ9TOTVNTmD5x51sGPDq7-eK1hwMKLsEY5w',
    readTime: '10 mins read',
  },
];

export const CATEGORIES: Category[] = [
  'All Modules',
  'Neuroanatomy',
  'Methods',
  'Computational',
  'Psychology',
  'Therapeutics',
];

export const EXPERTISE_LEVELS: { level: ExpertiseLevel; icon: string; description: string }[] = [
  { level: 'Auto', icon: 'magic_button', description: 'Auto-detect depth' },
  { level: 'Novice', icon: 'child_care', description: 'Adjust AI depth' },
  { level: 'Practitioner', icon: 'psychology', description: 'Adjust AI depth' },
  { level: 'Expert', icon: 'biotech', description: 'Adjust AI depth' },
  { level: 'Scholar', icon: 'menu_book', description: 'Adjust AI depth' },
];
