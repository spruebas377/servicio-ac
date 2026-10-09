import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { useNavigate } from "react-router";
import { supabase } from "../supabase/client";
import { useAuth } from "../context/AuthContext";

export default function MessagesMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadMessages = useCallback(async () => {
    await Promise.resolve();
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

    let profiles = [];
    if (otherIds.length) {
      const { data: profilesByAuth } = await supabase
        .from("user_data")
        .select("id, auth_id, name, avatar_url")
        .in("auth_id", otherIds);

      const { data: profilesById } = await supabase
        .from("user_data")
        .select("id, auth_id, name, avatar_url")
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

    let totalUnread = 0;
    const dedupedByOtherUser = new Map();

    for (const message of messages ?? []) {
      const lastReadAt = readMap.get(message.conversation_id);
      const isUnread =
        message.sender_id !== user.id &&
        (!lastReadAt || new Date(message.created_at) > new Date(lastReadAt));

      if (isUnread) totalUnread += 1;

      const participant = (participants ?? []).find(
        (row) => row.conversation_id === message.conversation_id,
      );

      const otherUserId = participant?.user_id;

      if (otherUserId && !dedupedByOtherUser.has(otherUserId)) {
        const profile = profileMap.get(otherUserId);
        dedupedByOtherUser.set(otherUserId, {
          ...message,
          isUnread,
          name: profile?.name || "Usuario",
          avatar_url: profile?.avatar_url || "",
        });
      }
    }

    const formatted = Array.from(dedupedByOtherUser.values());

    setConversations(formatted);
    setUnreadCount(totalUnread);
  }, [user]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (active) {
        await loadMessages();
      }
    };
    run();

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
          event: "INSERT",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${user.id}`,
        },
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
      active = false;
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [user, loadMessages]);

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
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxWidth: "100vw",
              borderRadius: 3,
              mt: 1,
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 8px 28px -4px rgba(0,0,0,0.12)"
                  : "0 8px 28px -4px rgba(0,0,0,0.5)",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
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
                sx={{
                  px: 2,
                  py: 1.25,
                  bgcolor: conversation.isUnread
                    ? alpha(theme.palette.primary.main, 0.05)
                    : "transparent",
                }}
              >
                <ListItemAvatar sx={{ minWidth: 46 }}>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!conversation.isUnread}
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  >
                    <Avatar
                      src={conversation.avatar_url || undefined}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "primary.main",
                        fontSize: "0.85rem",
                      }}
                    >
                      {conversation.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      fontWeight={conversation.isUnread ? 700 : 500}
                      noWrap
                    >
                      {conversation.name}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color={
                        conversation.isUnread ? "text.primary" : "text.secondary"
                      }
                      fontWeight={conversation.isUnread ? 600 : 400}
                      noWrap
                    >
                      {conversation.content}
                    </Typography>
                  }
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
          sx={{ py: 1.5, textAlign: "center" }}
        >
          <ListItemText
            primary="Ver todos los mensajes"
            primaryTypographyProps={{
              color: "primary.main",
              fontWeight: 600,
              fontSize: "0.9rem",
              align: "center",
            }}
          />
        </ListItemButton>
      </Menu>
    </>
  );
}
