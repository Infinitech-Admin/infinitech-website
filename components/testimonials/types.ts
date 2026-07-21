export interface Testimonial {
  id: number;
  name: string;
  position: string | null;
  company: string | null;
  message: string;
  image_url: string | null;
  page: "home" | "solutions" | "both";
  is_active: boolean;
  sort_order: number;
}

export interface TestimonialFormData {
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  page:
    | "website-development"
    | "marketing-research"
    | "seo"
    | "social-media-management"
    | "video-photography"
    | "graphic-design"
    | "tiktok-shop-open"
    | "juantap";
}
