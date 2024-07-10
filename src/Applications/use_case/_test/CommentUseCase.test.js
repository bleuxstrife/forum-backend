const CommentUseCase = require('../CommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');

describe('CommentUseCase', () => {
  describe('addCommentInThread', () => {
    it('should orchestrating the add comment in thread action correctly', async () => {
      // Arrange
      const useCasePayload = {
        content: 'Comment',
        owner: 'user-123',
        threadId: 'thread-123',
      };

      const mockCreatedComment = new CreatedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      });

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();

      /** mocking needed function */
      mockThreadRepository.checkThreadIsExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.addComment = jest.fn()
        .mockImplementation(() => Promise.resolve(mockCreatedComment));

      /** creating use case instance */
      const commentUseCase = new CommentUseCase({
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      const createdComment = await commentUseCase.addCommentInThread(useCasePayload);

      // Assert
      expect(createdComment).toStrictEqual(new CreatedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }));
      expect(mockThreadRepository.checkThreadIsExist).toHaveBeenCalledWith(useCasePayload.threadId);
      expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new CreateComment({
        content: 'Comment',
        owner: 'user-123',
        threadId: 'thread-123',
      }));
    });
  });

  describe('deleteCommentInThread', () => {
    it('should orchestrating the delete comment in thread action correctly', async () => {
      // Arrange
      const useCasePayload = {
        commentId: 'commentId',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();

      /** mocking needed function */
      mockThreadRepository.checkThreadIsExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.checkCommentIsExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentOwner = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.deleteComment = jest.fn()
        .mockImplementation(() => Promise.resolve());

      /** creating use case instance */
      const commentUseCase = new CommentUseCase({
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      await commentUseCase.deleteCommentInThread(useCasePayload);

      // Assert
      expect(mockThreadRepository.checkThreadIsExist).toBeCalledWith(useCasePayload.threadId);
      expect(mockCommentRepository.checkCommentIsExist).toBeCalledWith(useCasePayload.commentId);
      expect(mockCommentRepository.verifyCommentOwner)
        .toBeCalledWith({ owner: useCasePayload.owner, commentId: useCasePayload.commentId });
      expect(mockCommentRepository.deleteComment).toBeCalledWith(useCasePayload.commentId);
    });
  });
});
