import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findOneByUsername(username: string): Promise<User | undefined> {
        return this.usersRepository.findOne({
            where: { username },
            // Explicitly select passwordHash because it's marked as { select: false } in entity
            select: ['id', 'username', 'passwordHash', 'role', 'createdAt', 'updatedAt']
        });
    }

    async create(userData: Partial<User>): Promise<User> {
        const newUser = this.usersRepository.create(userData);
        return this.usersRepository.save(newUser);
    }

    async findOne(id: string): Promise<User> {
        return this.usersRepository.findOneBy({ id });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            relations: ['organization'], // Load organization details if needed
        });
    }
}
