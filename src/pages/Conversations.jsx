import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { supabase } from "../supabase/client";

function formatMessageTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Ayer";

  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

export default function Conversations() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConversations = useCallback(async () => {
    try {
      await Promise.resolve();
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Tenés que iniciar sesión para ver tus conversaciones.");
        setLoading(false);
        return;
      }

      // 1. Participaciones del usuario actual
      const { data: myRows, error: myError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);

      if (myError) {
        setError(myError.message);
        setLoading(false);
        return;
      }

      const ids = [
        ...new Set((myRows ?? []).map((row) => row.conversation_id)),
      ];

      if (!ids.length) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const readMap = new Map(
        (myRows ?? []).map((row) => [row.conversation_id, row.last_read_at]),
      );

      // 2. Otros participantes
      const { data: participants, error: participantsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", ids)
        .neq("user_id", user.id);

      if (participantsError) {
        setError(participantsError.message);
        setLoading(false);
        return;
      }

      const otherIds = [
        ...new Set((participants ?? []).map((row) => row.user_id)),
      ];

      // 3. Perfiles de otros participantes (por id o auth_id)
      let profiles = [];
      if (otherIds.length) {
        const { data: profilesByAuth } = await supabase
          .from("user_data")
          .select("id, auth_id, name, email, avatar_url")
          .in("auth_id", otherIds);

        const { data: profilesById } = await supabase
          .from("user_data")
          .select("id, auth_id, name, email, avatar_url")
          .in("id", otherIds);

        const map = new Map();
        (profilesByAuth ?? []).forEach((p) => {
          if (p.auth_id) map.set(p.auth_id, p);
          if (p.id) map.set(p.id, p);
        });
        (profilesById ?? []).forEach((p) => {
          if (p.auth_id) map.set(p.auth_id, p);
          if (p.id) map.set(p.id, p);
        });
        profiles = Array.from(map.values());
      }

      const profileMap = new Map();
      profiles.forEach((p) => {
        if (p.auth_id) profileMap.set(p.auth_id, p);
        if (p.id) profileMap.set(p.id, p);
      });

      // 4. Últimos mensajes de cada conversación
      const { data: messages } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, created_at")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false })
        .limit(300);

      const latestMessageMap = new Map();
      const unreadCountMap = new Map();

      for (const msg of messages ?? []) {
        if (!latestMessageMap.has(msg.conversation_id)) {
          latestMessageMap.set(msg.conversation_id, msg);
        }

        const lastRead = readMap.get(msg.conversation_id);
        const isUnread =
          msg.sender_id !== user.id &&
          (!lastRead || new Date(msg.created_at) > new Date(lastRead));

        if (isUnread) {
          unreadCountMap.set(
            msg.conversation_id,
            (unreadCountMap.get(msg.conversation_id) || 0) + 1,
          );
        }
      }

      // 5. Agrupar y deduplicar conversaciones por el otro participante
      const conversationMap = new Map();

      for (const participant of participants ?? []) {
        const otherUserId = participant.user_id;
        const profile = profileMap.get(otherUserId);
        const latestMsg = latestMessageMap.get(participant.conversation_id);
        const unreadCount = unreadCountMap.get(participant.conversation_id) || 0;

        const convItem = {
          conversationId: participant.conversation_id,
          otherUserId,
          profile,
          latestMessage: latestMsg,
          unreadCount,
          lastActivity: latestMsg ? new Date(latestMsg.created_at).getTime() : 0,
        };

        // Si ya hay una conversación con este mismo usuario, preferir la que tenga mensajes o actividad más reciente
        if (conversationMap.has(otherUserId)) {
          const existing = conversationMap.get(otherUserId);
          if (convItem.lastActivity > existing.lastActivity) {
            conversationMap.set(otherUserId, convItem);
          }
        } else {
          conversationMap.set(otherUserId, convItem);
        }
      }

      const list = Array.from(conversationMap.values()).sort(
        (a, b) => b.lastActivity - a.lastActivity,
      );

      setConversations(list);
    } catch (err) {
      setError(err?.message || "Error al cargar conversaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (active) {
        await loadConversations();
      }
    };
    run();

    // Suscripción a cambios en mensajes y participaciones
    const channel = supabase
      .channel("conversations-list-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => loadConversations(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_participants" },
        () => loadConversations(),
      )
      .subscribe();

    const onFocus = () => loadConversations();
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [loadConversations]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <ForumOutlinedIcon sx={{ fontSize: 28, color: "primary.main" }} />
        <Typography variant="h5" fontWeight={700}>
          Mis conversaciones
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && conversations.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <ChatBubbleOutlineOutlinedIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
          />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No tienes conversaciones todavía
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Podés iniciar una conversación enviando un mensaje desde el perfil público de cualquier usuario.
          </Typography>
        </Paper>
      )}

      {conversations.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${
              theme.palette.mode === "light"
                ? alpha("#000", 0.08)
                : alpha("#fff", 0.08)
            }`,
          }}
        >
          <List disablePadding>
            {conversations.map(
              ({ conversationId, profile, latestMessage, unreadCount }, idx) => {
                const name =
                  profile?.name ||
                  profile?.email?.split("@")[0] ||
                  "Usuario";

                const isUnread = unreadCount > 0;

                return (
                  <Box key={conversationId}>
                    {idx > 0 && <Divider />}
                    <ListItemButton
                      onClick={() => navigate(`/chat/${conversationId}`)}
                      sx={{
                        p: 2,
                        transition: "all 0.2s ease",
                        bgcolor: isUnread
                          ? theme.palette.mode === "light"
                            ? alpha(theme.palette.primary.main, 0.04)
                            : alpha(theme.palette.primary.main, 0.12)
                          : "transparent",
                        "&:hover": {
                          bgcolor:
                            theme.palette.mode === "light"
                              ? alpha(theme.palette.primary.main, 0.08)
                              : alpha("#fff", 0.06),
                        },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 56 }}>
                        <Badge
                          color="error"
                          variant="dot"
                          invisible={!isUnread}
                          overlap="circular"
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        >
                          <Avatar
                            src={profile?.avatar_url || undefined}
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: "primary.main",
                              fontWeight: 600,
                            }}
                          >
                            {name.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight={isUnread ? 700 : 600}
                              sx={{
                                color: isUnread ? "text.primary" : "text.primary",
                              }}
                            >
                              {name}
                            </Typography>
                            {latestMessage?.created_at && (
                              <Typography
                                variant="caption"
                                color={isUnread ? "primary.main" : "text.secondary"}
                                fontWeight={isUnread ? 600 : 400}
                              >
                                {formatMessageTime(latestMessage.created_at)}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              color: isUnread ? "text.primary" : "text.secondary",
                              fontWeight: isUnread ? 600 : 400,
                              maxWidth: "90%",
                            }}
                          >
                            {latestMessage ? latestMessage.content : "Conversación iniciada"}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </Box>
                );
              },
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
}
