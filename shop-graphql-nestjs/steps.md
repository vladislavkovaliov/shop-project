# Setup tasks: shop-graphql-nestjs

## Prerequisites

- [ ] 1. Install `dotenv` package
      ```bash
      npm install dotenv
      ```

## Environment

- [ ] 2. Create `.env` in `shop-graphql-nestjs/` with:
      ```env
      DATABASE_URL=postgres://postgres:password@localhost:55000/shop
      PORT=3000
      ```

## Main entry

- [ ] 3. Add `import 'dotenv/config'` as the first line in `src/main.ts`

## Database providers

- [ ] 4. Remove unused `PostgresDataSource` constant from `src/providers/database.providers.ts`
- [ ] 5. Ensure factory uses `process.env.DATABASE_URL` (no hardcoded URL)

## User entity

- [ ] 6. Create `src/entities/` directory
- [ ] 7. Create `src/entities/user.entity.ts` with:
      - `@Entity({ name: 'users' })`
      - Fields: `id`, `name`, `email`, `createdAt`
      - `createdAt` mapped to column `created_at` with `default: () => 'now()'`

## Users repository

- [ ] 8. Rewrite `src/controllers/users/users.repository.ts`:
      - Inject `Repository<User>` via `@InjectRepository(User)`
      - Method `findAll(): Promise<User[]>` calling `this.userRepository.find()`

## Users service

- [ ] 9. Rewrite `src/controllers/users/users.service.ts`:
      - Inject `UsersRepository`
      - Method `findAll(): Promise<User[]>` delegating to repository

## Users controller

- [ ] 10. Rewrite `src/controllers/users/users.controller.ts`:
      - `@Controller('users')`
      - Inject `UsersService`
      - `@Get()` → `findAll()` returning service result

## Users module

- [ ] 11. Rewrite `src/controllers/users/users.module.ts`:
      - Import `DatabaseModule` and `TypeOrmModule.forFeature([User])`
      - Declare `UserModule` (exported class name, not `UsersModule`)
      - Provide `UsersService`, `UsersRepository`

## Cleanup

- [ ] 12. Delete `src/controllers/users/dto/` if empty
- [ ] 13. Delete any `*.interface.ts` inside `src/controllers/users/`
- [ ] 14. Remove any stale imports referencing deleted files

## Verify

- [ ] 15. Run `npm run build` — must succeed with no errors
- [ ] 16. Run `npm run start:dev`
- [ ] 17. `GET http://localhost:3000/users` — must return a JSON array of users from `public.users`
