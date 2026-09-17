/* Iconos de género */
import FemaleOutlinedIcon from "@mui/icons-material/FemaleOutlined";
import MaleOutlinedIcon from "@mui/icons-material/MaleOutlined";
import TransgenderOutlinedIcon from "@mui/icons-material/TransgenderOutlined";
import QuestionMarkOutlinedIcon from "@mui/icons-material/QuestionMarkOutlined";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

const GenderHelper = ({ gender }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchGender = async () => {
      const { data, error } = await supabase
        .from("gender")
        .select("*")
        .eq("id", gender)
        .single();
      if (error) console.error("Error fetching gender:", error);
      else setData(data);
    };
    fetchGender();
  }, [gender]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 0, sm: 1 },
        alignItems: { xs: "center", sm: "flex-start" },
        justifyContent: { xs: "center", sm: "flex-start" },
        fontSize: { xs: 30, sm: 30 },
      }}
    >
      {data?.icon === "FemaleOutlinedIcon" && (
        <FemaleOutlinedIcon fontSize={"inherit"} />
      )}
      {data?.icon === "MaleOutlinedIcon" && (
        <MaleOutlinedIcon fontSize={"inherit"} />
      )}
      {data?.icon === "TransgenderOutlinedIcon" && (
        <TransgenderOutlinedIcon fontSize={"inherit"} />
      )}
      {data?.icon === "QuestionMarkOutlinedIcon" && (
        <QuestionMarkOutlinedIcon fontSize={"inherit"} />
      )}
      {data?.icon === "NotInterestedIcon" && (
        <NotInterestedIcon fontSize={"inherit"} />
      )}
      <Typography variant="p" fontSize="inherit" sx={{ marginTop: "-7px" }}>
        {data?.name}
      </Typography>
    </Box>
  );
};

export default GenderHelper;
