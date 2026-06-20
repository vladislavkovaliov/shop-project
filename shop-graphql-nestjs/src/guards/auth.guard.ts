import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: any;

    if (context.getType().toString() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      request = gqlCtx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const userID = await this.authService.validateSession(token);
    if (!userID) {
      throw new UnauthorizedException();
    }

    request.userID = userID;
    return true;
  }

  private extractToken(request: any): string | null {
    const cookie = request.cookies?.['better-auth.session_token'];
    if (cookie) return cookie;

    const authHeader = request.headers?.['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return null;
  }
}
