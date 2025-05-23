"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Play, FastForward } from "lucide-react"
import type { OrderItem } from "@/lib/types"
import { cn } from "@/lib/utils"

interface UdonTimerProps {
  item: OrderItem
  orderId: string
  onStartTimer: (orderId: string, itemId: string, firmness: string, isParboiled?: boolean) => void
  onTimerComplete: (itemId: string) => void;
}

export default function UdonTimer({ item, orderId, onStartTimer, onTimerComplete }: UdonTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(item.timeRemaining)
  const [timerRunning, setTimerRunning] = useState(item.timerRunning)

  // 固さと仮茹で状態に応じた調理時間を取得
  const getCookingTime = (firmness: string, isParboiled: boolean = false) => {
    // 仮茹での場合は10秒短く
    const parboiledReduction = isParboiled ? 10 : 0;
    
    switch (firmness) {
      case "やわらかめ":
        return Math.max(5, 20 - parboiledReduction) // 最低5秒は調理時間を確保
      case "ふつう":
        return Math.max(5, 40 - parboiledReduction)
      case "かため":
        return Math.max(5, 60 - parboiledReduction)
      default:
        return Math.max(5, 40 - parboiledReduction)
    }
  }

  const totalTime = getCookingTime(item.firmness, item.isParboiled)

  // タイマーの進行状況を計算
  const progress = timerRunning ? Math.max(0, Math.min(100, ((totalTime - timeRemaining) / totalTime) * 100)) : 0

  // 残り時間を分:秒形式に変換
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // 通常茹での場合のタイマー開始
  const handleStartNormalTimer = () => {
    if (!timerRunning) {
      onStartTimer(orderId, item.id, item.firmness, false)
      setTimerRunning(true)
      setTimeRemaining(getCookingTime(item.firmness, false))
    }
  }

  // 仮茹での場合のタイマー開始
  const handleStartParboiledTimer = () => {
    if (!timerRunning) {
      onStartTimer(orderId, item.id, item.firmness, true)
      setTimerRunning(true)
      setTimeRemaining(getCookingTime(item.firmness, true))
    }
  }

  // タイマーのカウントダウン
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (timerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval!); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRunning && timeRemaining === 0) {
      // このケースは基本的には上の setInterval 内の clearInterval で timeRemaining が 0 になった後に到達する
      // あるいは初期状態で timeRemaining が 0 だった場合。安全のため setTimerRunning(false) する。
      setTimerRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeRemaining]);

  // ★ 新しい useEffect: timeRemaining が 0 になり、タイマーが作動中だった場合に onTimerComplete を呼び出す
  useEffect(() => {
    // このuseEffectは timeRemaining または timerRunning (内部状態) が変わるたびに評価される
    if (timeRemaining === 0 && timerRunning) {
      // timerRunning が true ということは、まだ完了通知をしていない状態
      onTimerComplete(item.id);
      setTimerRunning(false); // 完了通知後、内部のタイマー実行状態をfalseにする
    }
  }, [timeRemaining, timerRunning, item.id, onTimerComplete]);

  // 親コンポーネントからのタイマー状態の更新を反映
  useEffect(() => {
    setTimeRemaining(item.timeRemaining)
    setTimerRunning(item.timerRunning)
  }, [item.timeRemaining, item.timerRunning])

  return (
    <div className="flex flex-col items-end">
      {(!timerRunning && !item.isCooked) ? (
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm font-medium bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-md hover:shadow-lg transition-all hover:translate-y-[-1px]" 
            onClick={handleStartNormalTimer}
          >
            <Play className="mr-1 h-4 w-4" />
            通常茹で
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm font-medium bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 shadow-md hover:shadow-lg transition-all hover:translate-y-[-1px]" 
            onClick={handleStartParboiledTimer}
          >
            <FastForward className="mr-1 h-4 w-4" />
            仮茹で済
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-[180px] p-2 bg-gray-800 rounded-md shadow-lg">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1">
              <Clock className={cn("h-5 w-5", timeRemaining > 0 && timerRunning ? "text-amber-400" : "text-emerald-400")} />
              {item.isParboiled && (
                <span className="text-xs text-blue-400">仮茹で</span>
              )}
            </div>
            <span className={cn("font-bold", timeRemaining > 0 && timerRunning ? "text-amber-400" : "text-emerald-400")}>
              {(timeRemaining > 0 && timerRunning) ? formatTime(timeRemaining) : "完了"}
            </span>
          </div>
          <Progress
            value={progress}
            className={cn("h-3 rounded-full", timeRemaining > 0 && timerRunning ? "bg-gray-600" : "bg-gray-600")}
            indicatorClassName={cn(
              (timeRemaining > 0 && timerRunning) ? (item.isParboiled ? "bg-blue-500" : "bg-amber-500") : "bg-emerald-500",
              "rounded-full shadow-inner"
            )}
          />
        </div>
      )}
    </div>
  )
}
