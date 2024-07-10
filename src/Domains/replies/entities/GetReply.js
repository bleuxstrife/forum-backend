class GetReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      id, content, date, username, is_delete,
    } = payload;

    this.id = id;
    this.content = this._updateContent(is_delete, content);
    this.date = date;
    this.username = username;
  }

  _verifyPayload({
    id,
    content,
    date,
    username,
    is_delete,
  }) {
    if (!id || !content || !date || !username || is_delete === undefined) {
      throw new Error('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string'
          || typeof date !== 'string' || typeof username !== 'string'
          || typeof is_delete !== 'boolean') {
      throw new Error('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _updateContent(isDelete, content) {
    if (isDelete) return '**balasan telah dihapus**';
    return content;
  }
}

module.exports = GetReply;
