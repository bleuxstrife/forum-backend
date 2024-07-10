const GetReply = require('../GetReply');

describe('a GetReply entites', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Get Replu',
      username: 'renorizky',
      date: '2024-07-04T12:26:21.338Z',
    };

    // Action and Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 123,
      date: 1234,
      username: 'renorizky',
      is_delete: true,
    };

    // Action and Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get deleted reply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Get Reply',
      date: '2024-07-04T12:26:21.338Z',
      username: 'renorizky',
      is_delete: true,
    };

    const deletedContent = '**balasan telah dihapus**';

    // Action
    const getReply = new GetReply(payload);

    // Assert
    expect(getReply.id).toEqual(payload.id);
    expect(getReply.content).toEqual(deletedContent);
    expect(getReply.date).toEqual(payload.date);
    expect(getReply.username).toEqual(payload.username);
  });

  it('should get eply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Get Replu',
      date: '2024-07-04T12:26:21.338Z',
      username: 'renorizky',
      is_delete: false,
    };

    // Action
    const getReply = new GetReply(payload);

    // Assert
    expect(getReply.id).toEqual(payload.id);
    expect(getReply.content).toEqual(payload.content);
    expect(getReply.date).toEqual(payload.date);
    expect(getReply.username).toEqual(payload.username);
  });
});
