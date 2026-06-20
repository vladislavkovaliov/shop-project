import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../../auth/auth.module';
import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  providers: [UserRepository, UserService, UsersResolver],
})
export class UserModule {}
