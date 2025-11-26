export enum DocType {
  DOCX = 'DOCX',
  PPTX = 'PPTX'
}

export enum SectionStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  REFINING = 'REFINING'
}

export interface Comment {
  id: string;
  text: string;
  timestamp: number;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  status: SectionStatus;
  feedback: 'like' | 'dislike' | null;
  comments: Comment[];
}

export interface Project {
  id: string;
  name: string;
  topic: string;
  type: DocType;
  createdAt: number;
  updatedAt: number;
  sections: Section[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}