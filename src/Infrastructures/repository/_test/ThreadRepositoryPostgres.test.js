const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const GetThread = require('../../../Domains/threads/entities/GetThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  beforeAll(() => {
    UsersTableTestHelper.addUser({});
  });

  describe('addThread function', () => {
    it('should persist create thread and return created thread correctly', async () => {
      // Arrange

      const createThread = new CreateThread({
        title: 'Title',
        body: 'Body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepo = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepo.addThread(createThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return created thread correctly', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'Title',
        body: 'Body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepo = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await threadRepo.addThread(createThread);

      // Assert
      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-123',
        title: 'Title',
        owner: 'user-123',
      }));
    });
  });

  describe('checkThreadIsExist function', () => {
    it('should throw NotFoundError if thread not available', async () => {
      // Arrange
      const id = 'thread-1234';
      const threadRepo = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({});

      // Action & Assert
      await expect(threadRepo.checkThreadIsExist(id))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if thread not available', async () => {
      // Arrange
      const id = 'thread-123';
      const threadRepo = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({});

      // Action & Assert
      await expect(threadRepo.checkThreadIsExist(id))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError if thread not available', async () => {
      // Arrange
      const id = 'thread-1234';
      const threadRepo = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({});

      // Action & Assert
      await expect(threadRepo.getThreadById(id))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if thread not available', async () => {
      // Arrange
      const id = 'thread-123';
      const threadRepo = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({});

      // Action & Assert
      await expect(threadRepo.checkThreadIsExist(id))
        .resolves.not.toThrow(NotFoundError);
    });

    it('should get thread object correctly', async () => {
      // Arrange
      const getThread = new GetThread({
        id: 'thread-123',
        title: 'Title',
        body: 'body',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
      });
      const id = 'thread-123';
      const threadRepo = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({});

      // Action
      const thread = await threadRepo.getThreadById(id);

      // Assert
      expect(thread).toStrictEqual(getThread);
    });
  });
});
