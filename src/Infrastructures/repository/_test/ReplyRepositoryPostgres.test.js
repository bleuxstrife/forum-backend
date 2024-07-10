const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');

const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');

const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const GetReply = require('../../../Domains/replies/entities/GetReply');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });

  describe('addReply function', () => {
    it('should persist create reply and return created reply correctly', async () => {
      // Arrange

      const createReply = new CreateReply({
        content: 'reply 123',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepo = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepo.addReply(createReply);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return created reply correctly', async () => {
      // Arrange
      const createReply = new CreateReply({
        content: 'reply 123',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepo = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdReply = await replyRepo.addReply(createReply);

      // Assert
      expect(createdReply).toStrictEqual(new CreatedReply({
        id: 'reply-123',
        content: 'reply 123',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteReply function', () => {
    it('should return delete comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepo = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await RepliesTableTestHelper.addReply({});

      // Action
      await replyRepo.deleteReply('reply-123');

      // Assert
      const result = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(result).toHaveLength(0);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError if comment not own by owner', async () => {
      // Arrange
      const checkOwner = {
        owner: 'user-1234',
        replyId: 'reply-123',
      };
      const replyRepo = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({});

      // Action & Assert
      await expect(replyRepo.verifyReplyOwner(checkOwner))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw NotFoundError if reply owned by owner', async () => {
      // Arrange
      const checkOwner = {
        owner: 'user-123',
        replyId: 'reply-123',
      };
      const replyRepo = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({});

      // Action & Assert
      await expect(replyRepo.verifyReplyOwner(checkOwner))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('checkReplyIsExist function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      // Arrange
      const id = 'reply-1234';
      const replyRepo = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({});

      // Action & Assert
      await expect(replyRepo.checkReplyIsExist(id))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment not available', async () => {
      // Arrange
      const id = 'reply-123';
      const replyRepo = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({});

      // Action & Assert
      await expect(replyRepo.checkReplyIsExist(id))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getReplies function', () => {
    it('should get replies list correctly', async () => {
      // Arrange
      const getReply = new GetReply({
        id: 'reply-123',
        content: 'Reply 123',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
        is_delete: false,
      });
      const id = 'comment-123';
      const replyRepo = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({});

      // Action
      const replies = await replyRepo.getReplies(id);

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toStrictEqual(getReply);
    });

    it('should get deleted replies list correctly', async () => {
      // Arrange
      const getReply = new GetReply({
        id: 'reply-123',
        content: '**balasan telah dihapus**',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
        is_delete: true,
      });
      const id = 'comment-123';
      const replyRepo = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({});
      await RepliesTableTestHelper.deleteReply('reply-123');

      // Action
      const replies = await replyRepo.getReplies(id);

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toStrictEqual(getReply);
    });
  });
});
