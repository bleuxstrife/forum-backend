const autoBind = require('auto-bind');
const AuthUseCase = require('../../../../Applications/use_case/AuthUseCase');

class AuthenticationsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    const authUseCase = this._container.getInstance(AuthUseCase.name);
    const { accessToken, refreshToken } = await authUseCase.login(request.payload);
    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    const authUseCase = this._container
      .getInstance(AuthUseCase.name);
    const accessToken = await authUseCase.refreshAuth(request.payload);

    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    const authUseCase = this._container.getInstance(AuthUseCase.name);
    await authUseCase.deleteAuth(request.payload);
    return {
      status: 'success',
    };
  }
}

module.exports = AuthenticationsHandler;
