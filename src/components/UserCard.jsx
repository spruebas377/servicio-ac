import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const UserCard = ({ user, onNavigate }) => {
  if (!user) return null;

  return (
    <Card sx={{ minWidth: 300, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: "#9a55e8",
            }}
          >
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {user.username || "Usuario"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="text.primary"
            gutterBottom
          >
            Tus Publicaciones
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" color="primary">
              {user.imageCount || 0}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={onNavigate}
              sx={{
                borderRadius: 10,
                textTransform: "none",
                px: 2,
              }}
            >
              Ver todas
            </Button>
          </Box>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 2 }}
        >
          {user.plan === "gratuito"
            ? "Plan gratuito activo - 100 MB de almacenamiento"
            : "Plan premium activo - 5 GB de almacenamiento"}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ borderRadius: 10, textTransform: "none" }}
          onClick={onNavigate}
        >
          Ir a mis publicaciones
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserCard;
