import React, { useEffect, useState } from "react";

interface Comment {
  id?: number;
  post_slug: string;
  user_id: string;
  user_name: string;
  user_image?: string | null;
  content: string;
  created_at: string;
}

interface ClerkUser {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Props {
  postSlug: string;
}

export default function PostInteractions({ postSlug }: Props) {
  const [user, setUser] = useState<ClerkUser | null>(null);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [ratingAvg, setRatingAvg] = useState<number>(5.0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper for anonymous local user ID
  const getAnonymousId = () => {
    let anon = localStorage.getItem("lc_anon_id");
    if (!anon) {
      anon = "anon_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("lc_anon_id", anon);
    }
    return anon;
  };

  // Sync Clerk User
  useEffect(() => {
    const checkClerk = () => {
      const clerk = (window as any).Clerk;
      if (clerk && clerk.user) {
        setUser({
          id: clerk.user.id,
          name:
            clerk.user.fullName ||
            clerk.user.firstName ||
            clerk.user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            "Analyst",
          imageUrl: clerk.user.imageUrl || undefined,
        });
      } else {
        setUser(null);
      }
    };

    // Check immediately
    checkClerk();

    // Check on Clerk load & page transitions
    const handleClerkReady = () => checkClerk();
    window.addEventListener("clerk:loaded", handleClerkReady);
    document.addEventListener("astro:page-load", handleClerkReady);

    const clerk = (window as any).Clerk;
    if (clerk && clerk.addListener) {
      clerk.addListener(checkClerk);
    } else {
      const timer = setInterval(() => {
        const c = (window as any).Clerk;
        if (c) {
          checkClerk();
          if (c.addListener) {
            c.addListener(checkClerk);
            clearInterval(timer);
          }
        }
      }, 300);
      return () => {
        clearInterval(timer);
        window.removeEventListener("clerk:loaded", handleClerkReady);
        document.removeEventListener("astro:page-load", handleClerkReady);
      };
    }

    return () => {
      window.removeEventListener("clerk:loaded", handleClerkReady);
      document.removeEventListener("astro:page-load", handleClerkReady);
    };
  }, []);


  // Fetch initial Data from API (with LocalStorage fallback)
  useEffect(() => {
    const effectiveUserId = user ? user.id : getAnonymousId();

    // 1. Fetch Reactions
    fetch(`/api/reactions?slug=${encodeURIComponent(postSlug)}&userId=${encodeURIComponent(effectiveUserId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("API not reachable");
        return res.json();
      })
      .then((data) => {
        if (data.likesCount !== undefined) setLikesCount(data.likesCount);
        if (data.ratingAvg !== undefined) setRatingAvg(data.ratingAvg);
        if (data.ratingCount !== undefined) setRatingCount(data.ratingCount);
        if (data.userHasLiked !== undefined) setHasLiked(data.userHasLiked);
        if (data.userRating !== undefined) setUserRating(data.userRating);
      })
      .catch(() => {
        // LocalStorage Fallback
        const localLikes = parseInt(localStorage.getItem(`lc_likes_${postSlug}`) || "0", 10);
        const localHasLiked = localStorage.getItem(`lc_has_liked_${postSlug}`) === "true";
        const localRating = parseFloat(localStorage.getItem(`lc_rating_${postSlug}`) || "5.0");
        const localRatingCount = parseInt(localStorage.getItem(`lc_rating_count_${postSlug}`) || "0", 10);

        setLikesCount(localLikes);
        setHasLiked(localHasLiked);
        setRatingAvg(localRating);
        setRatingCount(localRatingCount);
      });

    // 2. Fetch Comments
    fetch(`/api/comments?slug=${encodeURIComponent(postSlug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("API not reachable");
        return res.json();
      })
      .then((data) => {
        if (data.comments) setComments(data.comments);
        setLoading(false);
      })
      .catch(() => {
        // LocalStorage Fallback
        const localComments = localStorage.getItem(`lc_comments_${postSlug}`);
        if (localComments) {
          try {
            setComments(JSON.parse(localComments));
          } catch (e) {
            setComments([]);
          }
        }
        setLoading(false);
      });
  }, [postSlug, user]);

  // Handle Like
  const handleLike = async () => {
    if (hasLiked) return;
    const effectiveUserId = user ? user.id : getAnonymousId();

    setLikesCount((prev) => prev + 1);
    setHasLiked(true);

    // Save locally
    localStorage.setItem(`lc_likes_${postSlug}`, (likesCount + 1).toString());
    localStorage.setItem(`lc_has_liked_${postSlug}`, "true");

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_slug: postSlug,
          user_id: effectiveUserId,
          type: "like",
        }),
      });
    } catch (err) {
      console.warn("D1 reactions sync deferred to local storage", err);
    }
  };

  // Handle Star Rating
  const handleRating = async (ratingVal: number) => {
    const effectiveUserId = user ? user.id : getAnonymousId();
    setUserRating(ratingVal);
    
    const newCount = ratingCount + 1;
    const newAvg = Number(((ratingAvg * ratingCount + ratingVal) / newCount).toFixed(1));
    setRatingAvg(newAvg);
    setRatingCount(newCount);

    // Save locally
    localStorage.setItem(`lc_rating_${postSlug}`, newAvg.toString());
    localStorage.setItem(`lc_rating_count_${postSlug}`, newCount.toString());

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_slug: postSlug,
          user_id: effectiveUserId,
          type: "rating",
          value: ratingVal,
        }),
      });
    } catch (err) {
      console.warn("D1 rating sync deferred to local storage", err);
    }
  };

  // Handle Sign In Click
  const handleSignIn = () => {
    // 1. Try direct Clerk SDK
    const clerk = (window as any).Clerk;
    if (clerk && typeof clerk.openSignIn === "function") {
      clerk.openSignIn();
      return;
    }

    // 2. Try DOM trigger buttons
    const triggerBtn = (document.getElementById("clerk-sign-in-trigger-hidden") ||
      document.querySelector("button[data-clerk-sign-in-button]") ||
      document.querySelector(".clerk-sign-in-btn")) as HTMLElement;

    if (triggerBtn) {
      triggerBtn.click();
      return;
    }

    // 3. Polling fallback if Clerk is still initializing
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const c = (window as any).Clerk;
      if (c && typeof c.openSignIn === "function") {
        c.openSignIn();
        clearInterval(interval);
      } else if (attempts > 15) {
        clearInterval(interval);
      }
    }, 200);
  };


  // Handle Comment Submission
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    if (!user) {
      handleSignIn();
      return;
    }

    setIsSubmitting(true);
    const newComment: Comment = {
      post_slug: postSlug,
      user_id: user.id,
      user_name: user.name,
      user_image: user.imageUrl || null,
      content: commentText.trim(),
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentText("");

    // Local fallback
    localStorage.setItem(`lc_comments_${postSlug}`, JSON.stringify(updated));

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });
      if (!res.ok) throw new Error("Failed to persist to D1");
    } catch (err) {
      console.warn("Comment saved locally, D1 sync deferred", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="w-full">
      {/* 1. Rate this article & Show some love Box */}
      <div className="bg-light/60 border border-border rounded-2xl p-6 sm:p-8 mb-12 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Rate This Article */}
          <div className="sm:border-r sm:border-border sm:pr-6 text-center sm:text-left">
            <h4 className="font-bold text-dark text-base mb-2">Rate this article</h4>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <div
                className="flex text-amber-400 text-2xl cursor-pointer gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className={`transition transform hover:scale-125 select-none ${
                      (hoverRating || userRating || Math.round(ratingAvg)) >= star
                        ? "text-amber-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="font-bold text-dark text-lg ml-1">
                {ratingAvg.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-text">
              {ratingCount > 0
                ? `${ratingCount} ${ratingCount === 1 ? "person" : "people"} rated this article`
                : "Be the first to rate this article"}
            </p>
          </div>

          {/* Show Some Love (Like Counter) */}
          <div className="text-center sm:pl-6 flex flex-col items-center justify-center">
            <h4 className="font-bold text-dark text-base mb-2">Show some love</h4>
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`group flex flex-col items-center justify-center p-3 rounded-full transition duration-300 active:scale-95 ${
                hasLiked ? "cursor-default" : "hover:bg-white cursor-pointer"
              }`}
              title={hasLiked ? "You loved this post" : "Love this post"}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition shadow-inner ${
                  hasLiked
                    ? "bg-red-500 text-white scale-110 shadow-red-200 shadow-lg"
                    : "bg-red-50 text-red-500 group-hover:scale-110"
                }`}
              >
                ♥
              </div>
              <span
                className={`text-xs font-bold mt-2 ${
                  hasLiked ? "text-red-500" : "text-dark"
                }`}
              >
                {likesCount} {likesCount === 1 ? "Like" : "Likes"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Community Comments Box */}
      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 mb-16 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <h3 className="text-xl font-bold text-dark flex items-center gap-2">
            Community Comments
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
              {comments.length}
            </span>
          </h3>
        </div>

        {/* Auth / Submission Section */}
        <div className="bg-light/70 border border-border rounded-xl p-5 mb-8">
          {!user ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h5 className="font-bold text-dark text-sm mb-1">
                  Join the conversation
                </h5>
                <p className="text-xs text-text">
                  Sign in with Google, X (Twitter), or Email to share your insights, benchmarks, and join the discussion.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignIn}
                className="btn btn-primary text-xs px-5 py-2.5 rounded-xl font-bold shadow hover:scale-105 transition flex-shrink-0 cursor-pointer"
              >
                Sign In to Comment
              </button>
            </div>
          ) : (
            <form onSubmit={handlePostComment}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-primary/30"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-bold text-dark text-xs">{user.name}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verified Member
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="form-textarea w-full rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm p-3.5 bg-white shadow-inner resize-none"
                  rows={3}
                  placeholder="Share your perspective, data points, or questions on this comparison..."
                  required
                ></textarea>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="btn btn-primary text-xs px-5 py-2.5 rounded-xl font-bold shadow hover:scale-105 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment, idx) => (
              <div
                key={comment.id || idx}
                className="flex gap-4 p-4 rounded-xl bg-light/30 border border-border/60 hover:bg-light/60 transition"
              >
                {comment.user_image ? (
                  <img
                    src={comment.user_image}
                    alt={comment.user_name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm border border-border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-sm">
                    {comment.user_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-dark text-sm">
                      {comment.user_name}
                    </span>
                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Verified Analyst
                    </span>
                    <span className="text-xs text-text/70 ml-auto">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-dark/90 text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-text/70 bg-light/30 rounded-xl border border-dashed border-border/80">
            <p className="font-semibold text-sm text-dark">No comments yet</p>
            <p className="text-xs mt-1">
              Be the first to share your insights or analysis on this topic!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
