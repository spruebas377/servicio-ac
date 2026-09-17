import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { supabase } from "../supabase/client";

export default function Chat({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let channel;

    const initializeChat = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error cargando mensajes:", error);
      } else {
        setMessages(data || []);
      }

      channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((previous) => {
              const exists = previous.some(
                (message) => message.id === payload.new.id,
              );

              return exists ? previous : [...previous, payload.new];
            });
          },
        )
        .subscribe();

      setLoading(false);
    };

    initializeChat();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId]);

  const sendMessage = async () => {
    const text = content.trim();

    if (!text || !currentUser || sending) return;

    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content: text,
    });

    if (error) {
      console.error("Error enviando mensaje:", error);
    } else {
      setContent("");
    }

    setSending(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          height: 400,
          overflowY: "auto",
          mb: 2,
          p: 1,
        }}
      >
        <Stack spacing={1}>
          {messages.map((message) => {
            const isMine = message.sender_id === currentUser?.id;

            return (
              <Box
                key={message.id}
                sx={{
                  alignSelf: isMine ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  bgcolor: isMine ? "primary.main" : "grey.200",
                  color: isMine ? "white" : "black",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                }}
              >
                <Typography>{message.content}</Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
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
          disabled={sending || !content.trim()}
        >
          Enviar
        </Button>
      </Stack>
    </Paper>
  );
}
