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

export type ExpenseRecord = {
    id?: number;
    amount: number;
    description: string;
    includeInTotal: boolean;
    created_at?: Date;
};

export type IncomeRecord = {
    id?: number;
    amount: number;
    description: string;
    created_at?: Date;
};

export type DueRecord = {
    id?: number;
    amount: number;
    description: string;
    person: string;
    isPaid: boolean;
    isOptional: boolean;
    created_at?: Date;
};
