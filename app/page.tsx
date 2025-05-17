"use client"

import { useState, useEffect } from "react"
import { Bell, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import OrderCard from "@/components/order-card"
import { mockOrders } from "@/lib/mock-data"
import type { Order } from "@/lib/types"

export default function OrderManagementSystem() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  // 茹でがまの使用状況を管理（true: 使用中, false: 空き）
  const [potStatus, setPotStatus] = useState<boolean[]>(Array(6).fill(false))

  // 表示対象の注文のみをフィルタリングし、作成時間の昇順（古い順）でソート
  const visibleOrders = orders
    .filter((order) => ["新規", "準備中", "準備完了"].includes(order.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  // 茹でがまの状態を更新
  useEffect(() => {
    const newPotStatus = Array(6).fill(false)

    // 現在調理中のアイテムから使用中の茹でがまを特定
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.timerRunning && item.timeRemaining > 0 && item.potNumber !== null) {
          // 茹でがま番号は1から始まるが、配列のインデックスは0から始まるため-1する
          newPotStatus[item.potNumber - 1] = true
        }
      })
    })

    setPotStatus(newPotStatus)
  }, [orders])

  // 新規注文をシミュレート（実際の実装ではWebSocketやFirebaseなどを使用）
  useEffect(() => {
    const interval = setInterval(() => {
      const newOrderId = Math.floor(Math.random() * 1000) + 1000
      const newOrder: Order = {
        id: `O-${newOrderId}`,
        items: [
          {
            id: `I-${newOrderId}-1`,
            type: ["かけうどん", "釜玉うどん", "ざるうどん", "肉うどん"][Math.floor(Math.random() * 4)],
            firmness: ["やわらかめ", "ふつう", "かため"][Math.floor(Math.random() * 3)],
            quantity: Math.floor(Math.random() * 2) + 1,
            timerRunning: false,
            timeRemaining: 0,
            cookingStartTime: null,
            potNumber: null,
          },
        ],
        status: "新規",
        createdAt: new Date().toISOString(),
      }

      // 50%の確率で新規注文を追加
      if (Math.random() > 0.9) {
        setOrders((prev) => [...prev, newOrder])
      }
    }, 15000) // 15秒ごとに新規注文をチェック

    return () => clearInterval(interval)
  }, [])

  // 注文ステータスの更新
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  // 使用可能な茹でがま番号を取得
  const getAvailablePotNumber = (): number => {
    const availablePotIndex = potStatus.findIndex((status) => !status)
    // 空きがある場合はその番号を返す（配列インデックスは0始まりなので+1）
    if (availablePotIndex !== -1) {
      return availablePotIndex + 1
    }
    // すべて使用中の場合はランダムに割り当て
    return Math.floor(Math.random() * 6) + 1
  }

  // タイマーの開始
  const startTimer = (orderId: string, itemId: string, firmness: string) => {
    // 固さに応じた調理時間を設定
    const cookingTimes = {
      やわらかめ: 300,
      ふつう: 420,
      かため: 600,
    }

    const cookingTime = cookingTimes[firmness]
    // 使用可能な茹でがま番号を取得
    const potNumber = getAvailablePotNumber()

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "準備中",
              items: order.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      timerRunning: true,
                      timeRemaining: cookingTime,
                      cookingStartTime: new Date().toISOString(),
                      potNumber: potNumber, // 茹でがま番号を設定
                    }
                  : item,
              ),
            }
          : order,
      ),
    )

    // 茹でがまの状態を更新
    const newPotStatus = [...potStatus]
    newPotStatus[potNumber - 1] = true
    setPotStatus(newPotStatus)
  }

  // 注文完了処理
  const completeOrder = (orderId: string) => {
    // 完了する注文の茹でがまを解放
    setOrders((prev) => {
      const orderToComplete = prev.find((order) => order.id === orderId)
      if (orderToComplete) {
        orderToComplete.items.forEach((item) => {
          if (item.potNumber !== null) {
            const newPotStatus = [...potStatus]
            newPotStatus[item.potNumber - 1] = false
            setPotStatus(newPotStatus)
          }
        })
      }
      return prev.map((order) => (order.id === orderId ? { ...order, status: "完了" } : order))
    })
  }

  // 注文キャンセル処理
  const cancelOrder = (orderId: string) => {
    // キャンセルする注文の茹でがまを解放
    setOrders((prev) => {
      const orderToCancel = prev.find((order) => order.id === orderId)
      if (orderToCancel) {
        orderToCancel.items.forEach((item) => {
          if (item.potNumber !== null) {
            const newPotStatus = [...potStatus]
            newPotStatus[item.potNumber - 1] = false
            setPotStatus(newPotStatus)
          }
        })
      }
      return prev.map((order) => (order.id === orderId ? { ...order, status: "キャンセル" } : order))
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">うどん屋オーダー管理</h1>
          <Badge variant="outline" className="ml-4 text-lg px-3 py-1">
            {visibleOrders.length} 件の注文
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            {visibleOrders.filter((o) => o.status === "新規").length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {visibleOrders.filter((o) => o.status === "新規").length}
              </span>
            )}
          </Button>
          <Button variant="outline" size="icon">
            <Clock className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* 茹でがまの状態表示 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">茹でがま状況</h2>
        <div className="flex flex-wrap gap-3">
          {potStatus.map((isUsed, index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 ${
                isUsed
                  ? "bg-orange-100 border-orange-500 text-orange-700"
                  : "bg-green-100 border-green-500 text-green-700"
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onStartTimer={startTimer}
            onComplete={completeOrder}
            onCancel={cancelOrder}
          />
        ))}

        {visibleOrders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow text-gray-500">
            <p className="text-xl mb-2">現在の注文はありません</p>
            <p>新しい注文が入ると、ここに表示されます</p>
          </div>
        )}
      </main>
    </div>
  )
}
