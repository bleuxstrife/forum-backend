const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const GetComment = require('../../../Domains/comments/entities/GetComment');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
  });

  describe('addComment function', () => {
    it('should persist create comment and return created comment correctly', async () => {
      // Arrange

      const createComment = new CreateComment({
        content: 'comment 123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepo = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepo.addComment(createComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return created comment correctly', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'comment 123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepo = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdComment = await commentRepo.addComment(createComment);

      // Assert
      expect(createdComment).toStrictEqual(new CreatedComment({
        id: 'comment-123',
        content: 'comment 123',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should return delete comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepo = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await CommentsTableTestHelper.addComment({});

      // Action
      await commentRepo.deleteComment('comment-123');

      // Assert
      const result = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(result).toHaveLength(0);
    });
  });

  describe('checkCommentIsExist function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      // Arrange
      const id = 'comment-1234';
      const commentRepo = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({});

      // Action & Assert
      await expect(commentRepo.checkCommentIsExist(id))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment not available', async () => {
      // Arrange
      const id = 'comment-123';
      const commentRepo = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({});

      // Action & Assert
      await expect(commentRepo.checkCommentIsExist(id))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if comment not own by owner', async () => {
      // Arrange
      const checkOwner = {
        owner: 'user-1234',
        commentId: 'comment-123',
      };
      const commentRepo = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({});

      // Action & Assert
      await expect(commentRepo.verifyCommentOwner(checkOwner))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw NotFoundError if comment owned by owner', async () => {
      // Arrange
      const checkOwner = {
        owner: 'user-123',
        commentId: 'comment-123',
      };
      const commentRepo = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({});

      // Action & Assert
      await expect(commentRepo.verifyCommentOwner(checkOwner))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('getComments function', () => {
    it('should get comments list correctly', async () => {
      // Arrange
      const getComment = new GetComment({
        id: 'comment-123',
        content: 'Comment 123',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
        is_delete: false,
      });
      const id = 'thread-123';
      const commentRepo = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({});

      // Action
      const comments = await commentRepo.getComments(id);

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0]).toStrictEqual(getComment);
    });

    it('should get deleted comments list correctly', async () => {
      // Arrange
      const getComment = new GetComment({
        id: 'comment-123',
        content: '**komentar telah dihapus**',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
        is_delete: true,
      });
      const id = 'thread-123';
      const commentRepo = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({});
      await CommentsTableTestHelper.deleteComment('comment-123');

      // Action
      const comments = await commentRepo.getComments(id);

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0]).toStrictEqual(getComment);
    });
  });
});
