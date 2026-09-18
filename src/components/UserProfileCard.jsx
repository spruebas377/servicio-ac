// src/components/UserProfileCard.jsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Divider,
  Stack,
  Chip,
  Button,
  Skeleton,
} from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CrueltyFreeIcon from "@mui/icons-material/CrueltyFree";
import { supabase } from "../supabase/client";
import { NavLink } from "react-router";
import AccordionUsage from "./Accordion";

/* Iconos de género */
import FemaleOutlinedIcon from "@mui/icons-material/FemaleOutlined";
import MaleOutlinedIcon from "@mui/icons-material/MaleOutlined";
import TransgenderOutlinedIcon from "@mui/icons-material/TransgenderOutlined";
import QuestionMarkOutlinedIcon from "@mui/icons-material/QuestionMarkOutlined";
import NotInterestedIcon from "@mui/icons-material/NotInterested";

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

/* ---------- Subcomponente: item de detalle ---------- */
const DetailItem = ({ icon, label, value, extra }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box
      sx={{
        color: "text.disabled",
        mt: 0.25,
        display: "flex",
        "& svg": { fontSize: 20 },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          color: "text.disabled",
          lineHeight: 1.2,
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 450, wordBreak: "break-word" }}
      >
        {value}
        {extra}
      </Typography>
    </Box>
  </Stack>
);

/* ---------- Card premium adaptativa ---------- */
const PremiumCard = styled(Card)(({ theme }) => ({
  maxWidth: 560,
  width: "100%",
  borderRadius: "2.5rem",
  padding: theme.spacing(3, 2.8),
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  boxShadow:
    theme.palette.mode === "light"
      ? "0 20px 35px -8px rgba(0,0,0,0.04), 0 8px 18px -6px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.01)"
      : "0 20px 35px -8px rgba(0,0,0,0.5), 0 8px 18px -6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
  transition: "box-shadow 0.3s ease, transform 0.3s ease",
  "&:hover": {
    boxShadow:
      theme.palette.mode === "light"
        ? "0 30px 50px -12px rgba(0,0,0,0.08), 0 12px 24px -8px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)"
        : "0 30px 50px -12px rgba(0,0,0,0.65), 0 12px 24px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
  },
  [theme.breakpoints.down("sm")]: {
    borderRadius: "2rem",
    padding: theme.spacing(2.5, 2),
  },
}));

/* ---------- Botón Editar (outline pill) ---------- */
const EditButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.85rem",
  borderRadius: 999,
  padding: theme.spacing(0.75, 2),
  color: theme.palette.text.primary,
  borderColor: theme.palette.divider,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: alpha(theme.palette.text.primary, 0.2),
    backgroundColor: alpha(theme.palette.text.primary, 0.03),
  },
}));

/* ---------- Chip de verificación adaptativa ---------- */
const VerificationChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "verified",
})(({ theme, verified }) => ({
  marginLeft: theme.spacing(1),
  height: 22,
  fontSize: "0.7rem",
  fontWeight: 500,
  borderRadius: "100px",
  backgroundColor: verified
    ? theme.palette.mode === "light"
      ? "#e6f7ec"
      : alpha("#4caf50", 0.15)
    : theme.palette.mode === "light"
      ? "#ffe6e6"
      : alpha("#d32f2f", 0.15),
  color: verified
    ? theme.palette.mode === "light"
      ? "#0b6e3f"
      : "#81c784"
    : theme.palette.mode === "light"
      ? "#b30000"
      : "#ef9a9a",
  "& .MuiChip-label": { px: 1.2 },
}));

/* ---------- Avatar premium ---------- */
const PremiumAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: theme.palette.mode === "light" ? "#eaeef2" : "#2a2d34",
  color: theme.palette.text.primary,
  fontSize: "2rem",
  fontWeight: 500,
  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  border: `2px solid ${theme.palette.background.paper}`,
}));

/* ---------- Contenedor del icono de género ---------- */
const GenderIconBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: "50%",
  backgroundColor:
    theme.palette.mode === "light" ? alpha("#000", 0.03) : alpha("#fff", 0.05),
  color: theme.palette.text.primary,
  flexShrink: 0,
}));

/* ---------- Renderizador de icono de género ---------- */
const GenderIcon = ({ name }) => {
  const common = { fontSize: "medium" };
  switch (name) {
    case "FemaleOutlinedIcon":
      return <FemaleOutlinedIcon {...common} />;
    case "MaleOutlinedIcon":
      return <MaleOutlinedIcon {...common} />;
    case "TransgenderOutlinedIcon":
      return <TransgenderOutlinedIcon {...common} />;
    case "NotInterestedIcon":
      return <NotInterestedIcon {...common} />;
    case "QuestionMarkOutlinedIcon":
    default:
      return <QuestionMarkOutlinedIcon {...common} />;
  }
};

/* ---------- Componente principal ---------- */
export default function UserProfileCard() {
  const theme = useTheme();
  const [user, setUser] = useState({});
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [places, setPlaces] = useState([]);

  /* ---------- Scroll al top ---------- */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const { user } = data;
      setUser(user);
      let { data: userData } = await supabase
        .from("user_data")
        .select("*")
        .eq("id", user.id)
        .single();
      userData.city = await getCityName(userData.city);
      userData.province = await getProvinceName(userData.province);
      userData.genderName = await getGenderName(userData.gender);
      userData.genderIcon = getGenderIcon(userData.gender);
      userData.paymentMethods = await getPaymentMethods(userData.id);
      userData.places = await getPlacesNames(userData.id);
      setUserData(userData);
      setLoading(false);
    };
    getCurrentUser();
  }, []);

  const getGenderName = async (id) => {
    const { data } = await supabase
      .from("gender")
      .select("name")
      .eq("id", id)
      .single();
    if (!data) {
      return "Indistinto";
    }
    return data.name;
  };

  const getCityName = async (cityId) => {
    try {
      const { data } = await supabase
        .from("localidades")
        .select("nombre")
        .eq("id", cityId)
        .single();
      return data.nombre;
    } catch (error) {
      console.error(error);
      return "";
    }
  };

  const getProvinceName = async (provinceId) => {
    try {
      const { data } = await supabase
        .from("provincias")
        .select("nombre")
        .eq("id", provinceId)
        .single();
      return data.nombre;
    } catch (error) {
      console.error(error);
      return "";
    }
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case 1:
        return "FemaleOutlinedIcon";
      case 2:
        return "MaleOutlinedIcon";
      case 3:
      case 4:
        return "TransgenderOutlinedIcon";
      case 5:
      case 7:
        return "NotInterestedIcon";
      case 6:
      default:
        return "QuestionMarkOutlinedIcon";
    }
  };

  const getPaymentMethods = async (user) => {
    const { data, error } = await supabase
      .from("user_payment")
      .select(`payment_methods ( id, name )`)
      .eq("id_user", user);

    if (error) {
      console.error(error);
      return;
    }

    const methods = data.map((item) => item.payment_methods);
    setPaymentMethods(methods);
  };

  const getPlacesNames = async (user) => {
    const { data, error } = await supabase
      .from("user_places")
      .select(`places ( id, name )`)
      .eq("user_id", user);

    if (error) {
      console.error(error);
      return;
    }

    const places = data.map((item) => item.places);
    setPlaces(places);
  };

  /* ---------- Estado de carga: skeleton premium ---------- */
  if (loading) {
    return (
      <PremiumCard elevation={0}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2.5,
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Skeleton variant="circular" width={80} height={80} />
            <Box sx={{ flex: 1, width: "100%" }}>
              <Skeleton variant="text" width="60%" height={36} />
              <Skeleton variant="text" width="40%" height={24} />
            </Box>
          </Box>
          <Divider sx={{ my: 2.5 }} />
          <Stack spacing={2.2}>
            {[1, 2, 3, 4].map((i) => (
              <Stack key={i} direction="row" spacing={1.5}>
                <Skeleton variant="circular" width={20} height={20} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="30%" height={16} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard elevation={0}>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {/* Header: avatar + nombre + rol + botón editar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          {/* Avatar con fallback seguro */}
          <PremiumAvatar
            src={userData.avatar_url || undefined}
            alt={userData.name || "Avatar"}
          >
            {userData.avatar_url ? (
              <img
                src={userData.avatar_url}
                alt={userData.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (userData.name || "?")
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            )}
          </PremiumAvatar>

          {/* Nombre + descripción */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                mb: 0.25,
              }}
            >
              {userData.name || "—"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", wordBreak: "break-word" }}
            >
              {userData.description || "Sin descripción"}
            </Typography>
          </Box>

          {/* Género con icono en círculo sutil */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              flexShrink: 0,
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <GenderIconBox>
              <GenderIcon
                name={userData.gender ? userData.genderIcon : "Indistinto"}
              />
            </GenderIconBox>
            <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  color: "text.disabled",
                  display: "block",
                  fontSize: "0.7rem",
                }}
              >
                Género
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 450 }}>
                {userData.genderName || "—"}
              </Typography>
            </Box>
          </Stack>

          {/* Botón Editar */}
          <NavLink to="/profile-update" style={{ textDecoration: "none" }}>
            <EditButton
              variant="outlined"
              startIcon={<EditOutlinedIcon fontSize="small" />}
            >
              Editar
            </EditButton>
          </NavLink>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Lista de detalles */}
        <Stack spacing={2.2}>
          <DetailItem
            icon={<EmailOutlinedIcon />}
            label="Email"
            value={user?.email || "—"}
          />
          <DetailItem
            icon={<PhoneOutlinedIcon />}
            label="Teléfono"
            value={userData.phone || "—"}
          />
          <DetailItem
            icon={<LocationOnOutlinedIcon />}
            label="Ubicación"
            value={
              userData.city && userData.province
                ? `${userData.city} - ${userData.province}`
                : "—"
            }
          />

          <DetailItem
            icon={<CrueltyFreeIcon />}
            label="Características"
            value={
              <AccordionUsage
                userData={userData}
                paymentMethods={paymentMethods}
                places={places}
              />
            }
          />

          <DetailItem
            icon={<AccessTimeOutlinedIcon />}
            label="Estado"
            value="Activo"
            extra={
              <VerificationChip
                verified={!!userData.verified}
                label={userData.verified ? "verificado" : "no verificado"}
                size="small"
              />
            }
          />

          <DetailItem
            icon={<CalendarTodayOutlinedIcon />}
            label="Miembro desde"
            value={
              userData.created_at
                ? new Date(userData.created_at).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"
            }
          />
        </Stack>
      </CardContent>
    </PremiumCard>
  );
}
