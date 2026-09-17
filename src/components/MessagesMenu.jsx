import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
  Tooltip,
} from "@mui/material";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { useNavigate } from "react-router";
import { supabase } from "../supabase/client";
import { useAuth } from "../context/AuthContext";

export default function MessagesMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadMessages = useCallback(async () => {
    if (!user?.id) {
      setConversations([]);
      setUnreadCount(0);
      return;
    }

    const { data: myRows, error: myError } = await supabase
      .from("conversation_participants")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);

    if (myError) {
      console.error("Error al cargar participaciones:", myError);
      return;
    }

    const ids = (myRows ?? []).map((row) => row.conversation_id);

    if (!ids.length) {
      setConversations([]);
      setUnreadCount(0);
      return;
    }

    const readMap = new Map(
      (myRows ?? []).map((row) => [row.conversation_id, row.last_read_at]),
    );

    const { data: participants, error: participantsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", ids)
      .neq("user_id", user.id);

    if (participantsError) {
      console.error("Error al cargar otros participantes:", participantsError);
      return;
    }

    const otherIds = [
      ...new Set((participants ?? []).map((row) => row.user_id)),
    ];

    const { data: profiles, error: profilesError } = otherIds.length
      ? await supabase
          .from("user-data")
          .select("auth_id, name, avatar_url")
          .in("auth_id", otherIds)
      : { data: [], error: null };

    if (profilesError) {
      console.error("Error al cargar perfiles:", profilesError);
      return;
    }

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.auth_id, profile]),
    );

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false })
      .limit(200);

    if (messagesError) {
      console.error("Error al cargar mensajes:", messagesError);
      return;
    }

    const latestByConversation = new Map();
    let totalUnread = 0;

    for (const message of messages ?? []) {
      if (!latestByConversation.has(message.conversation_id)) {
        latestByConversation.set(message.conversation_id, message);
      }

      const lastReadAt = readMap.get(message.conversation_id);
      const isUnread =
        message.sender_id !== user.id &&
        (!lastReadAt || new Date(message.created_at) > new Date(lastReadAt));

      if (isUnread) totalUnread += 1;
    }

    const formatted = Array.from(latestByConversation.values()).map(
      (message) => {
        const participant = (participants ?? []).find(
          (row) => row.conversation_id === message.conversation_id,
        );
        const profile = participant
          ? profileMap.get(participant.user_id)
          : undefined;

        return {
          ...message,
          name: profile?.name || "Usuario",
          avatar_url: profile?.avatar_url || "",
        };
      },
    );

    setConversations(formatted);
    setUnreadCount(totalUnread);
  }, [user?.id]);

  useEffect(() => {
    loadMessages();

    if (!user?.id) return undefined;

    const channel = supabase
      .channel(`messages-menu-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        loadMessages,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${user.id}`,
        },
        loadMessages,
      )
      .subscribe();

    const onFocus = () => loadMessages();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadMessages]);

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Tooltip title="Mensajes" arrow>
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          color="inherit"
          sx={{ borderRadius: 2 }}
        >
          <Badge
            badgeContent={unreadCount > 99 ? "99+" : unreadCount}
            color="error"
          >
            <ChatBubbleOutlineOutlinedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 280 }}>
          <Typography fontWeight={700}>Mensajes</Typography>
          <Typography variant="caption" color="text.secondary">
            Tus conversaciones recientes
          </Typography>
        </Box>

        <Divider />

        {conversations.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              No tienes mensajes todavía.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {conversations.slice(0, 5).map((conversation) => (
              <ListItemButton
                key={conversation.id}
                onClick={() => {
                  handleClose();
                  navigate(`/chat/${conversation.conversation_id}`);
                }}
              >
                <ListItemText
                  primary={conversation.name}
                  secondary={conversation.content}
                />
              </ListItemButton>
            ))}
          </List>
        )}

        <Divider />
        <ListItemButton
          onClick={() => {
            handleClose();
            navigate("/conversations");
          }}
        >
          <ListItemText primary="Ver todos los mensajes" />
        </ListItemButton>
      </Menu>
    </>
  );
}
