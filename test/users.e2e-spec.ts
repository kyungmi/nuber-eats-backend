import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const TEST_USER = {
  email: 'test@email.com',
  password: '12345',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let token: string;

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modules.createNestApplication();
    usersRepository = modules.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createAccount(input: {
                email: "${TEST_USER.email}",
                password: "${TEST_USER.password}",
                role: Owner
              }) {
                ok
                error
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBeNull();
        });
    });
    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createAccount(input: {
                email: "${TEST_USER.email}",
                password: "${TEST_USER.password}",
                role: Owner
              }) {
                ok
                error
              }
            }
      `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input: {
                email: "${TEST_USER.email}",
                password: "${TEST_USER.password}"
              }) {
                ok
                error
                token
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          const { login } = res.body.data;
          expect(login.ok).toBe(true);
          expect(login.error).toBeNull();
          expect(login.token).toEqual(expect.any(String));
          token = login.token;
        });
    });

    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input: {
                email: "${TEST_USER.email}",
                password: "incorrect_password"
              }) {
                ok
                error
                token
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          const { login } = res.body.data;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Wrong password');
          expect(login.token).toBeNull();
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it("should see a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', token)
        .send({
          query: `{
          userProfile(userId: ${userId}) {
            ok
            error
            user {
              id
            }
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const { userProfile } = res.body.data;
          expect(userProfile.ok).toBe(true);
          expect(userProfile.error).toBeNull();
          expect(userProfile.user.id).toBe(userId);
        });
    });
    it('should not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', token)
        .send({
          query: `{
          userProfile(userId: 99999) {
            ok
            error
            user {
              id
            }
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const { userProfile } = res.body.data;
          expect(userProfile.ok).toBe(false);
          expect(userProfile.error).toBe('User Not Found');
          expect(userProfile.user).toBeNull();
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('x-jwt', token)
        .send({
          query: `{
            me {
              email
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const { email } = res.body.data.me;
          expect(email).toBe(TEST_USER.email);
        });
    });

    it('should not allow logged out user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
            me {
              email
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const [error] = res.body.errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  describe('editProfile', () => {
    it('should change email', async () => {
      const NEW_EMAIL = 'test_new@email.com';
      await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', token)
        .send({
          query: `
            mutation {
              editProfile(input: {
                email: "${NEW_EMAIL}"
              }) {
                ok
                error
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.editProfile).toEqual({ ok: true, error: null });
        });
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('x-jwt', token)
        .send({
          query: `{
            me {
              email
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const { email } = res.body.data.me;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });
  it.todo('verifyEmail');
});
