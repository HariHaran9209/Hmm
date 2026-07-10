import { useEffect, useState } from 'react'
import axios from '../api/axiosConfig' // ✓ FIX: Restored your custom configuration with JWT headers
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'

const socket = io(import.meta.env.VITE_API_URL)

export default function Community() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || { id: '', name: '', role: '' })
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [commentText, setCommentText] = useState({})
  const [openComments, setOpenComments] = useState({})

  useEffect(() => {
    fetchPosts()

    socket.on('post_created', (post) => {
      setPosts(prev => {
        if (prev.find(p => p._id === post._id)) return prev
        return [post, ...prev]
      })
    })

    socket.on('comment_added', (updatedPost) => {
      setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p))
    })

    return () => {
      socket.off('post_created')
      socket.off('comment_added')
    }
  }, [])

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('/api/posts')
      setPosts(data)
    } catch (err) {
      toast.error('Failed to load community posts')
    }
  }

  const createPost = () => {
    if (!content.trim()) return
    socket.emit('new_post', { content, sender: user.id })
    setContent('')
  }

  const addComment = (postId) => {
    if (!commentText[postId]?.trim()) return
    socket.emit('new_comment', { postId, authorId: user.id, text: commentText[postId] })
    setCommentText(prev => ({ ...prev, [postId]: '' }))
  }

  const toggleComments = (postId) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Create post */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 flex flex-col gap-3">
          <textarea
            placeholder="Share something with the community..."
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && createPost()}
            rows={3}
            className="bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] placeholder-[#3a3a3a] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e63946] transition-colors resize-none w-full"
          />
          <div className="flex justify-end">
            <button
              onClick={createPost}
              className="bg-[#e63946] hover:bg-[#c1121f] text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Post
            </button>
          </div>
        </div>

        {/* Posts Area */}
        {posts.length === 0 && (
          <p className="text-[#888888] text-sm text-center">No posts yet. Be the first.</p>
        )}

        {posts.map(post => {
          // Safeguard: Make sure comments array exists even if backend payload misses it
          const postComments = post.comments || [];
          
          return (
            <div key={post._id} className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 flex flex-col gap-4">

              {/* Author details */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e63946]/20 flex items-center justify-center text-[#e63946] text-sm font-semibold shrink-0">
                  {post.author?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-[#f1f1f1] text-sm font-medium">{post.author?.name || 'Anonymous'}</p>
                  <p className="text-[#888888] text-xs">{post.author?.role || 'user'}</p>
                </div>
                <span className="ml-auto text-[#3a3a3a] text-xs">
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                </span>
              </div>

              {/* Post Content */}
              <p className="text-[#f1f1f1] text-sm leading-relaxed">{post.content}</p>

              {/* Comments toggle counter */}
              <button
                onClick={() => toggleComments(post._id)}
                className="text-xs text-[#888888] hover:text-[#f1f1f1] transition-colors text-left w-max"
              >
                {openComments[post._id] 
                  ? 'Hide comments' 
                  : `${postComments.length} comment${postComments.length !== 1 ? 's' : ''}`
                }
              </button>

              {/* Comments block expansion */}
              {openComments[post._id] && (
                <div className="flex flex-col gap-3 border-t border-[#1f1f1f] pt-3">
                  {postComments.length === 0 && (
                    <p className="text-[#3a3a3a] text-xs">No comments yet.</p>
                  )}
                  {postComments.map((c, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[#888888] text-xs font-semibold shrink-0">
                        {c.author?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <span className="text-[#888888] text-xs font-medium">{c.author?.name || 'User'} </span>
                        <span className="text-[#f1f1f1] text-xs">{c.text}</span>
                      </div>
                    </div>
                  ))}

                  {/* Add comment action layout */}
                  <div className="flex gap-2 mt-1">
                    <input
                      placeholder="Write a comment..."
                      value={commentText[post._id] || ''}
                      onChange={e => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && addComment(post._id)}
                      className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] text-[#f1f1f1] placeholder-[#3a3a3a] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#e63946] transition-colors"
                    />
                    <button
                      onClick={() => addComment(post._id)}
                      className="bg-[#e63946] hover:bg-[#c1121f] text-white px-3 rounded-lg text-xs transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}