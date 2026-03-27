
// Mock Session type definition
type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyName?: string;
  };
  expires: string;
};

type ExtendedUser = Session['user'] & {
  id: string;
  role: string;
  company?: {
    id: string;
    name: string;
    type: string;
  };
};

type ExtendedSession = Session & {
  accessToken?: string;
  refreshToken?: string;
  user: ExtendedUser;
};

let currentSession: ExtendedSession | null = null;

export const getSession = async (): Promise<ExtendedSession | null> => {
  if (currentSession) {
    return currentSession;
  }

  const session = await getMockSession();
  if (session) {
    currentSession = {
      ...session,
      accessToken: 'mock-token',
      user: {
        ...session.user,
        company: {
          id: 'demo-company-1',
          name: session.user.companyName || 'Demo Company Ltd',
          type: 'enterprise',
        },
      },
    } as ExtendedSession;
  }
  return currentSession;
};

export const updateSession = (session: ExtendedSession) => {
  currentSession = session;
};

export const clearSession = () => {
  currentSession = null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session?.accessToken;
};

export const hasRole = async (role: string): Promise<boolean> => {
  const session = await getSession();
  return session?.user?.role === role;
};

export const getUserId = async (): Promise<string | undefined> => {
  const session = await getSession();
  return session?.user?.id;
};

export const getCompanyId = async (): Promise<string | undefined> => {
  const session = await getSession();
  return session?.user?.company?.id;
};
