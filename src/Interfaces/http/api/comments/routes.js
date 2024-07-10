const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentInThreadHandler,
    options: {
      auth: 'expert_exam_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentInThreadHandler,
    options: {
      auth: 'expert_exam_jwt',
    },
  },
]);

module.exports = routes;
