import { CircularProgress, Box } from "@mui/material";
import UserList from "../components/UserList";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { loading, usersList } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Lista de usuarios */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          gap: 2,
        }}
      >
        <UserList users={usersList} />
      </Box>
    </>
  );
};

export default Home;
