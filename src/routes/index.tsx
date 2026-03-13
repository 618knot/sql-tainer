import { createFileRoute, Link } from '@tanstack/react-router'
import { questions } from '../lib/questions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">SQL 学習へようこそ！</h1>
      <p className="text-gray-600 mb-8">ブラウザ上でSQLを書いて実行できる学習アプリです。好きな問題を選んで挑戦しましょう。</p>

      <div className="grid gap-4 md:grid-cols-2">
        {questions.map((q) => (
          <Link key={q.id} to={`/question/${q.id}`} className="block hover:opacity-80 transition-opacity">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{q.title}</CardTitle>
                  <Badge variant={q.difficulty === 'EASY' ? 'secondary' : 'destructive'}>
                    {q.difficulty}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {q.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
