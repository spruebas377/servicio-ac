import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert, Box, CircularProgress } from "@mui/material";
import { supabase } from "../supabase/client";

export default function ChatNewPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const openConversation = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        if (active) setError("Tenés que iniciar sesión.");
        return;
      }

      const { data: targetProfile, error: profileError } = await supabase
        .from("user-data")
        .select("auth_id")
        .eq("id", userId)
        .single();

      if (profileError || !targetProfile?.auth_id) {
        if (active) setError("No se encontró el usuario destinatario.");
        return;
      }

      const targetAuthId = targetProfile.auth_id;

      if (targetAuthId === currentUser.id) {
        if (active) setError("No podés enviarte mensajes a vos mismo.");
        return;
      }

      const { data: myRows, error: myRowsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", currentUser.id);

      if (myRowsError) {
        if (active) setError(myRowsError.message);
        return;
      }

      const myConversationIds = (myRows || []).map((row) => row.conversation_id);

      if (myConversationIds.length) {
        const { data: targetRows } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", targetAuthId)
          .in("conversation_id", myConversationIds);

        if (targetRows?.length) {
          navigate(`/chat/${targetRows[0].conversation_id}`, { replace: true });
          return;
        }
      }

      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({})
        .select("id")
        .single();

      if (conversationError) {
        if (active) setError(conversationError.message);
        return;
      }

      const { error: participantsError } = await supabase
        .from("conversation_participants")
        .insert([
          { conversation_id: conversation.id, user_id: currentUser.id },
          { conversation_id: conversation.id, user_id: targetAuthId },
        ]);

      if (participantsError) {
        if (active) setError(participantsError.message);
        return;
      }

      navigate(`/chat/${conversation.id}`, { replace: true });
    };

    openConversation();

    return () => {
      active = false;
    };
  }, [navigate, userId]);

  if (error) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress />
    </Box>
  );
}
