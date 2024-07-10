const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyInCommentHandler,
    options: {
      auth: 'expert_exam_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: handler.deleteReplyInCommentHandler,
    options: {
      auth: 'expert_exam_jwt',
    },
  },
]);

module.exports = routes;
