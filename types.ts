
export interface FoodSection {
  id: string;
  title: string;
  country: string;
  image: string;
  didYouKnow?: string;
  history: string[];
  significance: string[];
  variations?: {
    title: string;
    content: string[];
  };
  captions: string[];
}

export interface BookContent {
  title: string;
  subtitle: string;
  author: string;
  authorImage: string;
  introduction: string[];
  sections: FoodSection[];
  aboutBook: string;
  aboutAuthor: string;
}
