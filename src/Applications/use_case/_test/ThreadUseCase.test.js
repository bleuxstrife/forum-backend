const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadUseCase = require('../ThreadUseCase');

const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');

const GetThread = require('../../../Domains/threads/entities/GetThread');
const GetComment = require('../../../Domains/comments/entities/GetComment');
const getReply = require('../../../Domains/replies/entities/GetReply');
const GetReply = require('../../../Domains/replies/entities/GetReply');
const comments = require('../../../Interfaces/http/api/comments');

describe('ThreadUseCase', () => {
  describe('addThread', () => {
    it('should orchestrating the add thread action correctly', async () => {
      // Arrange
      const useCasePayload = {
        title: 'Title',
        body: 'body',
        owner: 'user-123',
      };

      const mockCreatedThread = new CreatedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.owner,
      });

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();

      /** mocking needed function */
      mockThreadRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve(mockCreatedThread));

      /** creating use case instance */
      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
      });

      // Action
      const createdThread = await threadUseCase.addThread(useCasePayload);

      // Assert
      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.owner,
      }));

      expect(mockThreadRepository.addThread).toHaveBeenCalledWith(new CreateThread({
        title: 'Title',
        body: 'body',
        owner: 'user-123',
      }));
    });
  });
  describe('getThreadDetail', () => {
    it('should orchestrating to get thread detail action correctly', async () => {
      // Arrange
      const useCasePayload = {
        threadId: 'thread-123',
      };

      const mockGetThread = new GetThread({
        id: 'thread-123',
        title: 'Testing',
        body: 'Test Body',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
      });

      const mockGetReply = new GetReply({
        id: 'reply-123',
        content: 'reply 1',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
        is_delete: false,
      });

      const mockGetComment = new GetComment({
        id: 'comment-123',
        content: 'comment 1',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
        is_delete: false,
      });

      const mockGetComment2 = new GetComment({
        id: 'comment-1234',
        content: 'comment 2',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
        is_delete: true,
      });

      const mockResult = mockGetThread;
      mockGetComment.replies = mockGetReply;
      mockResult.comments = [mockGetComment, mockGetComment2];

      /** creating dependency of use case */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      /** mocking needed function */
      mockThreadRepository.getThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve(mockGetThread));
      mockCommentRepository.getComments = jest.fn()
        .mockImplementation(() => Promise.resolve([mockGetComment, mockGetComment2]));
      mockReplyRepository.getReplies = jest.fn()
        .mockImplementation(() => Promise.resolve([mockGetReply]));

      /** creating use case instance */
      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      // Action
      const thread = await threadUseCase.getThreadDetail(useCasePayload);

      // Assert
      expect(thread).toStrictEqual(new GetThread({
        id: 'thread-123',
        title: 'Testing',
        body: 'Test Body',
        date: '2024-07-02T19:38:34.203Z',
        username: 'renorizky',
        comments: [
          new GetComment({
            id: 'comment-123',
            content: 'comment 1',
            date: '2024-07-02T19:38:34.203Z',
            username: 'renorizky',
            is_delete: false,
            replies: [
              new GetReply({
                id: 'reply-123',
                content: 'reply 1',
                date: '2024-07-02T19:38:34.203Z',
                username: 'renorizky',
                is_delete: false,
              }),
            ],
          }),
          new GetComment({
            id: 'comment-1234',
            content: 'comment 2',
            date: '2024-07-02T19:38:34.203Z',
            username: 'renorizky',
            is_delete: true,
            replies: [
              new GetReply({
                id: 'reply-123',
                content: 'reply 1',
                date: '2024-07-02T19:38:34.203Z',
                username: 'renorizky',
                is_delete: false,
              }),
            ],
          }),
        ],
      }));

      expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
      expect(mockCommentRepository.getComments).toBeCalledWith(useCasePayload.threadId);
      expect(mockReplyRepository.getReplies).toBeCalledWith(mockGetComment.id);
    });
  });
});
