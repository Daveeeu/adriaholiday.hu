export type Customer = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  postalCode: string | null;
  city: string | null;
  address: string | null;
  referralCode: string | null;
  registrationCouponValue: number | null;
  note: string | null;
  bookingsCount?: number;
  registeredAt: string | null;
  firstLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerUpsertInput = {
  email: string;
  name: string;
  phone: string;
  postalCode: string;
  city: string;
  address: string;
  referralCode: string;
  note: string;
};

export type CustomersListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
};

export type CustomersListResponse = {
  items: Customer[];
  totalCount: number;
  page: number;
  perPage: number;
};
