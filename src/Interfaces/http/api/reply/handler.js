const autoBind = require('auto-bind');
const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class RepliessHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postReplyInCommentHandler(request, h) {
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const { threadId, commentId } = request.params;
    const { id } = request.auth.credentials;
    const { content } = request.payload;
    const useCasePayload = {
      content, owner: id, threadId, commentId,
    };
    const addedReply = await replyUseCase.addReplyInComment(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyInCommentHandler(request, h) {
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const { threadId, commentId, replyId } = request.params;
    const { id } = request.auth.credentials;
    const useCasePayload = {
      commentId, owner: id, threadId, replyId,
    };

    await replyUseCase.deleteReplyInComment(useCasePayload);

    return {
      status: 'success',
    };
  }
}
module.exports = RepliessHandler;
