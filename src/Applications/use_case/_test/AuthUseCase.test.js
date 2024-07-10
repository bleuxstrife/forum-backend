const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const PasswordHash = require('../../security/PasswordHash');
const AuthUseCase = require('../AuthUseCase');

const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const NewAuth = require('../../../Domains/authentications/entities/NewAuth');

describe('AuthUseCase', () => {
  describe('Register', () => {
    it('should orchestrating the add user action correctly', async () => {
      // Arrange
      const useCasePayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: useCasePayload.username,
        fullname: useCasePayload.fullname,
      });

      /** creating dependency of use case */
      const mockUserRepository = new UserRepository();
      const mockPasswordHash = new PasswordHash();

      /** mocking needed function */
      mockUserRepository.verifyAvailableUsername = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockPasswordHash.hash = jest.fn()
        .mockImplementation(() => Promise.resolve('encrypted_password'));
      mockUserRepository.addUser = jest.fn()
        .mockImplementation(() => Promise.resolve(mockRegisteredUser));

      /** creating use case instance */
      const authUseCase = new AuthUseCase({
        userRepository: mockUserRepository,
        passwordHash: mockPasswordHash,
      });

      // Action
      const registeredUser = await authUseCase.register(useCasePayload);

      // Assert
      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123',
        username: useCasePayload.username,
        fullname: useCasePayload.fullname,
      }));

      expect(mockUserRepository.verifyAvailableUsername).toBeCalledWith(useCasePayload.username);
      expect(mockPasswordHash.hash).toBeCalledWith(useCasePayload.password);
      expect(mockUserRepository.addUser).toBeCalledWith(new RegisterUser({
        username: useCasePayload.username,
        password: 'encrypted_password',
        fullname: useCasePayload.fullname,
      }));
    });
  });

  describe('Login', () => {
    it('should orchestrating the get authentication action correctly', async () => {
      // Arrange
      const useCasePayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const mockedAuthentication = new NewAuth({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
      const mockUserRepository = new UserRepository();
      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();
      const mockPasswordHash = new PasswordHash();

      // Mocking
      mockUserRepository.getPasswordByUsername = jest.fn()
        .mockImplementation(() => Promise.resolve('encrypted_password'));
      mockPasswordHash.comparePassword = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.createAccessToken = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedAuthentication.accessToken));
      mockAuthenticationTokenManager.createRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedAuthentication.refreshToken));
      mockUserRepository.getIdByUsername = jest.fn()
        .mockImplementation(() => Promise.resolve('user-123'));
      mockAuthenticationRepository.addToken = jest.fn()
        .mockImplementation(() => Promise.resolve());

      // create use case instance
      const authUseCase = new AuthUseCase({
        userRepository: mockUserRepository,
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: mockAuthenticationTokenManager,
        passwordHash: mockPasswordHash,
      });

      // Action
      const actualAuthentication = await authUseCase.login(useCasePayload);

      // Assert
      expect(actualAuthentication).toEqual(new NewAuth({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      }));
      expect(mockUserRepository.getPasswordByUsername)
        .toBeCalledWith('dicoding');
      expect(mockPasswordHash.comparePassword)
        .toBeCalledWith('secret', 'encrypted_password');
      expect(mockUserRepository.getIdByUsername)
        .toBeCalledWith('dicoding');
      expect(mockAuthenticationTokenManager.createAccessToken)
        .toBeCalledWith({ username: 'dicoding', id: 'user-123' });
      expect(mockAuthenticationTokenManager.createRefreshToken)
        .toBeCalledWith({ username: 'dicoding', id: 'user-123' });
      expect(mockAuthenticationRepository.addToken)
        .toBeCalledWith(mockedAuthentication.refreshToken);
    });
  });

  describe('Refresh Auth', () => {
    it('should throw error if use case payload not contain refresh token', async () => {
      // Arrange
      const useCasePayload = {};
      const authUseCase = new AuthUseCase({});

      // Action & Assert
      await expect(authUseCase.refreshAuth(useCasePayload))
        .rejects
        .toThrowError('AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    });

    it('should throw error if refresh token not string', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 1,
      };
      const authUseCase = new AuthUseCase({});

      // Action & Assert
      await expect(authUseCase.refreshAuth(useCasePayload))
        .rejects
        .toThrowError('AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the refresh authentication action correctly', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 'some_refresh_token',
      };
      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();
      // Mocking
      mockAuthenticationRepository.checkAvailabilityToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.verifyRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.decodePayload = jest.fn()
        .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));
      mockAuthenticationTokenManager.createAccessToken = jest.fn()
        .mockImplementation(() => Promise.resolve('some_new_access_token'));
      // Create the use case instace
      const authUseCase = new AuthUseCase({
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: mockAuthenticationTokenManager,
      });

      // Action
      const accessToken = await authUseCase.refreshAuth(useCasePayload);

      // Assert
      expect(mockAuthenticationTokenManager.verifyRefreshToken)
        .toBeCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationRepository.checkAvailabilityToken)
        .toBeCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationTokenManager.decodePayload)
        .toBeCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationTokenManager.createAccessToken)
        .toBeCalledWith({ username: 'dicoding', id: 'user-123' });
      expect(accessToken).toEqual('some_new_access_token');
    });
  });

  describe('Delete Auth', () => {
    it('should throw error if use case payload not contain refresh token', async () => {
      // Arrange
      const useCasePayload = {};
      const authUseCase = new AuthUseCase({});

      // Action & Assert
      await expect(authUseCase.deleteAuth(useCasePayload))
        .rejects
        .toThrowError('AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    });

    it('should throw error if refresh token not string', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 123,
      };
      const authUseCase = new AuthUseCase({});

      // Action & Assert
      await expect(authUseCase.deleteAuth(useCasePayload))
        .rejects
        .toThrowError('AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the delete authentication action correctly', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 'refreshToken',
      };
      const mockAuthenticationRepository = new AuthenticationRepository();
      mockAuthenticationRepository.checkAvailabilityToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationRepository.deleteToken = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const authUseCase = new AuthUseCase({
        authenticationRepository: mockAuthenticationRepository,
      });

      // Act
      await authUseCase.deleteAuth(useCasePayload);

      // Assert
      expect(mockAuthenticationRepository.checkAvailabilityToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationRepository.deleteToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
    });
  });
});
