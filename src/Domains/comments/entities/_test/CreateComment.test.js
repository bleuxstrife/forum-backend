const CreateComment = require('../CreateComment');

describe('a CreateComment entites', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new CreateComment(payload)).toThrowError('CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'Create Comment',
      owner: {},
      threadId: 'thread-123',
    };

    // Action and Assert
    expect(() => new CreateComment(payload)).toThrowError('CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create comment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Create Comment',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Action
    const createComment = new CreateComment(payload);

    // Assert
    expect(createComment.content).toEqual(payload.content);
    expect(createComment.owner).toEqual(payload.owner);
    expect(createComment.threadId).toEqual(payload.threadId);
  });
});
