import React, { useState } from "react";
import "../styles/Blog.css";

function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const blogPosts = [
    {
      id: 1,
      category: "fitness",
      title: "5 Beginner-Friendly Workouts to Start Your Fitness Journey",
      excerpt: "Discover easy exercises you can do at home to kickstart your fitness goals...",
      image: "/hiking.jpg",
      date: "Dec 1, 2024",
      readTime: "5 min read",
      author: "Sarah Chen",
      content: "Whether you're new to fitness or getting back into it after a break, starting with the right exercises makes all the difference..."
    },
    {
      id: 2,
      category: "music",
      title: "How to Choose the Right Musical Instrument for You",
      excerpt: "A comprehensive guide to finding the perfect instrument that matches your style...",
      image: "/guitar.jpg",
      date: "Nov 28, 2024",
      readTime: "7 min read",
      author: "Marcus Lee",
      content: "With so many instruments available, it can be overwhelming to choose one. Let's break it down..."
    },
    {
      id: 3,
      category: "outdoor",
      title: "Best Hiking Trails for Nature Lovers in Your Area",
      excerpt: "Explore stunning trails suitable for all skill levels with breathtaking views...",
      image: "/beachvolleyball.jpg",
      date: "Nov 25, 2024",
      readTime: "6 min read",
      author: "Emily Park",
      content: "Nature has a way of rejuvenating our spirits. Here are the best local hiking trails..."
    },
    {
      id: 4,
      category: "art",
      title: "Digital Art Basics: Creating Your First Digital Masterpiece",
      excerpt: "Learn the fundamentals of digital art and what tools you need to get started...",
      image: "/table-tennis.jpg",
      date: "Nov 22, 2024",
      readTime: "8 min read",
      author: "Jessica Wong",
      content: "Digital art is more accessible than ever. Here's how to start your creative journey..."
    },
    {
      id: 5,
      category: "sports",
      title: "Mastering Table Tennis: Tips from Professional Players",
      excerpt: "Improve your game with expert techniques and training strategies...",
      image: "/bouldering.jpg",
      date: "Nov 20, 2024",
      readTime: "6 min read",
      author: "David Tan",
      content: "Table tennis isn't just about hitting the ball. Here are professional techniques..."
    },
    {
      id: 6,
      category: "adventure",
      title: "Indoor Rock Climbing: A Thrilling Way to Build Strength",
      excerpt: "Discover the benefits of bouldering and how to safely climb indoors...",
      image: "/Hike.jpg",
      date: "Nov 18, 2024",
      readTime: "7 min read",
      author: "Alex Rodriguez",
      content: "Bouldering combines strength, problem-solving, and adventure in one amazing activity..."
    }
  ];

  const categories = [
    { id: "all", label: "All Articles", icon: "📚" },
    { id: "fitness", label: "Fitness", icon: "💪" },
    { id: "music", label: "Music", icon: "🎵" },
    { id: "outdoor", label: "Outdoor", icon: "🏕️" },
    { id: "art", label: "Art", icon: "🎨" },
    { id: "sports", label: "Sports", icon: "⚽" },
    { id: "adventure", label: "Adventure", icon: "🧗" }
  ];

  const filteredPosts = selectedCategory === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <div className="blog-hero">
        <h1 className="blog-hero-title">Hobby Insights & Stories</h1>
        <p className="blog-hero-subtitle">Discover tips, tricks, and inspiring stories from our community</p>
      </div>

      {/* Category Filter */}
      <div className="blog-categories">
        <div className="categories-container">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="blog-container">
        <div className="blog-posts-grid">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <div key={post.id} className="blog-card">
                <div className="blog-card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="blog-card-overlay">
                    <button className="read-more-btn">Read More →</button>
                  </div>
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="blog-date">{post.date}</span>
                    <span className="blog-read-time">{post.readTime}</span>
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-footer">
                    <span className="blog-author">By {post.author}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts">
              <p>No articles found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Section */}
      <div className="featured-section">
        <h2>Featured Article</h2>
        <div className="featured-card">
          <div className="featured-image">
            <img src="/guitar.jpg" alt="Featured" />
          </div>
          <div className="featured-content">
            <span className="featured-badge">⭐ Featured</span>
            <h3>The Ultimate Guide to Finding Your Perfect Hobby</h3>
            <p>
              Starting a new hobby can transform your life. In this comprehensive guide, we explore 
              how to identify hobbies that align with your personality, skills, and lifestyle. Learn 
              from experts and community members about their journey in discovering their passion.
            </p>
            <button className="featured-btn">Explore Now</button>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section">
        <h2>Stay Updated</h2>
        <p>Get the latest hobby tips and inspiring stories delivered to your inbox</p>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email..." className="newsletter-input" />
          <button className="newsletter-btn">Subscribe</button>
        </div>
      </div>
    </div>
  );
}

export default Blog;
