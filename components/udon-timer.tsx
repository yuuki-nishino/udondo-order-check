"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Play } from "lucide-react"
import type { OrderItem } from "@/lib/types"
import { cn } from "@/lib/utils"

interface UdonTimerProps {
  item: OrderItem
  orderId: string
  onStartTimer: (orderId: string, itemId: string, firmness: string) => void
}

export default function UdonTimer({ item, orderId, onStartTimer }: UdonTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(item.timeRemaining)
  const [timerRunning, setTimerRunning] = useState(item.timerRunning)

  // 固さに応じた調理時間を取得
  const getCookingTime = (firmness: string) => {
    switch (firmness) {
      case "やわらかめ":
        return 300
      case "ふつう":
        return 420
      case "かため":
        return 600
      default:
        return 420
    }
  }

  const totalTime = getCookingTime(item.firmness)

  // タイマーの進行状況を計算
  const progress = timerRunning ? Math.max(0, Math.min(100, ((totalTime - timeRemaining) / totalTime) * 100)) : 0

  // 残り時間を分:秒形式に変換
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // タイマーを開始
  const handleStartTimer = () => {
    if (!timerRunning) {
      onStartTimer(orderId, item.id, item.firmness)
      setTimerRunning(true)
      setTimeRemaining(getCookingTime(item.firmness))
    }
  }

  // タイマーのカウントダウン
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning, timeRemaining])

  // 親コンポーネントからのタイマー状態の更新を反映
  useEffect(() => {
    setTimeRemaining(item.timeRemaining)
    setTimerRunning(item.timerRunning)
  }, [item.timeRemaining, item.timerRunning])

  return (
    <div className="flex flex-col items-end">
      {!timerRunning ? (
        <Button variant="outline" size="lg" className="text-lg font-medium" onClick={handleStartTimer}>
          <Play className="mr-2 h-5 w-5" />
          調理開始
        </Button>
      ) : (
        <div className="w-full max-w-[180px]">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <Clock className={cn("h-5 w-5", timeRemaining > 0 ? "text-orange-500" : "text-green-500")} />
              {item.potNumber && (
                <span className="ml-1 font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-sm">
                  茹でがま {item.potNumber}
                </span>
              )}
            </div>
            <span className={cn("font-bold", timeRemaining > 0 ? "text-orange-700" : "text-green-700")}>
              {timeRemaining > 0 ? formatTime(timeRemaining) : "完了"}
            </span>
          </div>
          <Progress
            value={progress}
            className={cn("h-2", timeRemaining > 0 ? "bg-orange-200" : "bg-green-200")}
            indicatorClassName={cn(timeRemaining > 0 ? "bg-orange-500" : "bg-green-500")}
          />
        </div>
      )}
    </div>
  )
}
