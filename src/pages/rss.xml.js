import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const [blogPosts, libraryPosts] = await Promise.all([
    getCollection("blog", ({ data }) => !data.draft),
    getCollection("library", ({ data }) => !data.draft),
  ]);

  const posts = [
    ...blogPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
    ...libraryPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      link: `/library/${post.id}/`,
    })),
  ]
    .filter((post) => post.pubDate !== undefined)
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts,
  });
}
