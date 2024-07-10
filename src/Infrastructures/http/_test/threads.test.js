const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  let token = '';
  let threadId = '';
  let userId = '';

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
  describe('when POST /threads', () => {
    it('should response 201 and return new thread Object', async () => {
      // Arrange
      const requestPayload = {
        title: 'Testing Title',
        body: 'Testing Body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      threadId = responseJson.data.addedThread.id;
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread
        && typeof responseJson.data.addedThread === 'object')
        .toBe(true);
      expect(typeof responseJson.data.addedThread.id).toBe('string');
      expect(responseJson.data.addedThread.id).not.toEqual('');
      expect(typeof responseJson.data.addedThread.title).toBe('string');
      expect(responseJson.data.addedThread.title).not.toEqual('');
      expect(typeof responseJson.data.addedThread.owner).toBe('string');
      expect(responseJson.data.addedThread.owner).not.toEqual('');
    });
  });

  describe('when GET /threads{threadId}', () => {
    it('should response 201 and return thread detail Object', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ threadId, owner: userId });
      await RepliesTableTestHelper.addReply({ owner: userId });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread
        && typeof responseJson.data.thread === 'object')
        .toBe(true);
      expect(typeof responseJson.data.thread.id).toBe('string');
      expect(responseJson.data.thread.id).not.toEqual('');
      expect(typeof responseJson.data.thread.title).toBe('string');
      expect(responseJson.data.thread.title).not.toEqual('');
      expect(typeof responseJson.data.thread.body).toBe('string');
      expect(responseJson.data.thread.body).not.toEqual('');
      expect(typeof responseJson.data.thread.username).toBe('string');
      expect(responseJson.data.thread.username).not.toEqual('');

      expect(Array.isArray(responseJson.data.thread.comments)).toBe(true);
      expect(responseJson.data.thread.comments).toHaveLength(1);

      expect(Array.isArray(responseJson.data.thread.comments[0].replies)).toBe(true);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(1);
    });
  });
});
