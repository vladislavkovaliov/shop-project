import type { User, UserWithPurchases } from '@app/models/user.types';
import type { DtoUserResponse, DtoUserWithTotalSpent } from 'src/lib/types/api';

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

export function mapUserWithPurchases(raw: DtoUserWithTotalSpent): UserWithPurchases {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    totalSpent: raw.totalSpent,
  };
}
