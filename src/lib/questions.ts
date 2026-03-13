export interface Question {
  id: string
  title: string
  description: string
  expectedQuery: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export const questions: Question[] = [
  {
    id: '1',
    title: 'IT部門の従業員一覧',
    description: 'IT部門（department_id = 1）に所属するすべての従業員の情報を取得してください。',
    expectedQuery: 'SELECT * FROM employees WHERE department_id = 1;',
    difficulty: 'EASY',
  },
  {
    id: '2',
    title: '全従業員の名前と給与',
    description: 'すべての従業員の名前(name)と給与(salary)を取得し、給与が高い順に並び替えてください。',
    expectedQuery: 'SELECT name, salary FROM employees ORDER BY salary DESC;',
    difficulty: 'EASY',
  },
]
