import { Category } from '../categories/category.model';

export interface FAQ {
  answerGEO: string;
  answerENG?: string;
  answerRUS?: string;
  category: Category;
  id: number;
  questionGEO: string;
  questionENG?: string;
  questionRUS?: string;
  sortIndex: number;
  urlSlug: string;
}
