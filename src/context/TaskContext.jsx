import { createContext, useContext, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router";

export const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskContextProvider");
  }
  return context;
};

export const TaskContextProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getTasks = async (done = false) => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    const { user } = data;
    if (!user) {
      setLoading(false);
      navigate("/login");
      return;
    }
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("done", done)
      .order("created_at", { ascending: true });
    if (error) throw error;
    setTasks(tasks);
    setLoading(false);
  };

  const createTask = async (taskTitle, taskDescription) => {
    setAdding(true);
    const { data } = await supabase.auth.getUser();
    const { user } = data;
    const { data: tasks, error } = await supabase
      .from("tasks")
      .insert({
        title: taskTitle,
        description: taskDescription,
        done: false,
        user_id: user.id,
      })
      .select();
    if (error) throw error;
    getTasks();
    setAdding(false);
  };

  const deleteTask = async (id) => {
    const { data } = await supabase.auth.getUser();
    const { user } = data;
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id);
    if (error) throw error;
    console.log("Tarea " + id + " eliminada por el usuario " + user.id);
    getTasks();
  };

  const updateTask = async (id, updateFields) => {
    const { data } = await supabase.auth.getUser();
    const { user } = data;
    const { error } = await supabase
      .from("tasks")
      .update(updateFields)
      .eq("user_id", user.id)
      .eq("id", id);
    if (error) throw error;
    getTasks();
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        adding,
        loading,
        getTasks,
        createTask,
        deleteTask,
        updateTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
