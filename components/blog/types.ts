export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string | null; // first image — used for card/hero thumbnails
  imageUrls: string[]; // full gallery — used in the modal
  videoUrl: string | null;
  category: string | null;
  author: string | null;
  publishedAt: string;
}
