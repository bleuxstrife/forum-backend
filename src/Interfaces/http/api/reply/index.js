const RepliessHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'replies',
  register: async (server, { container }) => {
    const repliesHandler = new RepliessHandler(container);
    server.route(routes(repliesHandler));
  },
};
