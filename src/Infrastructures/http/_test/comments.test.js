const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/thread/.../comments endpoint', () => {
  let token = '';
  let userId = '';
  let commentId = '';
  afterAll(async () => {
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

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and return new comment Object', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ owner: userId });
      const requestPayload = {
        content: 'Comment 1',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      commentId = responseJson.data.addedComment.id;
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment
        && typeof responseJson.data.addedComment === 'object')
        .toBe(true);
      expect(typeof responseJson.data.addedComment.id).toBe('string');
      expect(responseJson.data.addedComment.id).not.toEqual('');
      expect(typeof responseJson.data.addedComment.content).toBe('string');
      expect(responseJson.data.addedComment.content).not.toEqual('');
      expect(typeof responseJson.data.addedComment.owner).toBe('string');
      expect(responseJson.data.addedComment.owner).not.toEqual('');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentsId}', () => {
    it('should response 200 and comment should be deleted', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
        url: `/threads/thread-123/comments/${commentId}`,
      });
      const getComments = await CommentsTableTestHelper.findCommentById(commentId);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(getComments).toHaveLength(0);
    });
  });
});
