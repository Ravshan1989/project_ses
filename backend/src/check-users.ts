import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { User } from "./modules/users/entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepo: Repository<User> = app.get(getRepositoryToken(User));

    const users = await userRepo.find({ relations: ["organization", "department"] });
    console.log("--- DB USERS ---");
    users.forEach(u => {
        console.log(`ID: ${u.id}, Username: ${u.username}, Role: ${u.role}, Dept: ${u.department?.name}`);
    });
    console.log("-----------------");

    await app.close();
}
bootstrap();
