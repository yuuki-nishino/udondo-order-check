"use client"

import { useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import type { Order } from "@/lib/types"
import { cn } from "@/lib/utils"
import UdonTimer from "./udon-timer"

interface OrderCardProps {
  order: Order
  onStartTimer: (orderId: string, itemId: string, firmness: string) => void
  onComplete: (orderId: string) => void
  onCancel: (orderId: string) => void
}

export default function OrderCard({ order, onStartTimer, onComplete, onCancel }: OrderCardProps) {
  // ステータスに応じたカードの背景色を設定
  const getCardClass = (status: string) => {
    switch (status) {
      case "新規":
        return "border-blue-400 bg-blue-50"
      case "準備中":
        return "border-orange-400 bg-orange-50"
      case "準備完了":
        return "border-green-400 bg-green-50"
      default:
        return ""
    }
  }

  // 注文内のすべてのアイテムが調理中かどうかをチェック
  const allItemsCooking = order.items.every((item) => item.timerRunning)

  // 注文内のすべてのアイテムの調理が完了したかどうかをチェック
  const allItemsReady = order.items.every((item) => item.timerRunning && item.timeRemaining <= 0)

  // すべてのアイテムの調理が完了したら注文ステータスを更新
  useEffect(() => {
    if (allItemsReady && order.status !== "準備完了") {
      // 実際の実装ではAPIを呼び出してステータスを更新
      console.log("すべてのうどんの調理が完了しました", order.id)
    }
  }, [allItemsReady, order.id, order.status])

  return (
    <Card className={cn("border-2 shadow-md transition-all", getCardClass(order.status))}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{order.id}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <Badge
          className={cn(
            "text-lg px-3 py-1",
            order.status === "新規"
              ? "bg-blue-500"
              : order.status === "準備中"
                ? "bg-orange-500"
                : order.status === "準備完了"
                  ? "bg-green-500"
                  : "",
          )}
        >
          {order.status}
        </Badge>
      </CardHeader>

      <CardContent className="pb-2">
        {order.items.map((item) => (
          <div key={item.id} className="mb-4 last:mb-0">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-lg font-medium">{item.type}</span>
                <Badge variant="outline" className="ml-2">
                  {item.firmness}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  {item.quantity}杯
                </Badge>
                {item.potNumber && item.timerRunning && (
                  <Badge variant="secondary" className="ml-2 bg-gray-200">
                    茹でがま {item.potNumber}
                  </Badge>
                )}
              </div>

              <UdonTimer item={item} orderId={order.id} onStartTimer={onStartTimer} />
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <Button variant="destructive" size="lg" className="text-lg font-medium" onClick={() => onCancel(order.id)}>
          <XCircle className="mr-2 h-5 w-5" />
          キャンセル
        </Button>

        <Button
          variant="default"
          size="lg"
          className="text-lg font-medium bg-green-600 hover:bg-green-700"
          onClick={() => onComplete(order.id)}
          disabled={order.status !== "準備完了"}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          引渡完了
        </Button>
      </CardFooter>
    </Card>
  )
}
