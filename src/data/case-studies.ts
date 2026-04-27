import type { CaseStudy } from '@/types';

export const caseStudies: CaseStudy[] = [
  {
    id: 'estonia',
    country: 'Estonia',
    flag: '🇪🇪',
    image: 'https://images.unsplash.com/photo-1562167172-9eaaf09998c1?w=800&q=80',
    metrics: [
      { label: 'e-Residents', value: '100K+', change: '+340%' },
      { label: 'Digital Gov Services', value: '99%', change: '#1 World' },
      { label: 'GDP Growth Since 2000', value: '180%', change: '3x EU avg' },
    ],
    narrative: 'After gaining independence in 1991, Estonia skipped legacy systems entirely. They built a digital-first government: e-voting, e-tax, e-health, and e-residency. Today, 99% of government services are online. A nation of 1.3M people became a global digital leader through radical modernization.',
    period: '1991 — Present',
  },
  {
    id: 'singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
    metrics: [
      { label: 'Smart Nation Index', value: '#1', change: 'Global' },
      { label: 'GDP Per Capita', value: '$72K', change: '+210% since 2000' },
      { label: 'Digital Adoption', value: '92%', change: 'Highest in APAC' },
    ],
    narrative: 'With zero natural resources, Singapore bet everything on human capital and technology. The Smart Nation initiative connected every aspect of life — transport, health, finance — through data. Their GDP per capita grew from $23K to $72K in two decades, proving that modernization is the ultimate resource.',
    period: '2000 — Present',
  },
  {
    id: 'rwanda',
    country: 'Rwanda',
    flag: '🇷🇼',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
    metrics: [
      { label: 'GDP Growth (avg)', value: '7.2%', change: 'Top 10 Africa' },
      { label: 'Internet Penetration', value: '33%→60%', change: '+82% in 5yr' },
      { label: 'Ease of Business', value: '#38', change: '#1 in E. Africa' },
    ],
    narrative: 'From the devastation of 1994, Rwanda chose technology as its rebuild strategy. They became the first nation with drone delivery of blood, rolled out nationwide fiber optic, and created a cashless public transport system. A landlocked nation became Africa\'s tech hub through sheer will and modernization.',
    period: '2000 — Present',
  },
  {
    id: 'south-korea',
    country: 'South Korea',
    flag: '🇰🇷',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
    metrics: [
      { label: 'R&D Spending (% GDP)', value: '4.8%', change: '#2 World' },
      { label: 'Internet Speed', value: '#1', change: 'Global avg' },
      { label: 'GDP Growth Since 1960', value: '30x', change: 'Miracle on the Han' },
    ],
    narrative: 'In 1960, South Korea\'s GDP was comparable to Ghana. Through relentless investment in education, technology, and export-oriented industrialization, they transformed into the world\'s 10th largest economy. Samsung, LG, Hyundai — all born from a national modernization strategy that put R&D above all else.',
    period: '1960 — Present',
  },
];
