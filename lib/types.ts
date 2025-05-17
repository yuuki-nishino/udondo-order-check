export interface OrderItem {
  id: string
  type: string
  firmness: string
  quantity: number
  timerRunning: boolean
  timeRemaining: number
  cookingStartTime: string | null
  potNumber: number | null // 茹でがま番号を追加
}

export interface Order {
  id: string
  items: OrderItem[]
  status: string
  createdAt: string
}
