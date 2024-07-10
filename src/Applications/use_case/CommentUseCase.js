const CreateComment = require('../../Domains/comments/entities/CreateComment');

class CommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async addCommentInThread(useCasePayload) {
    const {
      content, owner, threadId,
    } = useCasePayload;
    const createComment = new CreateComment({ content, owner, threadId });
    await this._threadRepository.checkThreadIsExist(threadId);
    const addedComment = await this._commentRepository.addComment(createComment);
    return addedComment;
  }

  async deleteCommentInThread(useCasePayload) {
    const {
      commentId, threadId, owner,
    } = useCasePayload;
    await this._threadRepository.checkThreadIsExist(threadId);
    await this._commentRepository.checkCommentIsExist(commentId);
    await this._commentRepository.verifyCommentOwner({ owner, commentId });
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = CommentUseCase;
