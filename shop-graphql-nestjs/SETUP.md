# Настройка shop-graphql-nestjs

Подключение к БД (TypeORM) и endpoint `GET /users`.

---

## Предварительно: установить пакет dotenv

```bash
npm install dotenv
```

---

## Шаг 1. Создать `.env` в корне `shop-graphql-nestjs/`

**Файл:** `shop-graphql-nestjs/.env`

```env
DATABASE_URL=postgres://postgres:password@localhost:55000/shop
PORT=3000
```

---

## Шаг 2. Добавить `import 'dotenv/config'` в `main.ts`

**Файл:** `src/main.ts`

Добавить самой первой строкой:

```ts
import 'dotenv/config';
```

Итог:

```ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

---

## Шаг 3. Почистить `database.providers.ts`

**Файл:** `src/providers/database.providers.ts`

Удалить верхнюю неиспользуемую константу `PostgresDataSource` (хардкод). Оставить только массив `databaseProviders`. В фабрике уже используется `process.env.DATABASE_URL`.

Итог:

```ts
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: false,
        entities: [__dirname + '/../**/*.entity{.js,.ts}'],
      });

      return dataSource.initialize();
    },
  },
];
```

`database.module.ts` менять **не нужно**.

---

## Шаг 4. Создать User Entity

**Файл:** `src/entities/user.entity.ts` (папку `src/entities/` нужно создать)

```ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}
```

---

## Шаг 5. Переписать `users.repository.ts`

**Файл:** `src/controllers/users/users.repository.ts`

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

---

## Шаг 6. Переписать `users.service.ts`

**Файл:** `src/controllers/users/users.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }
}
```

---

## Шаг 7. Починить `users.controller.ts`

**Файл:** `src/controllers/users/users.controller.ts`

```ts
import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}
```

---

## Шаг 8. Починить `users.module.ts`

**Файл:** `src/controllers/users/users.module.ts`

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../providers/database.module';
import { User } from '../../entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UserModule {}
```

---

## Шаг 9. Удалить мусор

Удалить файлы (если существуют):
- `src/controllers/users/dto/` (пустая папка)
- любые `*.interface.ts` внутри `src/controllers/users/`

Проверить, что нет мусорных импортов.

---

## Шаг 10. Проверить сборку

```bash
npm run build
```

Должно собраться без ошибок.

---

## Шаг 11. Запустить и проверить

```bash
npm run start:dev
```

`GET http://localhost:3000/users` → вернёт массив пользователей из `public.users`.

---

## Итоговая структура изменённых файлов

```
shop-graphql-nestjs/
├── .env                             # новый
├── src/
│   ├── main.ts                      # + import 'dotenv/config'
│   ├── entities/
│   │   └── user.entity.ts           # новый
│   ├── providers/
│   │   ├── database.module.ts       # без изменений
│   │   └── database.providers.ts    # удалён хардкод
│   ├── controllers/
│   │   └── users/
│   │       ├── users.module.ts      # исправлен
│   │       ├── users.controller.ts  # исправлен
│   │       ├── users.service.ts     # переписан
│   │       └── users.repository.ts  # переписан
│   └── app.module.ts                # без изменений
```
