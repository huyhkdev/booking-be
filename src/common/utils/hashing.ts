import bcrypt from 'bcryptjs';

class Hashing {
    async hashPassword(plainTextPassword: string): Promise<string> {
        return await bcrypt.hash(plainTextPassword, 10);
    }

    async comparePassword(plainTextPassword: string, hashPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainTextPassword, hashPassword);
    }
}

export default new Hashing();
