const CreatedReply = require('../CreatedReply');

describe('a CreatedReply entites', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'replu-123',
      content: 'Created replu',
    };

    // Action and Assert
    expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'Created Reply',
      owner: {},
    };

    // Action and Assert
    expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create createdReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Created Comment',
      owner: 'user-123',
    };

    // Action
    const createdReply = new CreatedReply(payload);

    // Assert
    expect(createdReply.id).toEqual(payload.id);
    expect(createdReply.content).toEqual(payload.content);
    expect(createdReply.owner).toEqual(payload.owner);
  });
});
