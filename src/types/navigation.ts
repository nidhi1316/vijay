import { User } from './auth';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainApp: { user?: User };
  Dashboard: { user?: User };
  TwoDMap: { user?: User };
  ThreeDMap: { source?: any; user?: User };
  Profile: { user?: User };
};

export type AppStackParamList = AuthStackParamList;
export type RootStackParamList = AuthStackParamList;
