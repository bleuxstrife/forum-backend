const ReplyRepository = require('../../Domains/replies/ReplyRepository');

const CreatedReply = require('../../Domains/replies/entities/CreatedReply');

const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const GetReply = require('../../Domains/replies/entities/GetReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(createReply) {
    const { content, owner, commentId } = createReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, owner, commentId, false],
    };

    const result = await this._pool.query(query);

    return new CreatedReply({ ...result.rows[0] });
  }

  async getReplies(id) {
    const query = {
      text: `SELECT replies.id, replies.content, 
      replies.date, replies.is_delete, 
      users.username FROM replies
      LEFT JOIN users ON replies.owner = users.id 
      WHERE replies.comment_id = $1
      GROUP BY replies.id, users.username
      ORDER BY replies.date ASC`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return [...result.rows.map((e) => new GetReply(e))];
  }

  async deleteReply(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  async verifyReplyOwner(checkOwner) {
    const { owner, replyId } = checkOwner;

    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    const replies = result.rows[0];

    if (replies.owner !== owner) {
      throw new AuthorizationError('Anda tidak memiliki akses untuk resource ini');
    }
  }

  async checkReplyIsExist(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND is_delete = false',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
