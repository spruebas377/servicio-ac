import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { supabase } from "../supabase/client";

export default function Conversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (active)
          setError("Tenés que iniciar sesión para ver tus conversaciones.");
        if (active) setLoading(false);
        return;
      }

      const { data: myRows, error: myError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (myError) {
        if (active) setError(myError.message);
        if (active) setLoading(false);
        return;
      }

      const ids = [
        ...new Set((myRows ?? []).map((row) => row.conversation_id)),
      ];

      if (!ids.length) {
        if (active) setConversations([]);
        if (active) setLoading(false);
        return;
      }

      const { data: participants, error: participantsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", ids)
        .neq("user_id", user.id);

      if (participantsError) {
        if (active) setError(participantsError.message);
        if (active) setLoading(false);
        return;
      }

      const otherIds = [
        ...new Set((participants ?? []).map((row) => row.user_id)),
      ];

      let profiles = [];
      if (otherIds.length) {
        const { data, error: profilesError } = await supabase
          .from("user_data")
          .select("auth_id, name, email, avatar_url")
          .in("auth_id", otherIds);

        if (profilesError) {
          if (active) setError(profilesError.message);
          if (active) setLoading(false);
          return;
        }

        profiles = data ?? [];
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.auth_id, profile]),
      );

      const result = (participants ?? []).map((participant) => ({
        conversationId: participant.conversation_id,
        profile: profileMap.get(participant.user_id),
      }));

      if (active) setConversations(result);
      if (active) setLoading(false);
    }

    loadConversations();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 2 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Mis conversaciones
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {!error && conversations.length === 0 && (
        <Typography color="text.secondary">
          Todavía no tenés conversaciones.
        </Typography>
      )}

      {conversations.length > 0 && (
        <Paper>
          <List disablePadding>
            {conversations.map(({ conversationId, profile }) => {
              const name = profile?.name || profile?.email || "Usuario";

              return (
                <ListItemButton
                  key={conversationId}
                  onClick={() => navigate(`/chat/${conversationId}`)}
                >
                  <ListItemAvatar>
                    <Avatar src={profile?.avatar_url || undefined}>
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={name}
                    secondary={profile?.email || "Abrir conversación"}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
}
