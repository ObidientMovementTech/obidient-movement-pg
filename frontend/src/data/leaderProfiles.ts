/**
 * Centralized leader profile data — single source of truth.
 * Used by: DashboardHome, LeadersPage, PeterObiPage, AboutPage, LeadershipSpotlight
 */

export interface LeaderProfile {
  slug: string;
  name: string;
  title: string;
  tagline: string;
  designation: string;
  image: string;
  shortBio: string;
  fullBio: string[];
  quotes: { text: string; context?: string }[];
  achievements: { label: string; value: string }[];
  policyPillars: { title: string; description: string; icon?: string }[];
}

export const PETER_OBI: LeaderProfile = {
  slug: 'peter-obi',
  name: 'Peter Obi',
  title: 'Movement Leader',
  tagline: 'Discipline. Integrity. Service.',
  designation: 'Founder',
  image: '/Peter-Obi.webp',
  shortBio:
    'Peter Gregory Obi is a Nigerian businessman and politician who served as the Governor of Anambra State from 2006 to 2014. He was the Vice Presidential candidate of the PDP in 2019 and the Presidential candidate of the Labour Party in the 2023 general elections. He is the Founder of the Obidient Movement.',
  fullBio: [
    'Peter Gregory Obi is a Nigerian businessman, investor, and politician who has dedicated decades of his life to public service and national development. Born on July 19, 1961, in Onitsha, Anambra State, he rose from humble beginnings to become one of Nigeria\'s most recognized advocates for accountable governance.',
    'As Governor of Anambra State from 2006 to 2014, Obi earned a reputation for fiscal discipline and prudent management of public resources. Under his leadership, Anambra\'s internally generated revenue grew significantly, the state\'s debt was reduced dramatically, and critical investments were made in education, healthcare, and infrastructure. He left a verified surplus in the treasury — a rare feat in Nigerian governance.',
    'In 2023, Obi ran for President under the Labour Party, galvanizing a historic youth-led movement that transcended ethnic, religious, and regional lines. He received over 6.1 million votes, winning in Lagos and several other states — an unprecedented achievement for a third-party candidate in Nigerian politics.',
    'Today, as the Founder of the Obidient Movement, Obi continues to champion the cause of good governance, production over consumption, and citizen empowerment. The movement he inspired has grown into the largest verified civic membership platform in Nigeria, organized across all 36 states and the FCT.',
  ],
  quotes: [
    { text: 'Leadership is not about the next election, it\'s about the next generation.', context: 'On governance philosophy' },
    { text: 'We must move from consumption to production. That is the only way to build a sustainable economy.', context: 'On economic policy' },
    { text: 'I am not promising you heaven. I am promising you that I will do my best.', context: '2023 Presidential Campaign' },
    { text: 'The resources of Nigeria belong to Nigerians, not to a few individuals.', context: 'On accountability' },
    { text: 'Education is the greatest equalizer. When you educate a child, you transform a nation.', context: 'On education' },
    { text: 'Leadership is service, and service must be measured by the lives it improves.', context: 'On public service' },
  ],
  achievements: [
    { label: 'Governor of Anambra', value: '2006–2014' },
    { label: 'Presidential Votes', value: '6.1M+' },
    { label: 'States Won in 2023', value: '2' },
    { label: 'Movement Members', value: '25,000+' },
    { label: 'States Organized', value: '36' },
    { label: 'Treasury Surplus Left', value: '✓' },
  ],
  policyPillars: [
    {
      title: 'Production Over Consumption',
      description: 'Transforming Nigeria from an import-dependent economy to a production powerhouse through manufacturing, agriculture, and value-added industries.',
    },
    {
      title: 'Education & Human Capital',
      description: 'Massive investment in education at all levels — from universal basic education to technical/vocational training and world-class universities.',
    },
    {
      title: 'Security & Rule of Law',
      description: 'Restructuring security architecture, investing in modern policing, and ensuring the rule of law applies equally to every Nigerian.',
    },
    {
      title: 'Technology & Innovation',
      description: 'Positioning Nigeria as Africa\'s technology hub through digital infrastructure, startup ecosystem support, and e-governance.',
    },
  ],
};

/** All featured leader profiles */
export const FEATURED_LEADERS: LeaderProfile[] = [PETER_OBI];

/** Get a leader profile by slug */
export const getLeaderBySlug = (slug: string): LeaderProfile | undefined =>
  FEATURED_LEADERS.find((l) => l.slug === slug);
