"use client"

import { useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, FastForward, PlusCircle } from "lucide-react"
import type { Order, OrderItem } from "@/lib/types"
import { menuItems } from "@/lib/types"
import { cn } from "@/lib/utils"
import UdonTimer from "./udon-timer"

interface OrderCardProps {
  order: Order
  onStartTimer: (orderId: string, itemId: string, firmness: string, isParboiled?: boolean) => void
  onComplete: (orderId: string) => void
  onCancel: (orderId: string) => void
  onMarkAsReady: (orderId: string) => void
  onTimerComplete: (orderId: string, itemId: string) => void
}

export default function OrderCard({ order, onStartTimer, onComplete, onCancel, onMarkAsReady, onTimerComplete }: OrderCardProps) {
  // ステータスに応じたカードの背景色を設定
  const getCardClass = (status: string) => {
    switch (status) {
      case "新規":
        return "border-blue-500 bg-gray-700"
      case "準備中":
        return "border-amber-600 bg-gray-700"
      case "準備完了":
        return "border-emerald-500 bg-gray-700"
      default:
        return "bg-gray-700"
    }
  }

  // 注文内のすべてのアイテムが調理中かどうかをチェック
  const allItemsCooking = order.items.every((item) => item.timerRunning)

  // アクティブに動いているタイマーが存在するかをチェック
  const hasActiveTimers = order.items.some((item) => 
    item.timerRunning && item.timeRemaining > 0
  )

  // アイテムのカテゴリに基づいて調理が必要かどうかを判断する
  const needsCooking = (type: string): boolean => {
    // お水や単品のカレーなど、調理の必要がないアイテムを判断
    const menuItem = menuItems.find(mi => mi.name === type);
    if (!menuItem) return true; // 不明なアイテムは調理必要とみなす
    return menuItem.category === "udondo"; // うどんカテゴリのみ調理必要とする (より厳密に)
  }

  // 注文内のうどんアイテムを取得
  const udonItems = order.items.filter(item => 
    menuItems.find(mi => mi.name === item.type)?.category === 'udondo'
  );

  // すべてのうどんアイテムの調理が開始されているか
  const allUdonCookingStarted = udonItems.length > 0 && udonItems.every(item => item.cookingStartTime);
  
  // すべてのうどんアイテムが調理完了しているか (調理開始済みかつisCookedがtrue)
  const allUdonItemsCooked = udonItems.length > 0 && udonItems.every(item => item.cookingStartTime && item.isCooked);

  // 準備完了ボタンを有効にする条件
  // 1. 注文ステータスが「新規」または「準備中」であること
  // 2. 注文にうどんアイテムが1つ以上含まれること
  // 3. すべてのうどんアイテムの調理が開始されていること (cookingStartTime がある)
  // 4. すべてのうどんアイテムの isCooked が true であること
  const canMarkAsReady = 
    (order.status === "新規" || order.status === "準備中") &&
    udonItems.length > 0 &&
    allUdonCookingStarted &&
    allUdonItemsCooked;

  // 注文内のすべてのアイテムの調理が完了したかどうかをチェック
  const allItemsReady = order.items.every((item) => 
    (item.timerRunning && item.timeRemaining <= 0) || !needsCooking(item.type)
  )
  
  // 少なくとも一つのタイマーが動いていて、一部のアイテムの調理が完了している状態をチェック
  const someItemsReady = order.status === "準備中" && order.items.some((item) => 
    (item.timerRunning && item.timeRemaining <= 0) || !needsCooking(item.type)
  )

  // すべてのアイテムの調理が完了したら注文ステータスを更新
  useEffect(() => {
    if (allItemsReady && order.status !== "準備完了") {
      // 実際の実装ではAPIを呼び出してステータスを更新
      console.log("すべてのうどんの調理が完了しました", order.id)
    }
  }, [allItemsReady, order.id, order.status])

  return (
    <Card className={cn(
      "border-2 shadow-xl transition-all duration-200 hover:shadow-2xl hover:translate-y-[-2px]", 
      getCardClass(order.status)
    )}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-gray-600">
        <div>
          <h3 className="text-xl font-bold text-white">{order.id}</h3>
          <p className="text-sm text-gray-300">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <Badge
          className={cn(
            "text-lg px-3 py-1 text-white shadow-md transition-none",
            order.status === "新規"
              ? "bg-blue-600"
              : order.status === "準備中"
                ? "bg-amber-600"
                : order.status === "準備完了"
                  ? "bg-emerald-600"
                  : "",
          )}
        >
          {order.status}
        </Badge>
      </CardHeader>

      <CardContent className="pb-2 text-white">
        {order.items.map((item) => (
          <div key={item.id} className="mb-4 last:mb-0 border-b border-gray-600 pb-3 last:border-b-0">
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-col">
                <span className="text-lg font-medium">{item.type}</span>
                <div className="flex flex-wrap items-center mt-1">
                  {item.firmness && (
                    <Badge variant="outline" className="mr-2 mb-1 border-gray-500 text-gray-200 shadow-sm transition-none">
                      {item.firmness}
                    </Badge>
                  )}
                  <Badge variant="outline" className="mr-2 mb-1 border-gray-500 text-gray-200 shadow-sm transition-none">
                    {item.quantity}杯
                  </Badge>
                  {item.potNumbers && item.potNumbers.length > 0 && item.timerRunning && (
                    <div className="flex flex-wrap">
                      {item.potNumbers.map((potNumber, index) => (
                        <Badge key={index} variant="secondary" className="mr-1 mb-1 bg-gray-600 text-gray-200 shadow-sm transition-none">
                          茹でがま {potNumber}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* トッピング表示 */}
                {item.toppings && item.toppings.length > 0 && (
                  <div className="flex flex-col mt-2">
                    <div className="flex items-center text-sm text-gray-300 mb-1">
                      <PlusCircle className="h-3 w-3 mr-1" />
                      <span>トッピング</span>
                    </div>
                    <div className="flex flex-wrap">
                      {item.toppings.map((topping, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-600 border-gray-500 mr-2 mb-1 text-xs text-gray-200 shadow-sm transition-none">
                          {topping}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {needsCooking(item.type) ? (
                <UdonTimer 
                  item={item} 
                  orderId={order.id} 
                  onStartTimer={onStartTimer} 
                  onTimerComplete={(itemId) => onTimerComplete(order.id, itemId)}
                />
              ) : (
                <Badge className="bg-gray-600 text-gray-200 shadow-sm transition-none">調理不要</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex flex-col pt-2 border-t border-gray-600 gap-4">
        {order.status === "準備中" || order.status === "新規" ? (
          <Button 
            variant="default" 
            size="lg" 
            className={cn(
              "text-lg font-medium shadow-lg hover:shadow-xl transition-all relative overflow-hidden w-full",
              canMarkAsReady
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-gray-600 hover:bg-gray-700 opacity-50 cursor-not-allowed"
            )}
            onClick={() => {
              if (canMarkAsReady) {
                onMarkAsReady(order.id);
              }
            }}
            disabled={!canMarkAsReady}
          >
            {canMarkAsReady && (
              <span className="absolute inset-0 bg-white opacity-20 animate-pulse"></span>
            )}
            <FastForward className={cn("mr-2 h-5 w-5", canMarkAsReady && "animate-bounce")} />
            準備完了にする
          </Button>
        ) : (
          <Button
            variant="default"
            size="lg"
            className="text-lg font-medium bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all w-full"
            onClick={() => onComplete(order.id)}
            disabled={order.status !== "準備完了"}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            引渡完了
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-sm font-medium bg-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white border-gray-600 shadow-sm transition-all w-full" 
          onClick={() => onCancel(order.id)}
        >
          <XCircle className="mr-2 h-4 w-4" />
          キャンセル
        </Button>
      </CardFooter>
    </Card>
  )
}
