import { useEffect, useState } from 'react'
import axios from '../api/axiosConfig' //  RIGHT: Uses your token header configuration
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000')

export default function Community() {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [commentText, setCommentText] = useState({})
  
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {})

  useEffect(() => {
    fetchPosts()

    socket.on('post_created', (newPost) => {
      setPosts((prev) => {
        // Prevent duplication check: does this post ID already exist in our UI array?
        const exists = prev.some(post => post._id === newPost._id);
        if (exists) return prev; 
        
        // Put the newest post at the very top of the feed array cleanly
        return [newPost, ...prev]; 
      });
    });

    return () => {
      socket.off('post_created');
    };
    
  }, [])

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('/api/posts')
      // If your backend sends an array directly: res.send([post1, post2])
      setPosts(data) 
      
      // OR if your backend sends an object: res.send({ success: true, posts: [] })
      // setPosts(data.posts) 
    } catch (err) {
      console.error(err)
    }
  }

  const createPost = async () => {
    if (!content.trim()) return
    socket.emit('new_post', { content, sender: user.id })
    setContent('')
  }

  const addComment = async (postId) => {
    if (!commentText[postId]?.trim()) return
    try {
      await axios.post(`/api/posts/${postId}/comment`, { text: commentText[postId] })
      setCommentText({ ...commentText, [postId]: '' })
      fetchPosts()
    } catch (err) {
      toast.error('Error commenting')
    }
  }

  return (
    <div>
      <h2>Community</h2>

      {/* Create post */}
      <div>
        <textarea
          placeholder="Share something..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button onClick={createPost}>Post</button>
      </div>

      {/* Add ', i' here to capture the array index loop fallback */}
      {posts?.map((post, i) => (
        // Use post._id, but fall back to the index 'i' if the database entry is missing an ID
        <div key={post._id || i}>
          <p><strong>{post.author?.name}</strong> · {post.author?.role}</p>
          <p>{post.content}</p>

          {/* Comments */}
          <div>
            {post.comments?.map((c, idx) => (
              <p key={idx}><strong>{c.author?.name || 'User'}:</strong> {c.text}</p>
            ))}
          </div>

          {/* Add comment */}
          <input
            placeholder="Write a comment..."
            value={commentText[post._id] || ''}
            onChange={e => setCommentText({ ...commentText, [post._id]: e.target.value })}
          />
          <button onClick={() => addComment(post._id)}>Comment</button>
        </div>
      ))}
    </div>
  )
}