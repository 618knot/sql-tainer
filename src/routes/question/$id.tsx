import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { client } from '@/db'
import { questionsMap } from '@/lib/questions'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Play, ArrowLeft } from 'lucide-react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { SchemaViewer, type SchemaInfo } from '@/components/question/SchemaViewer'

export const Route = createFileRoute('/question/$id')({
  component: QuestionPage,
})

function QuestionPage() {
  const { id } = Route.useParams()
  const question = questionsMap.get(id)

  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any[] | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // Expected result state
  const [expectedResult, setExpectedResult] = useState<any[] | null>(null)
  const [expectedColumns, setExpectedColumns] = useState<string[]>([])
  const [expectedError, setExpectedError] = useState<string | null>(null)

  // Schema state
  const [schemaInfo, setSchemaInfo] = useState<SchemaInfo[] | null>(null)
  const [schemaError, setSchemaError] = useState<string | null>(null)

  if (!question) {
    return <div className="p-8">問題が見つかりません。</div>
  }

  const loadSchema = async () => {
    if (!question.tables || question.tables.length === 0) {
      setSchemaInfo([])
      return
    }

    try {
      setSchemaError(null)
      const schemas = []
      for (const table of question.tables) {
        const res = await client.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [table])
        schemas.push({
          tableName: table,
          columns: res.rows as { column_name: string; data_type: string }[],
        })
      }
      setSchemaInfo(schemas)
    } catch {
      setSchemaError('スキーマ情報の読み込みに失敗しました。')
    }
  }

  const loadExpected = async () => {
    try {
      setExpectedError(null)
      const expectedRes = await client.query(question.expectedQuery)
      setExpectedResult(expectedRes.rows)
      if (expectedRes.rows.length > 0) {
        setExpectedColumns(Object.keys(expectedRes.rows[0] as object))
      }
      return expectedRes.rows
    } catch {
      setExpectedError('期待される結果の読み込みに失敗しました。')
      return null
    }
  }

  const executeQuery = async () => {
    try {
      setError(null)

      if (!query.trim()) {
         setError('クエリを入力してください。')
         setStatus('ERROR')
         setIsCorrect(null)
         return
      }

      const res = await client.query(query)

      if (res.rows.length > 0) {
        setColumns(Object.keys(res.rows[0] as object))
      } else {
        setColumns([])
      }

      setResult(res.rows)
      setStatus('SUCCESS')

      // 正誤判定ロジック
      const expectedRows = await loadExpected()

      if (!expectedRows) {
        setIsCorrect(null)
        return
      }

      // Compare lengths
      if (res.rows.length !== expectedRows.length) {
        setIsCorrect(false)
        return
      }

      // Deep compare
      const isMatch = JSON.stringify(res.rows) === JSON.stringify(expectedRows)
      setIsCorrect(isMatch)

    } catch (err: any) {
      console.error('SQL Execution Error:', err)
      setError('クエリの実行中にエラーが発生しました。SQL構文を確認してください。')
      setResult(null)
      setStatus('ERROR')
      setIsCorrect(null)
    }
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col p-4 bg-gray-50 max-w-7xl mx-auto w-full">
      <div className="mb-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline flex items-center mb-2 w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" />
          一覧へ戻る
        </Link>
        <h2 className="text-2xl font-bold">{question.title}</h2>
        <p className="text-gray-600 mt-2">{question.description}</p>
      </div>

      <ResizablePanelGroup orientation="vertical" className="flex-1 rounded-lg border bg-white shadow-sm overflow-hidden">
        <ResizablePanel defaultSize={50} className="flex flex-col relative">
          <div className="p-2 border-b bg-gray-50 flex justify-between items-center z-10">
            <span className="text-sm font-semibold text-gray-700 ml-2">SQL Editor</span>
            <Button size="sm" onClick={executeQuery} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Play className="w-4 h-4" /> 実行
            </Button>
          </div>
          <div className="flex-1 w-full h-full relative">
            <Editor
              height="100%"
              width="100%"
              defaultLanguage="sql"
              theme="vs-dark"
              value={query}
              onChange={(value) => setQuery(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 }
              }}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} className="flex flex-col bg-white overflow-hidden">
          <Tabs defaultValue="result" className="flex-1 flex flex-col">
            <div className="p-2 border-b bg-gray-50 flex items-center justify-between z-10">
              <TabsList className="h-8">
                <TabsTrigger value="result" className="text-xs px-3 py-1 h-6">あなたの結果</TabsTrigger>
                <TabsTrigger value="expected" onClick={() => {if (!expectedResult) loadExpected()}} className="text-xs px-3 py-1 h-6">期待される結果</TabsTrigger>
                <TabsTrigger value="schema" onClick={() => {if (!schemaInfo) loadSchema()}} className="text-xs px-3 py-1 h-6">スキーマ</TabsTrigger>
              </TabsList>

              {isCorrect !== null && status === 'SUCCESS' && (
                <span className={`text-sm font-bold px-3 py-1 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isCorrect ? '正解！ 🎉' : '不正解...'}
                </span>
              )}
            </div>

            <TabsContent value="result" className="flex-1 overflow-auto p-0 m-0 data-[state=active]:flex flex-col">
              <div className="p-4 flex-1">
                {status === 'ERROR' && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {status === 'SUCCESS' && result && (
                  result.length === 0 ? (
                    <div className="text-gray-500 italic p-4">0 rows returned</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map(col => (
                            <TableHead key={col} className="bg-gray-100 font-semibold">{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.map((row, i) => (
                          <TableRow key={i}>
                            {columns.map(col => (
                              <TableCell key={col}>{String(row[col])}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                )}

                {status === 'IDLE' && (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    クエリを実行して結果を確認してください
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="expected" className="flex-1 overflow-auto p-0 m-0 data-[state=active]:flex flex-col">
               <div className="p-4 flex-1">
                  {expectedError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {expectedError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {!expectedResult && !expectedError ? (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      読み込み中...
                    </div>
                  ) : expectedResult && expectedResult.length === 0 ? (
                    <div className="text-gray-500 italic p-4">0 rows returned</div>
                  ) : expectedResult ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {expectedColumns.map(col => (
                            <TableHead key={col} className="bg-gray-100 font-semibold">{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expectedResult.map((row, i) => (
                          <TableRow key={i}>
                            {expectedColumns.map(col => (
                              <TableCell key={col}>{String(row[col])}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : null}
               </div>
            </TabsContent>

            <TabsContent value="schema" className="flex-1 overflow-auto p-0 m-0 data-[state=active]:flex flex-col">
              <SchemaViewer schemaInfo={schemaInfo} schemaError={schemaError} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
