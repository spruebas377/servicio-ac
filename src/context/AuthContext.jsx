// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router";
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
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);
  const isMountedRef = useRef(true);

  /* ------------------------------------------------------------------ */
  /*  Helpers internos                                                   */
  /* ------------------------------------------------------------------ */

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
          return { ...data, isFirstLogin: true };
        }

        const isCompleted =
          Boolean(userDataParam.user_metadata?.profile_completed) ||
          Boolean(
            userDataVerified.phone ||
            userDataVerified.city ||
            userDataVerified.province ||
            userDataVerified.gender ||
            userDataVerified.nationality,
          );

        return { ...userDataVerified, isFirstLogin: !isCompleted };
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

  /* ------------------------------------------------------------------ */
  /*  Inicialización + listener de auth                                  */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    isMountedRef.current = true;

    const handleOAuthRedirectCheck = (uData) => {
      const isOAuthLogin =
        sessionStorage.getItem("oauth_login_in_progress") === "true";
      const hasOAuthHash =
        window.location.hash.includes("access_token") ||
        window.location.search.includes("code=");

      if (isOAuthLogin || hasOAuthHash) {
        sessionStorage.removeItem("oauth_login_in_progress");
        if (uData?.isFirstLogin) {
          navigate("/profile-update", {
            state: { firstLogin: true },
            replace: true,
          });
        } else if (window.location.pathname === "/login") {
          navigate("/", { replace: true });
        }
      }
    };

    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          if (isMountedRef.current) {
            setUser(null);
            setUserData(null);
          }
        } else {
          const currentUser = data?.user || null;
          if (isMountedRef.current) setUser(currentUser);

          if (currentUser) {
            /* Si el usuario tiene sesión pero su email no está confirmado,
               Supabase igual devuelve user pero con email_confirmed_at = null.
               En ese caso, NO creamos user_data todavía. */
            const emailConfirmed = Boolean(currentUser.email_confirmed_at);

            if (emailConfirmed) {
              const uData = await createUserData(currentUser);
              if (isMountedRef.current) {
                setUserData(uData);
                handleOAuthRedirectCheck(uData);
              }
            } else {
              if (isMountedRef.current) setUserData(null);
            }
          } else {
            if (isMountedRef.current) setUserData(null);
          }
        }

        const publicUsers = await getPublicUsersIdsList();
        if (isMountedRef.current) setUsersList(publicUsers || []);
      } catch (err) {
        console.error(
          "Error inicializando autenticación en AuthProvider:",
          err,
        );
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    initializeAuth();

    /* Listener de cambios de auth */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      if (isMountedRef.current) setUser(currentUser);

      if (currentUser) {
        const emailConfirmed = Boolean(currentUser.email_confirmed_at);

        if (emailConfirmed) {
          const uData = await createUserData(currentUser);
          if (isMountedRef.current) {
            setUserData(uData);
            if (event === "SIGNED_IN") {
              handleOAuthRedirectCheck(uData);
            }
          }
        } else {
          if (isMountedRef.current) setUserData(null);
        }
      } else {
        if (isMountedRef.current) setUserData(null);
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [createUserData, getPublicUsersIdsList, navigate]);

  /* ------------------------------------------------------------------ */
  /*  Acciones                                                           */
  /* ------------------------------------------------------------------ */

  const updateUserData = async (userDataToUpdate) => {
    if (!userDataToUpdate || !userDataToUpdate.id) return null;
    const { data, error } = await supabase
      .from("user_data")
      .update(userDataToUpdate)
      .eq("id", userDataToUpdate.id)
      .select("*");
    if (error) throw error;
    return data;
  };

  /**
   * Registro de usuario.
   *
   * Caso A: Confirmación por email ACTIVADA en Supabase
   *   → data.session es null
   *   → NO creamos user_data acá (se creará cuando confirme e inicie sesión)
   *   → devolvemos data tal cual para que el caller decida qué hacer
   *
   * Caso B: Confirmación por email DESACTIVADA
   *   → data.session existe
   *   → creamos user_data inmediatamente
   *   → devolvemos data + userData
   */
  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
      },
    });
    if (error) throw error;

    /* Caso B: sesión inmediata (sin confirmación por email) */
    if (data?.session && data?.user) {
      setUser(data.user);
      const uData = await createUserData(data.user);
      setUserData(uData);
      return { ...data, userData: uData };
    }

    /* Caso A: hay que confirmar email */
    setUser(null);
    setUserData(null);
    return { ...data, userData: null };
  };

  /**
   * Login. Si el email no está confirmado, Supabase lanza un error
   * con message "Email not confirmed" que el caller debe manejar.
   */
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

  /**
   * Reenviar email de confirmación.
   * No importa si el usuario no tiene sesión (es el caso típico).
   */
  const resendConfirmation = async (email) => {
    if (!email) throw new Error("Email requerido");
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
      },
    });
    if (error) throw error;
    return data;
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
        resendConfirmation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
