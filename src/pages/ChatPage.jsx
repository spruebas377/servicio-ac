import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { supabase } from "../supabase/client";

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    let cancelled = false;
    let channel;

    async function initialize() {
      if (!conversationId) return;

      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setError("Tenés que iniciar sesión.");
          setLoading(false);
        }
        return;
      }

      if (cancelled) return;
      setCurrentUser(user);

      // 1. Obtener participantes de la conversación
      const { data: participants, error: partError } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId);

      if (partError) {
        if (!cancelled) {
          setError("Error al cargar la conversación: " + partError.message);
          setLoading(false);
        }
        return;
      }

      const isParticipant = (participants || []).some((p) => p.user_id === user.id);
      if (!isParticipant) {
        if (!cancelled) {
          setError("No tienes acceso a esta conversación o no existe.");
          setLoading(false);
        }
        return;
      }

      // 2. Obtener el perfil del otro usuario
      const otherPart = (participants || []).find((p) => p.user_id !== user.id);
      if (otherPart) {
        const { data: profileData } = await supabase
          .from("user_data")
          .select("id, auth_id, name, avatar_url, email")
          .or(`id.eq.${otherPart.user_id},auth_id.eq.${otherPart.user_id}`)
          .maybeSingle();

        if (!cancelled && profileData) {
          setOtherUser(profileData);
        }
      }

      // 3. Cargar mensajes
      const { data: msgs, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        if (!cancelled) setError(messagesError.message);
      } else if (!cancelled) {
        setMessages(msgs ?? []);
        setTimeout(() => scrollToBottom("auto"), 100);
      }

      // 4. Marcar como leído
      const markAsRead = async () => {
        try {
          await supabase
            .from("conversation_participants")
            .update({ last_read_at: new Date().toISOString() })
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id);
        } catch (e) {
          console.warn("No se pudo marcar la conversación como leída:", e);
        }
      };

      await markAsRead();

      // 5. Suscripción en tiempo real
      const channelName = `conversation-${conversationId}`;
      const oldChannel = supabase
        .getChannels()
        .find((item) => item.topic === `realtime:${channelName}`);

      if (oldChannel) {
        await supabase.removeChannel(oldChannel);
      }

      channel = supabase.channel(channelName);

      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((previous) => {
            if (previous.some((message) => message.id === payload.new.id)) {
              return previous;
            }
            return [...previous, payload.new];
          });

          setTimeout(() => scrollToBottom("smooth"), 80);

          // Si el mensaje viene del otro usuario, marcar como leído
          if (payload.new.sender_id !== user.id) {
            markAsRead();
          }
        },
      );

      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Error en el canal realtime de la conversación.");
        }
      });

      const onFocus = () => markAsRead();
      window.addEventListener("focus", onFocus);

      if (!cancelled) setLoading(false);
    }

    initialize();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages.length]);

  async function sendMessage() {
    const text = content.trim();

    if (!text || !currentUser || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setError("");

    try {
      const { data: insertedMessage, error: insertError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: text,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
      } else {
        setContent("");
        if (insertedMessage) {
          setMessages((previous) => {
            if (previous.some((m) => m.id === insertedMessage.id)) return previous;
            return [...previous, insertedMessage];
          });
          setTimeout(() => scrollToBottom("smooth"), 50);
        }
      }
    } catch (err) {
      setError(err?.message || "Error al enviar el mensaje.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const otherName = otherUser?.name || otherUser?.email?.split("@")[0] || "Usuario";

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", p: { xs: 1.5, sm: 3 } }}>
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
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Cabecera de la conversación */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor:
              theme.palette.mode === "light"
                ? alpha(theme.palette.primary.main, 0.03)
                : alpha("#fff", 0.02),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Tooltip title="Volver a conversaciones">
              <IconButton onClick={() => navigate("/conversations")} size="small">
                <ArrowBackOutlinedIcon />
              </IconButton>
            </Tooltip>

            <Avatar
              src={otherUser?.avatar_url || undefined}
              sx={{
                width: 44,
                height: 44,
                bgcolor: "primary.main",
                fontWeight: 600,
              }}
            >
              {otherName.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                {otherName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mensaje privado
              </Typography>
            </Box>
          </Box>

          {otherUser?.id && (
            <Tooltip title="Ver perfil público">
              <Button
                size="small"
                variant="outlined"
                startIcon={<PersonOutlineOutlinedIcon />}
                onClick={() => navigate(`/user/${otherUser.id}`)}
                sx={{ borderRadius: 2, textTransform: "none", fontSize: "0.8rem" }}
              >
                Ver perfil
              </Button>
            </Tooltip>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Lista de mensajes */}
        <Box
          sx={{
            height: { xs: 400, sm: 460 },
            overflowY: "auto",
            p: { xs: 1.5, sm: 2.5 },
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            bgcolor:
              theme.palette.mode === "light"
                ? alpha("#000", 0.015)
                : alpha("#000", 0.15),
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "text.secondary",
              }}
            >
              <Typography variant="body2">
                No hay mensajes todavía. ¡Comenzá la conversación!
              </Typography>
            </Box>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_id === currentUser?.id;

              return (
                <Box
                  key={message.id}
                  sx={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    maxWidth: { xs: "85%", sm: "75%" },
                    bgcolor: isMine
                      ? "primary.main"
                      : theme.palette.mode === "light"
                        ? alpha("#000", 0.05)
                        : alpha("#fff", 0.08),
                    color: isMine ? "primary.contrastText" : "text.primary",
                    borderRadius: 3,
                    borderTopRightRadius: isMine ? 0.5 : 3,
                    borderTopLeftRadius: !isMine ? 0.5 : 3,
                    px: 2,
                    py: 1.25,
                    boxShadow: isMine
                      ? "0 2px 8px -2px rgba(0,0,0,0.15)"
                      : "none",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: "0.95rem",
                    }}
                  >
                    {message.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: isMine ? "right" : "left",
                      opacity: 0.75,
                      mt: 0.5,
                      fontSize: "0.72rem",
                    }}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Barra de entrada */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder="Escribí un mensaje... (Enter para enviar)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                },
              }}
            />

            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={sending || !content.trim() || !currentUser}
              sx={{
                borderRadius: 2.5,
                height: 40,
                minWidth: 48,
                px: 2,
              }}
            >
              {sending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendRoundedIcon fontSize="small" />
              )}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
