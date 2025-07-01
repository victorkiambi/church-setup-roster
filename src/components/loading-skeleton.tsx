import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DutyCardSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg animate-pulse">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gray-100 rounded-lg animate-pulse">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCardSkeleton() {
  return (
    <Card className="border-0 bg-gray-50 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-200 rounded-lg animate-pulse">
            <div className="h-5 w-5 bg-gray-300 rounded"></div>
          </div>
          <div>
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MemberCardSkeleton() {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  )
}