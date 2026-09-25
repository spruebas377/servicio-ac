import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { GendersProvider } from "./context/GendersContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import Login from "./pages/Login_Google";
import ProfileUpdate from "./pages/ProfileUpdate";
import LogOut from "./pages/LogOut";
import AboutUs from "./pages/AboutUs";
import NavBarWithMessages from "./components/NavBarWithMessages";
import Footer from "./components/Footer";
import { useState, useMemo, useEffect } from "react";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import { ColorModeContext } from "./context/ColorModeContext";
import { getTheme } from "./theme";
import ProfilePage from "./pages/ProfilePage";
import MyPublications from "./pages/MyPublications";
import UserPublicProfile from "./pages/UserPublicProfile";
import Conversations from "./pages/Conversations";
import ChatPage from "./pages/ChatPage";
import ChatNewPage from "./pages/ChatNewPage";
import Contact from "./pages/Contact";
import NavBar from "./components/NavBar";
import SearchResults from "./pages/SearchResults";

function App() {
  // Persistimos el modo en localStorage
  const [mode, setMode] = useState(
    () => localStorage.getItem("colorMode") || "light",
  );

  useEffect(() => {
    localStorage.setItem("colorMode", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <ColorModeContext.Provider value={colorMode}>
        <CssBaseline />
        <GendersProvider>
          <BrowserRouter>
            <AuthProvider>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100vh",
                }}
              >
                <NavBar />
                <Box component="main" sx={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/signup" element={<Register />} />
                    <Route path="/confirm-email" element={<ConfirmEmail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile-update" element={<ProfileUpdate />} />
                    <Route path="/conversations" element={<Conversations />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route
                      path="/chat/:conversationId"
                      element={<ChatPage />}
                    />
                    <Route path="/chat/new/:userId" element={<ChatNewPage />} />
                    <Route
                      path="/user/:userId"
                      element={<UserPublicProfile />}
                    />
                    <Route
                      path="/my-publications"
                      element={<MyPublications />}
                    />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/search/*" element={<SearchResults />} />
                    <Route path="/logout" element={<LogOut />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Box>
                <Footer />
              </Box>
            </AuthProvider>
          </BrowserRouter>
        </GendersProvider>
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
}

export default App;
