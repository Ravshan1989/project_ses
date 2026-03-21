jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('fake-token'),
  setItemAsync: jest.fn().mockResolvedValue(true),
  deleteItemAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
}));

jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: { OS: 'ios' },
  // Add other RN mocks if needed
}));
