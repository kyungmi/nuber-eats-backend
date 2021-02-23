import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

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
  let verificationRepostory: Repository<Verification>;
  let token: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('X-JWT', token).send({ query });

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modules.createNestApplication();
    usersRepository = modules.get<Repository<User>>(getRepositoryToken(User));
    verificationRepostory = modules.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return publicTest(`
        mutation {
          createAccount(input: {
            email: "${TEST_USER.email}",
            password: "${TEST_USER.password}",
            role: Owner
          }) {
            ok
            error
          }
        }`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBeNull();
        });
    });
    it('should fail if account already exists', () => {
      return publicTest(`
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
      `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return publicTest(`
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
        `)
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
      return publicTest(`
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
        `)
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
      return privateTest(`{
        userProfile(userId: ${userId}) {
          ok
          error
          user {
            id
          }
        }
      }`)
        .expect(200)
        .expect((res) => {
          const { userProfile } = res.body.data;
          expect(userProfile.ok).toBe(true);
          expect(userProfile.error).toBeNull();
          expect(userProfile.user.id).toBe(userId);
        });
    });
    it('should not find a profile', () => {
      return privateTest(`{
          userProfile(userId: 99999) {
            ok
            error
            user {
              id
            }
          }
        }`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.userProfile).toEqual({
            ok: false,
            error: 'User Not Found',
            user: null,
          });
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return privateTest(`{
        me {
          email
        }
      }`)
        .expect(200)
        .expect((res) => {
          const { email } = res.body.data.me;
          expect(email).toBe(TEST_USER.email);
        });
    });

    it('should not allow logged out user', () => {
      return publicTest(`{
          me {
            email
          }
        }`)
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
      await privateTest(`
            mutation {
              editProfile(input: {
                email: "${NEW_EMAIL}"
              }) {
                ok
                error
              }
            }
        `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.editProfile).toEqual({ ok: true, error: null });
        });
      return privateTest(`{
            me {
              email
            }
          }`)
        .expect(200)
        .expect((res) => {
          const { email } = res.body.data.me;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });
  describe('verifyEmail', () => {
    let verificationCode: string;

    beforeAll(async () => {
      const [verification] = await verificationRepostory.find();
      verificationCode = verification.code;
    });

    it('should verify email', () => {
      return publicTest(`
          mutation {
            verifyEmail(input: {
              code: "${verificationCode}"
            }) {
              ok
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.verifyEmail).toEqual({ ok: true, error: null });
        });
    });

    it('should fail on wrong verification code not found', () => {
      return publicTest(`
        mutation {
          verifyEmail(input: {
            code: "xxxxxxxxx"
          }) {
            ok
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.verifyEmail).toEqual({
            ok: false,
            error: 'Not Found Verification Code',
          });
        });
    });
  });
});
