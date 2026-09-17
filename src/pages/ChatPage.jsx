import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { supabase } from "../supabase/client";

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  // Bloqueo síncrono: evita dobles/triples clics antes de que React actualice el estado.
  const sendingRef = useRef(false);

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

      const { data, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        if (!cancelled) setError(messagesError.message);
      } else if (!cancelled) {
        setMessages(data ?? []);
      }

      // Marcar como leído solamente la participación del usuario actual.
      const { error: readError } = await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

      if (readError) {
        console.warn(
          "No se pudo marcar la conversación como leída:",
          readError,
        );
      }

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

          // Si la conversación está abierta, los mensajes entrantes se consideran leídos.
          if (payload.new.sender_id !== user.id) {
            supabase
              .from("conversation_participants")
              .update({ last_read_at: new Date().toISOString() })
              .eq("conversation_id", conversationId)
              .eq("user_id", user.id)
              .then(({ error: updateError }) => {
                if (updateError) {
                  console.warn(
                    "No se pudo actualizar last_read_at:",
                    updateError,
                  );
                }
              });
          }
        },
      );

      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Error en el canal realtime de la conversación.");
        }
      });

      if (!cancelled) setLoading(false);
    }

    initialize();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function sendMessage() {
    const text = content.trim();

    // Usamos un ref porque el estado `sending` no se actualiza de forma
    // síncrona y varios clics rápidos podrían lanzar varios INSERT.
    if (!text || !currentUser || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setError("");

    try {
      const { error: insertError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: text,
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        setContent("");
      }
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 2 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Volver
      </Button>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Conversación
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack
          spacing={1}
          sx={{
            height: 420,
            overflowY: "auto",
            p: 1,
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          {messages.map((message) => {
            const mine = message.sender_id === currentUser?.id;

            return (
              <Box
                key={message.id}
                sx={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  bgcolor: mine ? "primary.main" : "action.hover",
                  color: mine ? "primary.contrastText" : "text.primary",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                }}
              >
                <Typography
                  sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {message.content}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {new Date(message.created_at).toLocaleString("es-AR")}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Escribí un mensaje..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
          />

          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={sending || !content.trim() || !currentUser}
          >
            Enviar
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
