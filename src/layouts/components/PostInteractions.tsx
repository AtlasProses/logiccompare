import React, { useEffect, useState } from "react";
import { $clerkStore, $userStore } from "@clerk/astro/client";

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
  const [ratingBreakdown, setRatingBreakdown] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Sync Clerk User from Clerk Store & Global window.Clerk
  useEffect(() => {
    const syncUser = (clerkUser: any) => {
      if (clerkUser) {
        setUser({
          id: clerkUser.id,
          name:
            clerkUser.fullName ||
            clerkUser.firstName ||
            clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            "Analyst",
          imageUrl: clerkUser.imageUrl || undefined,
        });
      } else {
        setUser(null);
      }
    };

    // 1. Nanostores listener
    const unsubUser = $userStore.subscribe((clerkUser) => {
      syncUser(clerkUser);
    });

    // 2. Direct Window Clerk listener fallback
    if (typeof window !== "undefined") {
      const checkGlobalClerk = () => {
        const globalClerk = (window as any).Clerk;
        if (globalClerk && globalClerk.user) {
          syncUser(globalClerk.user);
        }
      };
      checkGlobalClerk();
      window.addEventListener("load", checkGlobalClerk);
      return () => {
        unsubUser();
        window.removeEventListener("load", checkGlobalClerk);
      };
    }

    return () => {
      unsubUser();
    };
  }, []);

  // Fetch initial Data from API (with LocalStorage fallback)
  useEffect(() => {
    const effectiveUserId = user ? user.id : "";

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
        if (data.breakdown) setRatingBreakdown(data.breakdown);
      })
      .catch(() => {
        // LocalStorage Fallback
        const localLikes = parseInt(localStorage.getItem(`lc_likes_${postSlug}`) || "0", 10);
        const localRating = parseFloat(localStorage.getItem(`lc_rating_${postSlug}`) || "5.0");
        const localRatingCount = parseInt(localStorage.getItem(`lc_rating_count_${postSlug}`) || "0", 10);
        const localBreakdown = localStorage.getItem(`lc_breakdown_${postSlug}`);

        setLikesCount(localLikes);
        setRatingAvg(localRating);
        setRatingCount(localRatingCount);

        if (localBreakdown) {
          try {
            setRatingBreakdown(JSON.parse(localBreakdown));
          } catch (e) {}
        }

        if (user) {
          const userHasLiked = localStorage.getItem(`lc_has_liked_${user.id}_${postSlug}`) === "true";
          const userSavedRating = parseInt(localStorage.getItem(`lc_user_rating_${user.id}_${postSlug}`) || "0", 10);
          setHasLiked(userHasLiked);
          setUserRating(userSavedRating);
        }
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

  // Handle Sign In Click (100% Guaranteed Modal & Portal Fallback)
  const handleSignIn = () => {
    setAuthLoading(true);
    const globalClerk = typeof window !== "undefined" ? (window as any).Clerk : null;
    const storeClerk = $clerkStore.get();
    const clerk = globalClerk || storeClerk;

    if (clerk && typeof clerk.openSignIn === "function") {
      try {
        clerk.openSignIn();
        setAuthLoading(false);
        return;
      } catch (e) {
        console.warn("Clerk modal error, redirecting to accounts portal...", e);
      }
    }

    // Direct redirection fallback to verified accounts subdomain
    window.location.href = `https://accounts.logiccompare.com/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
  };

  // Handle Sign Out Click
  const handleSignOut = async () => {
    const globalClerk = typeof window !== "undefined" ? (window as any).Clerk : null;
    const clerk = globalClerk || $clerkStore.get();
    if (clerk && typeof clerk.signOut === "function") {
      await clerk.signOut();
      setUser(null);
      setHasLiked(false);
      setUserRating(0);
    } else {
      window.location.href = `https://accounts.logiccompare.com/sign-out?redirect_url=${encodeURIComponent(window.location.href)}`;
    }
  };

  // Handle Like (Requires Clerk Login - Anti-Bot Protected)
  const handleLike = async () => {
    if (!user) {
      handleSignIn();
      return;
    }
    if (hasLiked) return;

    setLikesCount((prev) => prev + 1);
    setHasLiked(true);

    // Save locally for this verified user
    localStorage.setItem(`lc_likes_${postSlug}`, (likesCount + 1).toString());
    localStorage.setItem(`lc_has_liked_${user.id}_${postSlug}`, "true");

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_slug: postSlug,
          user_id: user.id,
          type: "like",
        }),
      });
    } catch (err) {
      console.warn("D1 reactions sync deferred to local storage", err);
    }
  };

  // Handle Star Rating (Requires Clerk Login - Anti-Bot Protected)
  const handleRating = async (ratingVal: number) => {
    if (!user) {
      handleSignIn();
      return;
    }
    
    const isFirstTime = userRating === 0;
    const newCount = isFirstTime ? ratingCount + 1 : ratingCount;
    const newAvg = isFirstTime
      ? Number(((ratingAvg * ratingCount + ratingVal) / newCount).toFixed(1))
      : Number(((ratingAvg * ratingCount - userRating + ratingVal) / newCount).toFixed(1));

    // Update Breakdown
    const updatedBreakdown = { ...ratingBreakdown };
    if (userRating > 0 && updatedBreakdown[userRating] > 0) {
      updatedBreakdown[userRating] -= 1;
    }
    updatedBreakdown[ratingVal] = (updatedBreakdown[ratingVal] || 0) + 1;

    setUserRating(ratingVal);
    setRatingAvg(newAvg);
    setRatingCount(newCount);
    setRatingBreakdown(updatedBreakdown);

    // Save locally for this verified user
    localStorage.setItem(`lc_rating_${postSlug}`, newAvg.toString());
    localStorage.setItem(`lc_rating_count_${postSlug}`, newCount.toString());
    localStorage.setItem(`lc_breakdown_${postSlug}`, JSON.stringify(updatedBreakdown));
    localStorage.setItem(`lc_user_rating_${user.id}_${postSlug}`, ratingVal.toString());

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_slug: postSlug,
          user_id: user.id,
          type: "rating",
          value: ratingVal,
        }),
      });
    } catch (err) {
      console.warn("D1 rating sync deferred to local storage", err);
    }
  };

  // Handle Comment Submission (Requires Clerk Login)
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
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <h4 className="font-bold text-dark text-base">Rate this article</h4>
              {!user && (
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  Sign in to rate
                </span>
              )}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
              <div
                className="flex text-amber-400 text-2xl cursor-pointer gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className={`transition transform hover:scale-125 select-none cursor-pointer ${
                      (hoverRating || userRating || Math.round(ratingAvg)) >= star
                        ? "text-amber-400"
                        : "text-gray-300"
                    }`}
                    title={user ? `Rate ${star} stars` : "Sign in with Google or Email to rate"}
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
                ? `${ratingCount} ${ratingCount === 1 ? "person" : "people"} rated this`
                : "0 people rated this"}
            </p>
            {/* Star Breakdown (5 Stars: X, 4 Stars: Y, 3 Stars: Z, 2 Stars: W, 1 Star: V) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1 text-xs font-semibold mt-2">
              <span className="text-amber-500">
                5 Stars: <span className="font-bold">{ratingBreakdown[5] || 0}</span>
              </span>
              <span className="text-emerald-500">
                4 Stars: <span className="font-bold">{ratingBreakdown[4] || 0}</span>
              </span>
              <span className="text-sky-500">
                3 Stars: <span className="font-bold">{ratingBreakdown[3] || 0}</span>
              </span>
              <span className="text-orange-500">
                2 Stars: <span className="font-bold">{ratingBreakdown[2] || 0}</span>
              </span>
              <span className="text-rose-500">
                1 Star: <span className="font-bold">{ratingBreakdown[1] || 0}</span>
              </span>
            </div>
          </div>

          {/* Show Some Love (Like Counter) */}
          <div className="text-center sm:pl-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-dark text-base">Show some love</h4>
              {!user && (
                <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded-full">
                  Sign in to like
                </span>
              )}
            </div>
            <button
              onClick={handleLike}
              disabled={hasLiked && !!user}
              className={`group flex flex-col items-center justify-center p-3 rounded-full transition duration-300 active:scale-95 cursor-pointer ${
                hasLiked && user ? "cursor-default opacity-90" : "hover:bg-white"
              }`}
              title={
                !user
                  ? "Sign in with Google or Email to like"
                  : hasLiked
                  ? "You loved this post"
                  : "Love this post"
              }
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition shadow-inner ${
                  hasLiked && user
                    ? "bg-red-500 text-white scale-110 shadow-red-200 shadow-lg"
                    : "bg-red-50 text-red-500 group-hover:scale-110"
                }`}
              >
                ♥
              </div>
              <span
                className={`text-xs font-bold mt-2 ${
                  hasLiked && user ? "text-red-500 font-extrabold" : "text-dark"
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
                disabled={authLoading}
                className="btn btn-primary text-xs px-5 py-2.5 rounded-xl font-bold shadow hover:scale-105 transition flex-shrink-0 cursor-pointer flex items-center gap-2"
              >
                {authLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Connecting...
                  </>
                ) : (
                  "Sign In to Comment"
                )}
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
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs text-text/70 hover:text-red-500 font-medium transition cursor-pointer"
                >
                  Sign Out
                </button>
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
