// src/context/GendersContext.jsx
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../supabase/client";

/* ------------------------------------------------------------------ */
/*  Configuración de caché                                             */
/* ------------------------------------------------------------------ */

const CACHE_KEY = "ac-s:genders:v1";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

/* Fallback en memoria por si sessionStorage no está disponible */
const memoryCache = { data: null, timestamp: 0 };

const isStorageAvailable = () => {
  try {
    const k = "__ac-s_test__";
    window.sessionStorage.setItem(k, "1");
    window.sessionStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
};

const readCache = () => {
  try {
    const raw = isStorageAvailable()
      ? window.sessionStorage.getItem(CACHE_KEY)
      : null;
    const parsed = raw
      ? JSON.parse(raw)
      : memoryCache.data
        ? memoryCache
        : null;

    if (!parsed) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
    return parsed.data;
  } catch (err) {
    console.warn("Error leyendo caché de géneros:", err);
    return null;
  }
};

const writeCache = (data) => {
  const payload = { data, timestamp: Date.now() };
  try {
    if (isStorageAvailable()) {
      window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } else {
      memoryCache.data = data;
      memoryCache.timestamp = payload.timestamp;
    }
  } catch (err) {
    memoryCache.data = data;
    memoryCache.timestamp = payload.timestamp;
  }
};

const clearCacheStorage = () => {
  try {
    if (isStorageAvailable()) {
      window.sessionStorage.removeItem(CACHE_KEY);
    }
    memoryCache.data = null;
    memoryCache.timestamp = 0;
  } catch (err) {
    console.warn("Error limpiando caché de géneros:", err);
  }
};

/* ------------------------------------------------------------------ */
/*  Fetch a Supabase                                                   */
/* ------------------------------------------------------------------ */

const fetchGendersFromSupabase = async () => {
  /* ----------------------------------------------------------
   *  Opción A (por defecto): relación FK user_data.gender → gender.id
   * ---------------------------------------------------------- */
  const { data, error } = await supabase
    .from("gender")
    .select(
      `
      id,
      name,
      description,
      icon,
      user_data (count)
    `,
    )
    .order("name", { ascending: true });

  if (error) throw error;

  return (data || []).map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    icon: g.icon,
    count: g.user_data?.[0]?.count ?? 0,
  }));

  /* ----------------------------------------------------------
   *  Opción B: RPC (descomenta si prefieres SQL agregado)
   * ---------------------------------------------------------- */
  // const { data, error } = await supabase.rpc("get_genders_with_count");
  // if (error) throw error;
  // return (data || []).map((g) => ({
  //   id: g.id,
  //   name: g.name,
  //   description: g.description,
  //   icon: g.icon,
  //   count: g.user_count ?? 0,
  // }));
};

/* ------------------------------------------------------------------ */
/*  Contexto                                                           */
/* ------------------------------------------------------------------ */

const GendersContext = createContext(null);

export function GendersProvider({ children }) {
  const [genders, setGenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  /* ---------- Carga con caché ---------- */
  const load = useCallback(async ({ force = false } = {}) => {
    try {
      if (!force) {
        const cached = readCache();
        if (cached) {
          if (isMounted.current) {
            setGenders(cached);
            setFromCache(true);
            setLoading(false);
            setRefreshing(false);
          }
          return cached;
        }
      }

      if (isMounted.current) {
        setFromCache(false);
        if (force) setRefreshing(true);
        else setLoading(true);
      }

      const data = await fetchGendersFromSupabase();
      writeCache(data);

      if (isMounted.current) {
        setGenders(data);
        setError(null);
        setLastUpdated(Date.now());
      }
      return data;
    } catch (err) {
      console.error("Error cargando géneros:", err);
      if (isMounted.current) setError(err);
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  /* ---------- Carga inicial (una sola vez) ---------- */
  useEffect(() => {
    isMounted.current = true;
    if (!hasFetched.current) {
      hasFetched.current = true;
      load();
    }
    return () => {
      isMounted.current = false;
    };
  }, [load]);

  /* ---------- Refresco manual (ignora caché) ---------- */
  const refresh = useCallback(() => {
    clearCacheStorage();
    return load({ force: true });
  }, [load]);

  /* ---------- Invalidar caché sin refetch ---------- */
  const invalidate = useCallback(() => {
    clearCacheStorage();
    setFromCache(false);
  }, []);

  /* ---------- Prefetch (llamar al login, por ejemplo) ---------- */
  const prefetch = useCallback(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      return load();
    }
    return Promise.resolve(genders);
  }, [load, genders]);

  const total = genders.reduce((acc, g) => acc + (g.count || 0), 0);

  const value = {
    genders,
    loading,
    refreshing,
    error,
    fromCache,
    lastUpdated,
    total,
    refresh,
    invalidate,
    prefetch,
  };

  return (
    <GendersContext.Provider value={value}>{children}</GendersContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook de consumo                                                    */
/* ------------------------------------------------------------------ */

export function useGenders() {
  const ctx = useContext(GendersContext);
  if (!ctx) {
    throw new Error("useGenders debe usarse dentro de <GendersProvider>");
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Export para invalidar caché desde fuera (sin hook)                 */
/* ------------------------------------------------------------------ */

export { clearCacheStorage as clearGendersCache };
