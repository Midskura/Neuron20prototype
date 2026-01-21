import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface User {
  id: string;
  email: string;
  name: string;
  department: 'Business Development' | 'Pricing' | 'Operations' | 'Accounting' | 'Executive';
  role: 'rep' | 'manager' | 'director';
  created_at: string;
  is_active: boolean;
  // Operations-specific fields for team assignment
  service_type?: 'Forwarding' | 'Brokerage' | 'Trucking' | 'Marine Insurance' | 'Others' | null;
  operations_role?: 'Manager' | 'Supervisor' | 'Handler' | null;
}

interface DevRoleOverride {
  department: string;
  role: string;
  enabled: boolean;
  timestamp: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  effectiveDepartment: string;
  effectiveRole: string;
  devOverride: DevRoleOverride | null;
  setDevOverride: (override: DevRoleOverride | null) => void;
  setUser: (user: User | null) => void; // Add direct user setter for dev login
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devOverride, setDevOverrideState] = useState<DevRoleOverride | null>(null);

  // Load dev override from localStorage on mount
  useEffect(() => {
    const storedOverride = localStorage.getItem('neuron_dev_role_override');
    if (storedOverride) {
      try {
        const parsed = JSON.parse(storedOverride);
        if (parsed.enabled) {
          setDevOverrideState(parsed);
        }
      } catch (error) {
        console.error('Error parsing dev override:', error);
        localStorage.removeItem('neuron_dev_role_override');
      }
    }
  }, []);

  // Wrapper to save override to localStorage
  const setDevOverride = (override: DevRoleOverride | null) => {
    setDevOverrideState(override);
    if (override) {
      localStorage.setItem('neuron_dev_role_override', JSON.stringify(override));
    } else {
      localStorage.removeItem('neuron_dev_role_override');
    }
  };

  // Computed effective values
  const effectiveDepartment = devOverride?.enabled && devOverride.department 
    ? devOverride.department 
    : user?.department || 'Operations';
    
  const effectiveRole = devOverride?.enabled && devOverride.role 
    ? devOverride.role 
    : user?.role || 'rep';

  // Check for existing session on mount and auto-seed users if needed
  useEffect(() => {
    const initializeAuth = async () => {
      // First, check if we need to seed users
      try {
        // Check if projectId and publicAnonKey are defined
        if (!projectId || !publicAnonKey) {
          console.warn('Supabase configuration not found. Skipping user initialization.');
          // Don't return early - still check for stored session below
        } else {
          const usersResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/users`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
              },
            }
          );
          
          if (!usersResponse.ok) {
            console.warn('Failed to fetch users. Server may not be ready yet.');
            // Don't return early - still check for stored session below
          } else {
            const usersResult = await usersResponse.json();
            
            // Check if users need migration (old department format: "BD", "PD")
            const needsMigration = usersResult.success && usersResult.data.length > 0 && 
              usersResult.data.some((u: any) => u.department === "BD" || u.department === "PD");
            
            // If no users exist OR users need migration, seed them
            if ((usersResult.success && usersResult.data.length === 0) || needsMigration) {
              if (needsMigration) {
                console.log('Old user format detected. Migrating to new department names...');
                // Clear stored user session since department format changed
                localStorage.removeItem('neuron_user');
                setUser(null);
              } else {
                console.log('No users found. Auto-seeding test users...');
              }
              
              const seedResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/users/seed`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`,
                  },
                }
              );
              
              if (!seedResponse.ok) {
                console.warn('Failed to seed users. Server may not be ready yet.');
              } else {
                const seedResult = await seedResponse.json();
                
                if (seedResult.success) {
                  console.log('✅ Test users seeded successfully with new department names!');
                  if (needsMigration) {
                    console.log('🔄 Migration complete. Please log in again.');
                  }
                } else {
                  console.error('Failed to seed users:', seedResult.error);
                }
              }
            }
            
            // Auto-seed ticket types if they don't exist
            const ticketTypesResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/ticket-types`,
              {
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
              }
            );
            
            if (!ticketTypesResponse.ok) {
              console.warn('Failed to fetch ticket types. Server may not be ready yet.');
            } else {
              const ticketTypesResult = await ticketTypesResponse.json();
              
              if (ticketTypesResult.success && ticketTypesResult.data.length === 0) {
                console.log('No ticket types found. Auto-seeding ticket types...');
                
                const seedTicketTypesResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/ticket-types/seed`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`,
                    },
                  }
                );
                
                if (!seedTicketTypesResponse.ok) {
                  console.warn('Failed to seed ticket types. Server may not be ready yet.');
                } else {
                  const seedTicketTypesResult = await seedTicketTypesResponse.json();
                  
                  if (seedTicketTypesResult.success) {
                    console.log('✅ Ticket types seeded successfully!');
                  } else {
                    console.error('Failed to seed ticket types:', seedTicketTypesResult.error);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error during auto-initialization:', error);
        // Don't block the app from loading even if initialization fails
      }
      
      // Then check for existing session (this should ALWAYS run)
      const storedUser = localStorage.getItem('neuron_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Validate department format - if old format, clear session
          if (parsedUser.department === "BD" || parsedUser.department === "PD") {
            console.log('Clearing old session with outdated department format');
            localStorage.removeItem('neuron_user');
            setUser(null);
          } else {
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('neuron_user');
        }
      }
      
      // ALWAYS set loading to false at the end
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c142e950/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error || 'Login failed' };
      }

      // Store user in state and localStorage
      setUser(result.data);
      localStorage.setItem('neuron_user', JSON.stringify(result.data));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('neuron_user');
    // Also clear dev override on logout
    setDevOverride(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        effectiveDepartment,
        effectiveRole,
        devOverride,
        setDevOverride,
        setUser, // Add direct user setter for dev login
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}