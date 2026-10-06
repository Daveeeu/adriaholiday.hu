export type Testimonial = {
  id: number;
  title: string;
  author: string | null;
  body: string;
  excerpt: string;
  publishedAt: string;
  active: boolean;
  legacyId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type TestimonialUpsertInput = {
  title: string;
  author: string;
  body: string;
  publishedAt: string;
  active: boolean;
};

export type TestimonialsListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
};

export type TestimonialsListResponse = {
  items: Testimonial[];
  totalCount: number;
  page: number;
  perPage: number;
};
