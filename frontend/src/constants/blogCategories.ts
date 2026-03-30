export const BLOG_CATEGORIES = [
  'National Updates',
  'State News',
  'Press Releases',
  'Movement Stories',
  'Events',
  'Mobilisation Updates',
  'Opinion',
  'Election Updates',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
