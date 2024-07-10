const autoBind = require('auto-bind');
const AuthUseCase = require('../../../../Applications/use_case/AuthUseCase');

class UsersHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    const authUseCase = this._container.getInstance(AuthUseCase.name);
    const addedUser = await authUseCase.register(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedUser,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
