import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createPost, getPost, addComment } from '../controllers/postController.js'

const router = Router()

router.post('/', auth, createPost)
router.get('/', auth, getPosts)
router.post('/:id/comment', auth, addComment)

export default router