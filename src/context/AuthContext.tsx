import { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "@/types";
import { getCurrentUser } from "@/lib/supabase/api";
import { supabase } from "@/lib/supabase/config";

export const INITIAL_USER: IUser = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

type AuthContextType = {
  user: IUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

const INITIAL_STATE: AuthContextType = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false,
};

const AuthContext = createContext<AuthContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthUser = async (): Promise<boolean> => {
    try {
      const currentUser = await getCurrentUser();

      if (!currentUser?.id) {
        setIsAuthenticated(false);
        setUser(INITIAL_USER);
        return false;
      }

      setUser({
        id: currentUser.id,
        name: currentUser.name || "",
        username:
          currentUser.username ||
          currentUser.email?.split("@")[0] ||
          "",
        email: currentUser.email || "",
        imageUrl: currentUser.imageUrl || "",
        bio: currentUser.bio || "",
      });

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(INITIAL_USER);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Persist session login state
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuthUser();
    });

    checkAuthUser(); // initial load

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
        checkAuthUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useUserContext = () => useContext(AuthContext);
