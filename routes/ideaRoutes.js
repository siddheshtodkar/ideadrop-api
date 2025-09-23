import { Router } from "express";

const router = Router()

// @route         GET /api/ideas
// @description   Get all ideas
// @access        public
router.get('/', (req, res) => {
  res.json({})
})

export default router