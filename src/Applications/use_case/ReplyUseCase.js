const CreateReply = require('../../Domains/replies/entities/CreateReply');

class ReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async addReplyInComment(useCasePayload) {
    const {
      content, owner, commentId, threadId,
    } = useCasePayload;
    const createReply = new CreateReply({ content, owner, commentId });
    await this._threadRepository.checkThreadIsExist(threadId);
    await this._commentRepository.checkCommentIsExist(createReply.commentId);
    const addedReply = await this._replyRepository.addReply(createReply);
    return addedReply;
  }

  async deleteReplyInComment(useCasePayload) {
    const {
      commentId, threadId, replyId, owner,
    } = useCasePayload;
    await this._threadRepository.checkThreadIsExist(threadId);
    await this._commentRepository.checkCommentIsExist(commentId);
    await this._replyRepository.checkReplyIsExist(replyId);
    await this._replyRepository.verifyReplyOwner({ owner, replyId });
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = ReplyUseCase;
