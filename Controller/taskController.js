import db from "../db/connection.js";
import { prisma } from "../libs/prisma.js";

// create-user //
export const createTask = async (req, res) => {
  try {
    const { title, description, start_time, end_time } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        start_time: start_time ? new Date(start_time) : null,
        end_time: end_time ? new Date(end_time) : null,
        user_id: Number(userId),
      },
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("CreateTask Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// get-users //
export const getTask = async (req, res) => {
  try {
    const userId = req.user?.id;

    const tasks = await prisma.task.findMany({
      where: { user_id: Number(userId) },
    });

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No tasks found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { name: true, email: true, profile_pic: true },
    });

    const dataWithUser = tasks.map((task) => ({
      ...task,
      user: user,
    }));

    return res.status(200).json({
      success: true,
      data: dataWithUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// update //
export const updateTask = async (req, res) => {
  try {
    const { title, description, start_time, end_time } = req.body;
    const userId = req.user?.id;
    const { id } = req.params; 

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updatedResult = await prisma.task.updateMany({
      where: {
        id: Number(id),
        user_id: Number(userId),
      },
      data: {
        title,
        description,
        start_time: start_time ? new Date(start_time) : undefined,
        end_time: end_time ? new Date(end_time) : undefined,
      },
    });


    if (updatedResult.count === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied or task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      affectedRows: updatedResult.count,
    });
  } catch (error) {
    console.error("UpdateTask Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

// delete //
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;  
    const userId = req.user?.id; 

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const deleteResult = await prisma.task.deleteMany({
      where: {
        id: Number(id),
        user_id: Number(userId), 
      },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you don't have permission to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      affectedRows: deleteResult.count,
    });

  } catch (error) {
    console.error("DeleteTask Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

export default {
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
