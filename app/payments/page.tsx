import { getPayments, getPaymentStatistics } from "@/actions/payment"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentHistoryTable } from "@/components/payments/payment-history-table"
import { PaymentStatistics } from "@/components/payments/payment-statistics"

export default async function PaymentHistoryPage() {
  const paymentsResult = await getPayments()
  const statsResult = await getPaymentStatistics()

  const payments = Array.isArray(paymentsResult?.data) && paymentsResult.success ? paymentsResult.data : []
  const statistics = statsResult.success ? statsResult.data : null

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">Track payments, balances, and generate receipts</p>
        </div>
      </div>

      <div className="space-y-6">
        {statistics && <PaymentStatistics statistics={statistics} />}

        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>
              View all payment transactions, update payment status, and generate receipts with QR codes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* @ts-ignore - Ignoring type mismatch for now */}
            <PaymentHistoryTable initialPayments={payments} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
