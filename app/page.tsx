"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import OrderCard from "@/components/order-card"
import { mockOrders } from "@/lib/mock-data"
import type { Order } from "@/lib/types"
import { menuItems } from "@/lib/types"

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
        // potNumbersが配列になっているので、それぞれの茹でがまを使用中にマーク
        if (item.timerRunning && item.timeRemaining > 0 && item.potNumbers && item.potNumbers.length > 0) {
          item.potNumbers.forEach(potNumber => {
            // 茹でがま番号は1から始まるが、配列インデックスは0から始まるため-1する
            newPotStatus[potNumber - 1] = true
          })
        }
      })
    })

    setPotStatus(newPotStatus)
  }, [orders])

  // ランダムなトッピングを生成
  const getRandomToppings = (): string[] => {
    const toppings = menuItems.filter(item => item.category === "toppings").map(item => item.name)
    const count = Math.floor(Math.random() * 3) // 0～2個のトッピング
    const selectedToppings: string[] = []
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * toppings.length)
      const topping = toppings[randomIndex]
      if (!selectedToppings.includes(topping)) {
        selectedToppings.push(topping)
      }
    }
    
    return selectedToppings
  }

  // 新規注文をシミュレート（実際の実装ではWebSocketやFirebaseなどを使用）
  useEffect(() => {
    const interval = setInterval(() => {
      const newOrderId = Math.floor(Math.random() * 1000) + 1000
      
      // メインメニューからランダムに選択
      const udondoItems = menuItems.filter(item => item.category === "udondo")
      const randomUdondoIndex = Math.floor(Math.random() * udondoItems.length)
      const udondoItem = udondoItems[randomUdondoIndex]
      
      // 飲み物やカレーをランダムに追加するかどうか決定
      const includeDrink = Math.random() > 0.7
      const includeCurry = Math.random() > 0.8
      
      const newItems = [
        {
          id: `I-${newOrderId}-1`,
          type: udondoItem.name,
          firmness: ["やわらかめ", "ふつう", "かため"][Math.floor(Math.random() * 3)],
          quantity: Math.floor(Math.random() * 2) + 1,
          timerRunning: false,
          timeRemaining: 0,
          cookingStartTime: null,
          potNumbers: [],
          toppings: getRandomToppings()
        }
      ]
      
      // 飲み物を追加
      if (includeDrink) {
        const drinkItems = menuItems.filter(item => item.category === "drinks")
        const randomDrinkIndex = Math.floor(Math.random() * drinkItems.length)
        const drinkItem = drinkItems[randomDrinkIndex]
        
        newItems.push({
          id: `I-${newOrderId}-2`,
          type: drinkItem.name,
          firmness: "",
          quantity: Math.floor(Math.random() * 2) + 1,
          timerRunning: false,
          timeRemaining: 0,
          cookingStartTime: null,
          potNumbers: [],
          toppings: [] // 空のトッピング配列を追加
        })
      }
      
      // カレーを追加
      if (includeCurry) {
        const curryItems = menuItems.filter(item => item.category === "curry")
        const randomCurryIndex = Math.floor(Math.random() * curryItems.length)
        const curryItem = curryItems[randomCurryIndex]
        
        newItems.push({
          id: `I-${newOrderId}-3`,
          type: curryItem.name,
          firmness: "",
          quantity: 1,
          timerRunning: false,
          timeRemaining: 0,
          cookingStartTime: null,
          potNumbers: [],
          toppings: [] // 空のトッピング配列を追加
        })
      }
      
      const newOrder: Order = {
        id: `O-${newOrderId}`,
        items: newItems,
        status: "新規",
        createdAt: new Date().toISOString(),
      }

      // 50%の確率で新規注文を追加
      if (Math.random() > 0.8) {
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
  const getAvailablePotNumbers = (count: number): number[] => {
    // 使用可能な茹でがま（false）のインデックスを取得
    const availablePots = potStatus.map((status, index) => !status ? index + 1 : null).filter(Boolean) as number[]
    
    // 必要な数の茹でがまが空いていない場合
    if (availablePots.length < count) {
      // 足りない分はランダムに選択する
      const availablePotCount = availablePots.length
      const additionalPotsNeeded = count - availablePotCount
      
      // 既に選択されているものを除外してランダムに選択
      const busyPots = potStatus.map((status, index) => status ? index + 1 : null).filter(Boolean) as number[]
      for (let i = 0; i < additionalPotsNeeded; i++) {
        if (busyPots.length > 0) {
          const randomIndex = Math.floor(Math.random() * busyPots.length)
          const potNumber = busyPots[randomIndex]
          availablePots.push(potNumber)
          // 同じ茹でがまを重複して選ばないように削除
          busyPots.splice(randomIndex, 1)
        } else {
          // すべての茹でがまが使用中で、かつすでに選択済みの場合は、1から6までの中からランダムに選択
          let randomPot = Math.floor(Math.random() * 6) + 1
          while (availablePots.includes(randomPot)) {
            randomPot = Math.floor(Math.random() * 6) + 1
          }
          availablePots.push(randomPot)
        }
      }
    }
    
    // 必要な数だけ返す
    return availablePots.slice(0, count)
  }

  // タイマーの開始
  const startTimer = (orderId: string, itemId: string, firmness: string, isParboiled: boolean = false) => {
    // 固さに応じた調理時間を設定 (テスト用)
    const cookingTimes: {[key: string]: number} = {
      やわらかめ: 20,
      ふつう: 40,
      かため: 60,
    }

    // 仮茹での場合は10秒短縮 (テスト用)
    const parboiledReduction = isParboiled ? 10 : 0;

    setOrders((prev) => {
      return prev.map((order) => {
        if (order.id !== orderId) return order

        // 該当するアイテムを見つけて数量を取得
        const item = order.items.find(item => item.id === itemId)
        if (!item) return order

        const quantity = item.quantity
        // 仮茹で時は時間を短縮（最低5秒は確保）(テスト用)
        const cookingTime = Math.max(5, cookingTimes[firmness] - parboiledReduction);
        // 数量分の茹でがま番号を取得
        const potNumbers = getAvailablePotNumbers(quantity)

        return {
          ...order,
          status: "準備中",
          items: order.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  timerRunning: true,
                  timeRemaining: cookingTime,
                  cookingStartTime: new Date().toISOString(),
                  potNumbers: potNumbers, // 茹でがま番号の配列を設定
                  isParboiled: isParboiled, // 仮茹で状態を保存
                  isCooked: false, // 調理未完了に設定
                }
              : item
          ),
        }
      })
    })

    // 茹でがまの状態を更新
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId)
      if (!order) return prev

      const item = order.items.find(i => i.id === itemId)
      if (!item || !item.potNumbers) return prev

      const newPotStatus = [...potStatus]
      item.potNumbers.forEach(potNumber => {
        newPotStatus[potNumber - 1] = true
      })
      
      setPotStatus(newPotStatus)
      return prev
    })
  }

  // 調理完了した注文を「準備完了」に更新する
  const markOrderAsReady = (orderId: string) => {
    console.log("準備完了ボタンがクリックされました: ", orderId)
    
    setOrders((prev) => {
      // 該当する注文を見つける
      const orderIndex = prev.findIndex(order => order.id === orderId);
      if (orderIndex === -1) return prev;
      
      // 新しい配列を作成して更新
      const newOrders = [...prev];
      newOrders[orderIndex] = {
        ...newOrders[orderIndex],
        status: "準備完了"
      };
      
      console.log("注文ステータスを更新しました: ", newOrders[orderIndex].id, newOrders[orderIndex].status);
      return newOrders;
    });
  }

  // タイマー完了処理
  const handleTimerComplete = useCallback((orderId: string, itemId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item) =>
                item.id === itemId ? { ...item, isCooked: true, timerRunning: false } : item
              ),
            }
          : order
      )
    );
  }, [setOrders]);

  // 注文完了処理
  const completeOrder = (orderId: string) => {
    // 完了する注文の茹でがまを解放
    setOrders((prev) => {
      const orderToComplete = prev.find((order) => order.id === orderId)
      if (orderToComplete) {
        orderToComplete.items.forEach((item) => {
          if (item.potNumbers && item.potNumbers.length > 0) {
            const newPotStatus = [...potStatus]
            item.potNumbers.forEach(potNumber => {
              newPotStatus[potNumber - 1] = false
            })
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
          if (item.potNumbers && item.potNumbers.length > 0) {
            const newPotStatus = [...potStatus]
            item.potNumbers.forEach(potNumber => {
              newPotStatus[potNumber - 1] = false
            })
            setPotStatus(newPotStatus)
          }
        })
      }
      return prev.map((order) => (order.id === orderId ? { ...order, status: "キャンセル" } : order))
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <header className="flex items-center justify-between mb-6 bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">ウドンド注文確認システム</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-1.5 bg-amber-600 text-white border-amber-500 shadow-md font-semibold">
            {visibleOrders.length} 件の注文
          </Badge>
          <Button variant="outline" size="icon" className="relative bg-gray-700 text-white border-gray-600 hover:bg-gray-600 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-1px]">
            <Bell className="h-6 w-6" />
            {visibleOrders.filter((o) => o.status === "新規").length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">
                {visibleOrders.filter((o) => o.status === "新規").length}
              </span>
            )}
          </Button>
          <Button variant="outline" size="icon" className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-1px]">
            <Clock className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* 茹でがまの状態表示 */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-lg font-semibold mb-2 text-white">茹でがま状況</h2>
        <div className="flex flex-wrap gap-3">
          {potStatus.map((isUsed, index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 shadow-xl ${
                isUsed
                  ? "bg-amber-700 border-amber-600 text-white"
                  : "bg-emerald-600 border-emerald-500 text-white"
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
            onMarkAsReady={markOrderAsReady}
            onTimerComplete={handleTimerComplete}
          />
        ))}

        {visibleOrders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-gray-800 rounded-lg shadow-xl border border-gray-700 text-gray-300">
            <p className="text-xl mb-2">現在の注文はありません</p>
            <p>新しい注文が入ると、ここに表示されます</p>
          </div>
        )}
      </main>
    </div>
  )
}
