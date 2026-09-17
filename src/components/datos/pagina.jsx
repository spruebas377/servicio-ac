import CrueltyFreeIcon from "@mui/icons-material/CrueltyFree";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import { useTheme } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { Box } from "@mui/material";
import { NavLink } from "react-router";

export const nombrePagina = "ServicesCompanion";

export const Logo = () => {
  const theme = useTheme();
  return (
    <>
      <Box
        component={NavLink}
        to="/"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            background:
              theme.palette.mode === "light"
                ? "linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)"
                : "linear-gradient(135deg, #f2f2f2 0%, #b8b8b8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.palette.mode === "light" ? "#fff" : "#1e1e1e",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Diversity2Icon sx={{ fontSize: 20 }} />
        </Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "1.05rem",
            letterSpacing: "-0.02em",
          }}
        >
          {nombrePagina}
        </Typography>
      </Box>
    </>
  );
};
