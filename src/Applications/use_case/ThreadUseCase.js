const CreateThread = require('../../Domains/threads/entities/CreateThread');
const GetComment = require('../../Domains/comments/entities/GetComment');

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addThread(useCasePayload) {
    const createThread = new CreateThread(useCasePayload);
    const addedThread = await this._threadRepository.addThread(createThread);
    return addedThread;
  }

  async getThreadDetail(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getComments(threadId);
    const commentsWithReplies = [];
    const replyPromises = comments.map(async (e) => {
      const replies = await this._replyRepository.getReplies(e.id);
      e.replies = replies;
      commentsWithReplies.push(e);
    });
    await Promise.all(replyPromises);

    thread.comments = commentsWithReplies;
    return thread;
  }
}

module.exports = ThreadUseCase;
