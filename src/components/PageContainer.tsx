'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PageContainerProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function PageContainer({ children, title, subtitle }: PageContainerProps): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl w-full">
        {(title || subtitle) && (
          <CardHeader className="">
            {title ? <CardTitle className="text-2xl">{title}</CardTitle> : null}
            {subtitle ? <CardDescription className="">{subtitle}</CardDescription> : null}
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}