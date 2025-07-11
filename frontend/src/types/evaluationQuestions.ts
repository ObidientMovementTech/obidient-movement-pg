
export interface Option {
  label: string;
  value: number;
}

export interface Question {
  text: string;
  options: Option[];
}

export interface Section {
  subgroup: string;
  weight: number;
  questions: Question[];
}

export interface EvaluationCategory {
  title: string;
  maxScore: number;
  sections: Section[];
}

export interface EvaluationData {
  capacity: EvaluationCategory;
  competence: EvaluationCategory;
  character: EvaluationCategory;
}
