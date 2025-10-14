export type Inquiry = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type Plans = {
  [key: string]: {
    [category: string]: Service[];
  };
};


export type Service = {
  name: string;
  description: string | string[]; // support string OR array
  price: number;
  monthly?: number;
  isSelected?: boolean;
};



