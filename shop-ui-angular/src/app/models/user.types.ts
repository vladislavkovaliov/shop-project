export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UserWithPurchases {
  id: number;
  name: string;
  email: string;
  purchases: number;
}
