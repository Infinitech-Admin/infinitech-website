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
  message: string;
  page: "home" | "solutions" | "both";
}
