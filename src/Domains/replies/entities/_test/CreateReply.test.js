const CreateReply = require('../CreateReply');

describe('a CreateReply entites', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new CreateReply(payload)).toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'Create Comment',
      owner: {},
      commentId: 'comment-123',
    };

    // Action and Assert
    expect(() => new CreateReply(payload)).toThrowError('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create reply object correctly', () => {
    // Arrange
    const payload = {
      content: 'Create Comment',
      owner: 'user-123',
      commentId: 'comment-123',
    };

    // Action
    const createReply = new CreateReply(payload);

    // Assert
    expect(createReply.content).toEqual(payload.content);
    expect(createReply.owner).toEqual(payload.owner);
    expect(createReply.commentId).toEqual(payload.commentId);
  });
});
