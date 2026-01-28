import React, { useState } from "react";
import "../styles/Blog.css";

function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const blogPosts = [
    {
      id: 1,
      category: "corporate",
      title: "Driven by Inventive Ideas: A Story of Colin Lam...",
      excerpt: "Wholeheartedly embracing creativity and actively putting it into practice can unlock pathwa...",
      image: "/article1.png",
      date: "Oct 27, 2023",
      readTime: "4 min read",
      author: "Phoebe Yen",
    },
    {
      id: 2,
      category: "growth",
      title: "How Hobbies Can Boost Your Personal Value and Why...",
      excerpt: "In the journey of self-discovery and professional advancement, the concept of \"identity capita...",
      image: "/article2.png",
      date: "Sep 13, 2023",
      readTime: "2 min read",
      author: "Phoebe Yen",
    },
    {
      id: 3,
      category: "growth",
      title: "Embarking on A Remarkable Journey of Self-Discovery With...",
      excerpt: "Whether it's the thrill of mastering a new skill, the excitement of exploring uncharted territor...",
      image: "/article3.png",
      date: "Aug 6, 2023",
      readTime: "3 min read",
      author: "Phoebe Yen",
    },
    {
      id: 4,
      category: "corporate",
      title: "The Silent Challenge of Quiet-Quitting and the Power of...",
      excerpt: "In the bustling world of corporate environments, there's a hidden issue that often goes...",
      image: "/article4.png",
      date: "Jul 25, 2023",
      readTime: "2 min read",
      author: "Phoebe Yen",
    },
    {
      id: 5,
      category: "growth",
      title: "Beyond Work and Home: The Significance of Third...",
      excerpt: "Rediscover the magic of 'third places' for stronger communities. Explore how hobbies...",
      image: "/article5.png",
      date: "Jul 18, 2023",
      readTime: "2 min read",
      author: "Phoebe Yen",
    },
    {
      id: 6,
      category: "growth",
      title: "From Crags to Confidence: How Indoor Climbing Shapes...",
      excerpt: "Indoor bouldering blends physical training, mental focus, and social connection...",
      image: "/bouldering.jpg",
      date: "Nov 18, 2024",
      readTime: "7 min read",
      author: "Alex Rodriguez",
    }
  ];

  const categories = [
    { id: "all", label: "All Articles", icon: "📚" },
    { id: "growth", label: "Growth", icon: "🌱" },
    { id: "corporate", label: "Corporate", icon: "💼" },
  ];

  const filteredPosts = selectedCategory === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <div className="blog-hero">
        <h1 className="title">Hobby Insights & Stories</h1>
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
