import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; username: string } | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  startOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        // For now, just check localStorage for demo purposes
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setAuthState({
            isAuthenticated: true,
            user,
            isLoading: false,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // For demo purposes, simulate login
      // In real app, this would call the API
      const mockUser = { id: '1', username };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  const startOnboarding = () => {
    // Start onboarding without linking devices yet - this respects gating rules
    const mockUser = { id: 'demo', username: 'demo_user' };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    
    // Clear any existing device linking state to enforce fresh start
    localStorage.removeItem('hasLinkedDevice');
    localStorage.removeItem('hasLinkedCloud');
    
    setAuthState({
      isAuthenticated: true,
      user: mockUser,
      isLoading: false,
    });
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    startOnboarding,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}