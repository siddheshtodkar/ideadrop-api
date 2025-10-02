import { Router } from "express";
import Idea from "../models/idea.js";
import mongoose from "mongoose";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router()

// @route         GET /api/ideas
// @description   Get all ideas
// @access        public
// @query         _limit (optional)
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit)
    const query = Idea.find().sort({ createdAt: -1 })
    if (!isNaN(limit))
      query.limit(limit)
    const ideas = await query.exec()
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
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body || {}
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

// @route         DELETE /api/ideas/:id
// @description   Delete ideas
// @access        public
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404)
      throw new Error('Idea Not Found')
    }
    const idea = await Idea.findByIdAndDelete(id)
    if (!idea) {
      res.status(404)
      throw new Error('Idea Not Found')
    }
    res.json({ 'message': 'Idea deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// @route         PUT /api/ideas/:id
// @description   Update ideas
// @access        public
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404)
      throw new Error('Idea Not Found')
    }
    const { title, summary, description, tags } = req.body || {}
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400)
      throw new Error('title, summary and description are required')
    }
    const updatedIdea = await Idea.findByIdAndUpdate(id, {
      title,
      summary,
      description,
      tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : (Array.isArray(tags) ? tags : [])
    }, { new: true, runValidators: true })
    if (!updatedIdea) {
      res.status(404)
      throw new Error('Idea Not Found')
    }
    res.json(updatedIdea)
  } catch (error) {
    next(error)
  }
})

export default router