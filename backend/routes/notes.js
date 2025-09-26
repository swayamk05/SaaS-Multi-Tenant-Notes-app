// backend/routes/notes.js
import express from "express";
import Note from "../models/Note.js";
import { protect, tenantAccess } from "../middleware/auth.js";
import checkNoteLimit from "../middleware/checkNoteLimit.js";

const router = express.Router();

// GET all notes for current tenant
router.get("/", protect, tenantAccess, async (req, res) => {
  try {
    const notes = await Note.find({ tenant: req.tenantId });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET a specific note by ID (must belong to tenant)
router.get("/:id", protect, tenantAccess, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE a note (enforce note limit for members)
router.post("/", protect, tenantAccess, checkNoteLimit, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content required" });

    const note = await Note.create({
      title,
      content,
      tenant: req.tenantId,
      createdBy: req.user._id,
    });

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE a note (only within tenant)
router.put("/:id", protect, tenantAccess, async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenantId },
      { title, content },
      { new: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found or not your tenant" });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a note (only within tenant)
router.delete("/:id", protect, tenantAccess, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, tenant: req.tenantId });
    if (!note) return res.status(404).json({ message: "Note not found or not your tenant" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
