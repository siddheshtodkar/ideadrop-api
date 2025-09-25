import { Router } from "express";
import Idea from "../models/idea.js";
import mongoose from "mongoose";

const router = Router()

// @route         GET /api/ideas
// @description   Get all ideas
// @access        public
router.get('/', async (req, res, next) => {
  try {
    const ideas = await Idea.find()
    res.json(ideas)
  } catch (error) {
    next(error)
  }
})

// @route         GET /api/ideas/:id
// @description   Get single ideas
// @access        public
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404)
      throw new Error('Idea Not Found')
    }
    const idea = await Idea.findById(id)
    if (!idea) {
      res.status(404)
      throw new Error('Idea Not Found')
    }
    res.json(idea)
  } catch (error) {
    next(error)
  }
})

// @route         POST /api/ideas
// @description   Create new idea
// @access        public
router.post('/', async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400)
      throw new Error('title, summary and description are required')
    }
    const newIdea = new Idea({
      title,
      summary,
      description,
      tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : (Array.isArray(tags) ? tags : [])
    })
    const savedIdea = await newIdea.save()
    res.status(201).json(savedIdea)
  } catch (error) {
    next(error)
  }
})

export default router