import type { CollectionEntry } from "astro:content";

// Smart and dynamic similar posts selector
const similerItems = (
  currentItem: CollectionEntry<"posts">,
  allItems: CollectionEntry<"posts">[],
  slugOrId?: string
) => {
  const currentId =
    currentItem.id || (currentItem as any).slug || slugOrId || "";
  const currentCategories = currentItem.data?.categories || [];
  const currentTags = currentItem.data?.tags || [];

  // Exclude current post
  const candidatePosts = allItems.filter(
    (item) => (item.id || (item as any).slug) !== currentId
  );

  if (candidatePosts.length === 0) return [];

  // Calculate relevance score for each candidate
  const scoredPosts = candidatePosts.map((post) => {
    let score = 0;
    const postCategories = post.data?.categories || [];
    const postTags = post.data?.tags || [];

    // Category match (+3 points per match)
    postCategories.forEach((cat) => {
      if (
        currentCategories.some(
          (c) => c.toLowerCase() === cat.toLowerCase()
        )
      ) {
        score += 3;
      }
    });

    // Tag match (+2 points per match)
    postTags.forEach((tag) => {
      if (currentTags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        score += 2;
      }
    });

    return {
      post,
      score,
    };
  });

  // Sort by score descending (if equal, preserved or date sorted)
  scoredPosts.sort((a, b) => b.score - a.score);

  return scoredPosts.map((item) => item.post);
};

export default similerItems;

