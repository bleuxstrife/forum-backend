const autoBind = require('auto-bind');
const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postCommentInThreadHandler(request, h) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const { threadId } = request.params;
    const { id } = request.auth.credentials;
    const { content } = request.payload;
    const useCasePayload = {
      content, owner: id, threadId,
    };
    const addedComment = await commentUseCase.addCommentInThread(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentInThreadHandler(request, h) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const { threadId, commentId } = request.params;
    const { id } = request.auth.credentials;
    const useCasePayload = {
      commentId, owner: id, threadId,
    };

    await commentUseCase.deleteCommentInThread(useCasePayload);

    return {
      status: 'success',
    };
  }
}
module.exports = CommentsHandler;
