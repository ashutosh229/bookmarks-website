export type Bookmark = {
    id: string;
    url: string;
    title: string;
    status: "not_visited" | "visited" | "revisit";
    keywords: string[];
    comment: string;
};