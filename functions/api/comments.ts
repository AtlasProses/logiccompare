interface Env {
  DB: any;
}

interface CommentRow {
  id: number;
  post_slug: string;
  user_id: string;
  user_name: string;
  user_image: string | null;
  content: string;
  created_at: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const url = new URL(context.request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { results } = await context.env.DB.prepare(
      "SELECT id, post_slug, user_id, user_name, user_image, content, created_at FROM comments WHERE post_slug = ? ORDER BY id DESC"
    )
      .bind(slug)
      .all();

    return new Response(JSON.stringify({ comments: (results as CommentRow[]) || [] }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to fetch comments" }), {
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
      user_name: string;
      user_image?: string;
      content: string;
    };

    if (!body.post_slug || !body.user_id || !body.user_name || !body.content) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const content = body.content.trim();
    if (content.length === 0 || content.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Comment must be between 1 and 2000 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const user_image = body.user_image || null;

    const result = await context.env.DB.prepare(
      "INSERT INTO comments (post_slug, user_id, user_name, user_image, content) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(body.post_slug, body.user_id, body.user_name, user_image, content)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        id: result?.meta?.last_row_id,
        comment: {
          post_slug: body.post_slug,
          user_id: body.user_id,
          user_name: body.user_name,
          user_image,
          content,
          created_at: new Date().toISOString(),
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to post comment" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
