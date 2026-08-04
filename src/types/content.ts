export interface PostFrontmatter {
  title: string;
  excerpt: string;
  date: string;
  instrument: string;
  scenario: {
    bullish: string;
    bearish: string;
    invalidation: string;
  };
  draft?: boolean;
}

export interface PostSummary extends PostFrontmatter {
  slug: string;
  readMinutes: number;
}

export interface Post extends PostSummary {
  content: string;
}
