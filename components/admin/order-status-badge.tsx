import { Badge } from '@/components/ui/badge'

const MAP: Record<string, { variant: any; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pending' },
  PROCESSING: { variant: 'default', label: 'Processing' },
  SHIPPED: { variant: 'secondary', label: 'Shipped' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
  CANCELLED: { variant: 'destructive', label: 'Cancelled' },
}

export function OrderStatusBadge({ status }: { status: string }) {
  const cfg = MAP[status] || { variant: 'outline', label: status }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
