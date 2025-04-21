export type Inquiry = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type Plans = {
  [key: string]: Service[];
};

export type Service = {
  name: string;
  description: string;
  price: number;
  isSelected?: boolean;
};