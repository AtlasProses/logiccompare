interface Env {
  DB: any;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
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
      .first();

    // 2. Rating avg and count
    const ratingResult = await context.env.DB.prepare(
      "SELECT AVG(value) as avg_rating, COUNT(*) as count FROM reactions WHERE post_slug = ? AND type = 'rating'"
    )
      .bind(slug)
      .first();

    // 2b. Rating breakdown by star
    const breakdownResult = await context.env.DB.prepare(
      "SELECT value, COUNT(*) as count FROM reactions WHERE post_slug = ? AND type = 'rating' GROUP BY value"
    )
      .bind(slug)
      .all();

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (breakdownResult?.results) {
      for (const row of (breakdownResult.results as any[])) {
        if (row.value >= 1 && row.value <= 5) {
          breakdown[row.value] = Number(row.count);
        }
      }
    }

    // 3. User specific reactions
    let userHasLiked = false;
    let userRating = 0;

    if (userId) {
      const userReactions = await context.env.DB.prepare(
        "SELECT type, value FROM reactions WHERE post_slug = ? AND user_id = ?"
      )
        .bind(slug, userId)
        .all();

      if (userReactions?.results) {
        for (const r of (userReactions.results as any[])) {
          if (r.type === "like") userHasLiked = true;
          if (r.type === "rating") userRating = r.value;
        }
      }
    }

    const likesCount = likesResult?.count ?? 0;
    const ratingCount = ratingResult?.count ?? 0;
    const ratingAvg = ratingResult?.avg_rating
      ? Number(Number(ratingResult.avg_rating).toFixed(1))
      : 5.0;

    return new Response(
      JSON.stringify({
        likesCount,
        ratingAvg,
        ratingCount,
        userHasLiked,
        userRating,
        breakdown,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to fetch reactions" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
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

    if (body.type === "rating" && (!body.value || body.value < 1 || body.value > 5)) {
      return new Response(JSON.stringify({ error: "Rating value must be between 1 and 5" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const value = body.type === "rating" ? body.value : null;

    await context.env.DB.prepare(
      `INSERT INTO reactions (post_slug, user_id, type, value, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(post_slug, user_id, type) 
       DO UPDATE SET value = excluded.value, created_at = CURRENT_TIMESTAMP`
    )
      .bind(body.post_slug, body.user_id, body.type, value)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to save reaction" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
