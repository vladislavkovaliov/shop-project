import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Session } from './session.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async validateSession(token: string): Promise<string | null> {
    const idx = token.indexOf('.');
    const sessionId = idx !== -1 ? token.slice(0, idx) : token;

    const session = await this.sessionRepository.findOne({
      where: { token: sessionId, expiresAt: MoreThan(new Date()) },
    });

    return session?.userId ?? null;
  }
}
