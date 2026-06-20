import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
