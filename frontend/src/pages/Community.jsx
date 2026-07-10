import { useEffect, useState } from 'react'
import axios from '../api/axiosConfig' //  RIGHT: Uses your token header configuration
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'

const socket = io('http://localhost:5000')

export default function Community() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')))
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [commentText, setCommentText] = useState({})
  const [openComments, setOpenComments] = useState({})

  useEffect(() => {
    fetchPosts()

    socket.on('post_created', (post) => {
      setPosts(prev => [post, ...prev])
    })

    return () => socket.off('post_created')
  }, [])

  const fetchPosts = async () => {
    const { data } = await axios.get('/api/posts')
    setPosts(data)
  }

  const createPost = async () => {
    if (!content.trim()) return
    try {
      socket.emit('new_post', { content, sender: user.id })
      setContent('')
    } catch (err) {
      toast.error('Error posting')
    }
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

        {/* Posts */}
        {posts.length === 0 && (
          <p className="text-[#888888] text-sm text-center">No posts yet. Be the first.</p>
        )}

        {posts.map(post => (
          <div key={post._id} className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 flex flex-col gap-4">

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#e63946]/20 flex items-center justify-center text-[#e63946] text-sm font-semibold">
                {post.author?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-[#f1f1f1] text-sm font-medium">{post.author?.name}</p>
                <p className="text-[#888888] text-xs">{post.author?.role}</p>
              </div>
              <span className="ml-auto text-[#3a3a3a] text-xs">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Content */}
            <p className="text-[#f1f1f1] text-sm leading-relaxed">{post.content}</p>

            {/* Comments toggle */}
            <button
              onClick={() => toggleComments(post._id)}
              className="text-xs text-[#888888] hover:text-[#f1f1f1] transition-colors text-left"
            >
              {openComments[post._id] 
                ? 'Hide' 
                : `${post.comments?.length || 0} comment${post.comments?.length !== 1 ? 's' : ''}`
              }
            </button>

            {/* Comments section */}
            {openComments[post._id] && (
              <div className="flex flex-col gap-3 border-t border-[#1f1f1f] pt-3">
                {(!post.comments || post.comments.length === 0) && (
                  <p className="text-[#3a3a3a] text-xs">No comments yet.</p>
                )}
                {post.comments?.map((c, i) => (
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

                {/* Add comment */}
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
        ))}
      </div>
    </div>
  )
}