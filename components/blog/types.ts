export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnailUrl: string | null; // dedicated thumbnail — used for card/hero thumbnails
  imageUrl: string | null; // first gallery image — fallback if no thumbnail
  imageUrls: string[]; // full gallery — used in the modal
  videoUrl: string | null;
  category: string | null;
  author: string | null;
  publishedAt: string;
}
