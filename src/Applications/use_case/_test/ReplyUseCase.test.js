const ReplyUseCase = require('../ReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');

describe('ReplyUseCase', () => {
  describe('addReplyInComment', () => {
    it('should orchestrating the add reply in thread action correctly', async () => {
      // Arrange
      const useCasePayload = {
        content: 'Reply',
        owner: 'user-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
      };

      const mockCreatedReply = new CreatedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      });

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      /** mocking needed function */
      mockThreadRepository.checkThreadIsExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkCommentIsExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.addReply = jest.fn()
        .mockImplementation(() => Promise.resolve(mockCreatedReply));

      /** creating use case instance */
      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      const createdReply = await replyUseCase.addReplyInComment(useCasePayload);

      // Assert
      expect(createdReply).toStrictEqual(new CreatedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }));
      expect(mockThreadRepository.checkThreadIsExist).toBeCalledWith(useCasePayload.threadId);
      expect(mockCommentRepository.checkCommentIsExist).toBeCalledWith(useCasePayload.commentId);
      expect(mockReplyRepository.addReply).toBeCalledWith(new CreateReply({
        content: 'Reply',
        owner: 'user-123',
        commentId: 'comment-123',
      }));
    });
  });

  describe('deleteReplyInComment', () => {
    it('should orchestrating the delete reply in thread action correctly', async () => {
      // Arrange
      const useCasePayload = {
        replyId: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      /** mocking needed function */
      mockThreadRepository.checkThreadIsExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkCommentIsExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.checkReplyIsExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.verifyReplyOwner = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.deleteReply = jest.fn()
        .mockImplementation(() => Promise.resolve());

      /** creating use case instance */
      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      await replyUseCase.deleteReplyInComment(useCasePayload);

      // Assert
      expect(mockThreadRepository.checkThreadIsExist).toBeCalledWith(useCasePayload.threadId);
      expect(mockCommentRepository.checkCommentIsExist).toBeCalledWith(useCasePayload.commentId);
      expect(mockReplyRepository.checkReplyIsExist).toBeCalledWith(useCasePayload.replyId);
      expect(mockReplyRepository.verifyReplyOwner)
        .toBeCalledWith({ owner: useCasePayload.owner, replyId: useCasePayload.replyId });
      expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.replyId);
    });
  });
});
