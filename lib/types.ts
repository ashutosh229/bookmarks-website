export type Bookmark = {
    id: string;
    url: string;
    title: string;
    status: "not_visited" | "visited" | "revisit";
    keywords: string[];
    comment: string;
};

export interface ExamRecord {
    id?: number;
    course: string;
    examType: string;
    marks: number;
    weightage: number;
    created_at?: Date;
}