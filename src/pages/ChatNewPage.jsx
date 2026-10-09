import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LoginIcon from "@mui/icons-material/Login";
import { supabase } from "../supabase/client";

export default function ChatNewPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isAuthError, setIsAuthError] = useState(false);
  const inProgressRef = useRef(false);

  useEffect(() => {
    let active = true;

    const openConversation = async () => {
      if (inProgressRef.current) return;
      inProgressRef.current = true;

      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          if (active) {
            setIsAuthError(true);
            setError("Tenés que iniciar sesión para enviar mensajes.");
          }
          return;
        }

        // 1. Resolver el usuario destinatario por id o auth_id en user_data
        let targetAuthId = null;

        const { data: targetProfile } = await supabase
          .from("user_data")
          .select("id, auth_id, name")
          .or(`id.eq.${userId},auth_id.eq.${userId}`)
          .maybeSingle();

        if (targetProfile) {
          targetAuthId = targetProfile.auth_id || targetProfile.id;
        } else {
          // Si no figura en user_data, asumimos que userId es directamente el auth_id
          targetAuthId = userId;
        }

        if (!targetAuthId) {
          if (active) setError("No se encontró el usuario destinatario.");
          return;
        }

        if (targetAuthId === currentUser.id) {
          if (active) setError("No podés enviarte mensajes a vos mismo.");
          return;
        }

        // 2. Verificar si ya existe una conversación entre ambos usuarios
        const { data: myRows, error: myRowsError } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", currentUser.id);

        if (myRowsError) {
          if (active) setError(myRowsError.message);
          return;
        }

        const myConversationIds = (myRows || []).map(
          (row) => row.conversation_id,
        );

        if (myConversationIds.length) {
          const { data: targetRows } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("user_id", targetAuthId)
            .in("conversation_id", myConversationIds);

          if (targetRows?.length) {
            let chosenConversationId = targetRows[0].conversation_id;

            // Si hay más de una por duplicados previos, seleccionar la que tenga mensajes más recientes
            if (targetRows.length > 1) {
              const matchedIds = targetRows.map((r) => r.conversation_id);
              const { data: latestMsg } = await supabase
                .from("messages")
                .select("conversation_id, created_at")
                .in("conversation_id", matchedIds)
                .order("created_at", { ascending: false })
                .limit(1);

              if (latestMsg?.[0]?.conversation_id) {
                chosenConversationId = latestMsg[0].conversation_id;
              }
            }

            if (active) {
              navigate(`/chat/${chosenConversationId}`, { replace: true });
            }
            return;
          }
        }

        if (!active) return;

        // 3. Crear nueva conversación
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

        if (active) {
          navigate(`/chat/${conversation.id}`, { replace: true });
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Ocurrió un error al iniciar la conversación.");
        }
      } finally {
        inProgressRef.current = false;
      }
    };

    openConversation();

    return () => {
      active = false;
    };
  }, [navigate, userId]);

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3, mt: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
            {error}
          </Alert>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
            {isAuthError && (
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={() =>
                  navigate("/login", {
                    state: { from: `/chat/new/${userId}` },
                  })
                }
              >
                Iniciar sesión
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10, gap: 2 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Abriendo conversación...
      </Typography>
    </Box>
  );
}
