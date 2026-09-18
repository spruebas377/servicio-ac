// src/pages/ProfilePage.jsx
import { Box, Container, Typography } from "@mui/material";
import UserProfileCard from "../components/UserProfileCard";
import { useEffect } from "react";

export default function ProfilePage() {
  /* ---------- Scroll al top ---------- */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, md: 4 },
        }}
      >
        {/* Encabezado de la página */}
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.03em",
              mb: 0.5,
            }}
          >
            Mi perfil
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Gestiona tu información personal y preferencias
          </Typography>
        </Box>

        {/* Tarjeta de perfil */}
        <UserProfileCard />
      </Box>
    </Container>
  );
}
