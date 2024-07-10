const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/thread/.../comments/.../replies endpoint', () => {
  let token = '';
  let userId = '';
  let replyId = '';
  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });
  beforeAll(async () => {
    const server = await createServer(container);

    // Register
    const registerPayload = {
      username: 'renorizky',
      password: 'test',
      fullname: 'renorizky',
    };
    const registerRes = await server.inject({
      method: 'POST',
      url: '/users',
      payload: registerPayload,
    });
    // login
    const loginPayload = {
      username: 'renorizky',
      password: 'test',
    };
    const loginRes = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: loginPayload,
    });
    const loginJson = JSON.parse(loginRes.payload);
    const registerJson = JSON.parse(registerRes.payload);
    userId = registerJson.data.addedUser.id;
    token = loginJson.data.accessToken;
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and return new reply Object', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ owner: userId });
      await CommentsTableTestHelper.addComment({ owner: userId });
      const requestPayload = {
        content: 'Reply 1',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      replyId = responseJson.data.addedReply.id;
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply
        && typeof responseJson.data.addedReply === 'object')
        .toBe(true);
      expect(typeof responseJson.data.addedReply.id).toBe('string');
      expect(responseJson.data.addedReply.id).not.toEqual('');
      expect(typeof responseJson.data.addedReply.content).toBe('string');
      expect(responseJson.data.addedReply.content).not.toEqual('');
      expect(typeof responseJson.data.addedReply.owner).toBe('string');
      expect(responseJson.data.addedReply.owner).not.toEqual('');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentsId}/replies/{repliesId}', () => {
    it('should response 200 and comment should be deleted', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
        url: `/threads/thread-123/comments/comment-123/replies/${replyId}`,
      });
      const getReplies = await RepliesTableTestHelper.findReplyById(replyId);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(getReplies).toHaveLength(0);
    });
  });
});
