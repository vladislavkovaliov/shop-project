import type { User, UserWithPurchases } from '@app/models/user.types';
import type { DtoUserResponse, DtoUserWithPurchases } from 'src/lib/types/api';

export function mapUser(raw: DtoUserResponse): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
  };
}

export function mapUsers(raw: DtoUserResponse[]): User[] {
  return raw.map(mapUser);
}

export function mapUserWithPurchases(raw: DtoUserWithPurchases): UserWithPurchases {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    purchases: raw.purchases,
  };
}
