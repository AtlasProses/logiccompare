interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const slug = url.searchParams.get("slug");
  const userId = url.searchParams.get("userId") || "";

  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Likes count
    const likesResult = await context.env.DB.prepare(
      "SELECT COUNT(*) as count FROM reactions WHERE post_slug = ? AND type = 'like'"
    )
      .bind(slug)
      .first<{ count: number }>();

    // 2. Rating avg and count
    const ratingResult = await context.env.DB.prepare(
      "SELECT AVG(value) as avg_rating, COUNT(*) as count FROM reactions WHERE post_slug = ? AND type = 'rating'"
    )
      .bind(slug)
      .first<{ avg_rating: number | null; count: number }>();

    // 3. User specific reactions
    let userHasLiked = false;
    let userRating = 0;

    if (userId) {
      const userReactions = await context.env.DB.prepare(
        "SELECT type, value FROM reactions WHERE post_slug = ? AND user_id = ?"
      )
        .bind(slug, userId)
        .all<{ type: string; value: number }>();

      if (userReactions.results) {
        for (const r of userReactions.results) {
          if (r.type === "like") userHasLiked = true;
          if (r.type === "rating") userRating = r.value;
        }
      }
    }

    const likesCount = likesResult?.count ?? 0;
    const ratingCount = ratingResult?.count ?? 0;
    const ratingAvg = ratingResult?.avg_rating
      ? Number(ratingResult.avg_rating.toFixed(1))
      : 5.0;

    return new Response(
      JSON.stringify({
        likesCount,
        ratingAvg,
        ratingCount,
        userHasLiked,
        userRating,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch reactions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as {
      post_slug: string;
      user_id: string;
      type: "like" | "rating";
      value?: number;
    };

    if (!body.post_slug || !body.user_id || !body.type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const val = body.type === "rating" ? Math.min(5, Math.max(1, body.value || 5)) : 1;

    // Insert or update on conflict
    await context.env.DB.prepare(
      `INSERT INTO reactions (post_slug, user_id, type, value)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(post_slug, user_id, type)
       DO UPDATE SET value = excluded.value, created_at = CURRENT_TIMESTAMP`
    )
      .bind(body.post_slug, body.user_id, body.type, val)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to save reaction" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
