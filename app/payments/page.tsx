
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentHistoryTable } from "@/components/payments/payment-history-table"
import { PaymentStatistics } from "@/components/payments/payment-statistics"
import { getPayments, getAllPaymentStatistics } from "@/actions/payment"

export default async function PaymentHistoryPage() {
  const paymentsResult = await getPayments()
  const statsResult = await getAllPaymentStatistics()

  const payments = Array.isArray(paymentsResult?.data) && paymentsResult.success
    ? paymentsResult.data.map((payment: any) => ({
        ...payment,
        receiptNumber: payment.receiptNumber === null ? undefined : payment.receiptNumber,
      }))
    : []
  const statisticsRaw = statsResult.success ? statsResult.data : null
  const statistics =
    statisticsRaw &&
    typeof statisticsRaw.totalPayments !== "undefined" &&
    typeof statisticsRaw.completedPayments !== "undefined" &&
    typeof statisticsRaw.partialPayments !== "undefined" &&
    typeof statisticsRaw.pendingPayments !== "undefined" &&
    typeof statisticsRaw.totalRevenue !== "undefined"
      ? {
          totalPayments: statisticsRaw.totalPayments ?? 0,
          completedPayments: statisticsRaw.completedPayments ?? 0,
          partialPayments: statisticsRaw.partialPayments ?? 0,
          pendingPayments: statisticsRaw.pendingPayments ?? 0,
          totalRevenue: statisticsRaw.totalRevenue ?? 0,
          totalOutstanding: statisticsRaw.totalOutstanding ?? 0,
        }
      : null

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
            <PaymentHistoryTable initialPayments={payments} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
