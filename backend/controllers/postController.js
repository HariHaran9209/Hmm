import Post from '../models/Post.js'

export const createPost = async (req, res) => {
    try {
    const post = await Post.create({ author: req.user.id, content: req.body.content })
    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name role')
      .populate('comments.author', 'name')
      .sort({ createdAt: -1 })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    post.comments.push({ author: req.user.id, text: req.body.text })
    await post.save()

    res.json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}