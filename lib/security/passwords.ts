import argon2 from 'argon2';

const PASSWORD_MEMORY = Number(process.env.ARGON2_MEMORY_COST ?? 19456);
const PASSWORD_TIME = Number(process.env.ARGON2_TIME_COST ?? 2);

export async function hashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: PASSWORD_MEMORY,
    timeCost: PASSWORD_TIME,
    parallelism: 1
  });
}

export async function verifyPassword(password: string, hash: string) {
  return argon2.verify(hash, password, { type: argon2.argon2id });
}
