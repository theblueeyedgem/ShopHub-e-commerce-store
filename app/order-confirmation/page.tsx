import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { number?: string }
}) {
  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-lg">
      <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Thank you for your order!</h1>
      <p className="text-gray-500 mb-2">
        Your order has been placed successfully.
      </p>
      {searchParams.number && (
        <p className="font-mono text-lg mb-6">Order #{searchParams.number}</p>
      )}
      <div className="flex gap-3 justify-center">
        <Link href="/products"><Button variant="outline">Continue Shopping</Button></Link>
        <Link href="/"><Button>Back Home</Button></Link>
      </div>
    </div>
  )
}
