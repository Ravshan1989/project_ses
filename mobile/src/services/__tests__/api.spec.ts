import { api, authApi, sosApi } from '../api';
import axios from 'axios';
import { getToken } from '../auth';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn().mockReturnValue({
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    }),
  };
});

jest.mock('../auth', () => ({
  getToken: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../../config', () => ({
  API_BASE_URL: 'http://localhost:3000/api/v1',
}));

describe('Mobile API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call auth/login with credentials', async () => {
    const credentials = { username: 'test', password: 'password' };
    await authApi.login(credentials);
    expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
  });

  it('should call sos/alerts with correct data', async () => {
    const alertData = { diseaseName: 'Anthrax', status: 'CONFIRMED' };
    await sosApi.createAlert(alertData);
    expect(api.post).toHaveBeenCalledWith('/sos/alerts', alertData);
  });

  it('should have a request interceptor that adds authorization header', async () => {
    // This is a unit test for the logic inside the interceptor
    // But since we mock axios.create, we'd need to test the interceptor callback directly
    // If we wanted to check if getToken was called.
    const mockRequestUse = (api.interceptors.request.use as jest.Mock);
    const interceptorCallback = mockRequestUse.mock.calls[0][0];

    (getToken as jest.Mock).mockResolvedValue('fake-token');

    const config = { headers: {} };
    const result = await interceptorCallback(config);

    expect(getToken).toHaveBeenCalled();
    expect(result.headers.Authorization).toBe('Bearer fake-token');
  });
});
