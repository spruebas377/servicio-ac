import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../supabase/client";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  const verifyUserData = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) {
        console.warn("Error en verifyUserData:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Error inesperado en verifyUserData:", err);
      return null;
    }
  }, []);

  const createUserData = useCallback(
    async (userDataParam) => {
      if (!userDataParam || !userDataParam.id) return null;
      try {
        const userDataVerified = await verifyUserData(userDataParam.id);
        if (!userDataVerified) {
          const { data, error } = await supabase
            .from("user_data")
            .insert({
              id: userDataParam.id,
              email: userDataParam.email,
              name: userDataParam.email
                ? userDataParam.email.split("@")[0]
                : "Usuario",
            })
            .select("*")
            .single();
          if (error) {
            console.warn("Error insertando user_data inicial:", error);
            return null;
          }
          return data;
        } else {
          return userDataVerified;
        }
      } catch (err) {
        console.error("Error en createUserData:", err);
        return null;
      }
    },
    [verifyUserData],
  );

  const getPublicUsersIdsList = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("*")
        .eq("is_public", true)
        .order("featured", { ascending: false })
        .order("verified", { ascending: false })
        .order("name", { ascending: true });
      if (error) {
        console.error("Error al obtener usuarios públicos:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Error inesperado en getPublicUsersIdsList:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          if (isMounted) {
            setUser(null);
            setUserData(null);
          }
        } else {
          const currentUser = data?.user || null;
          if (isMounted) setUser(currentUser);

          if (currentUser) {
            const uData = await createUserData(currentUser);
            if (isMounted) setUserData(uData);
          } else {
            if (isMounted) setUserData(null);
          }
        }

        const publicUsers = await getPublicUsersIdsList();
        if (isMounted) setUsersList(publicUsers || []);
      } catch (err) {
        console.error(
          "Error inicializando autenticación en AuthProvider:",
          err,
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      if (isMounted) setUser(currentUser);

      if (currentUser) {
        const uData = await createUserData(currentUser);
        if (isMounted) setUserData(uData);
      } else {
        if (isMounted) setUserData(null);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [createUserData, getPublicUsersIdsList]);

  const updateUserData = async (userData) => {
    if (!userData || !userData.id) return null;
    const { data, error } = await supabase
      .from("user_data")
      .update(userData)
      .eq("id", userData.id)
      .select("*");
    if (error) throw error;
    console.log("Usuario actualizado:", data);
    return data;
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
    if (data.user) {
      const uData = await createUserData(data.user);
      setUserData(uData);
      return uData;
    }
    return null;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
    const uData = await createUserData(data.user);
    setUserData(uData);
    return uData;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setUserData(null);
  };

  const updatePublicUserStatus = async (userId, isPublic) => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("user_data")
      .update({ is_public: isPublic })
      .eq("id", userId)
      .select("*");
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signup,
        login,
        logout,
        setUser,
        setUserData,
        createUserData,
        updateUserData,
        usersList,
        setUsersList,
        verifyUserData,
        updatePublicUserStatus,
        getPublicUsersIdsList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
