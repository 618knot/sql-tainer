import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle } from 'lucide-react'

export interface SchemaInfo {
  tableName: string
  columns: {
    column_name: string
    data_type: string
  }[]
}

interface SchemaViewerProps {
  schemaInfo: SchemaInfo[] | null
  schemaError: string | null
}

export function SchemaViewer({ schemaInfo, schemaError }: SchemaViewerProps) {
  return (
    <div className="p-4 flex-1">
      {schemaError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{schemaError}</AlertDescription>
        </Alert>
      )}
      {!schemaInfo && !schemaError ? (
        <div className="flex h-full items-center justify-center text-gray-400">
          読み込み中...
        </div>
      ) : schemaInfo && schemaInfo.length === 0 ? (
        <div className="text-gray-500 italic p-4">スキーマ情報がありません</div>
      ) : schemaInfo ? (
        <div className="space-y-6">
          {schemaInfo.map((table) => (
            <div key={table.tableName}>
              <h3 className="font-semibold text-gray-800 mb-2">{table.tableName}</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="bg-gray-100 font-semibold w-1/2">Column Name</TableHead>
                      <TableHead className="bg-gray-100 font-semibold w-1/2">Data Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.columns.map((col, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{col.column_name}</TableCell>
                        <TableCell className="text-gray-600">{col.data_type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
