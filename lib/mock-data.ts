import type { Order } from "./types"

export const mockOrders: Order[] = [
  {
    id: "O-1001",
    items: [
      {
        id: "I-1001-1",
        type: "かけうどん",
        firmness: "ふつう",
        quantity: 2,
        timerRunning: false,
        timeRemaining: 0,
        cookingStartTime: null,
        potNumber: null,
      },
      {
        id: "I-1001-2",
        type: "釜玉うどん",
        firmness: "かため",
        quantity: 1,
        timerRunning: false,
        timeRemaining: 0,
        cookingStartTime: null,
        potNumber: null,
      },
    ],
    status: "新規",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "O-1002",
    items: [
      {
        id: "I-1002-1",
        type: "ざるうどん",
        firmness: "やわらかめ",
        quantity: 1,
        timerRunning: true,
        timeRemaining: 120,
        cookingStartTime: new Date(Date.now() - 3 * 60000).toISOString(),
        potNumber: 2,
      },
    ],
    status: "準備中",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: "O-1003",
    items: [
      {
        id: "I-1003-1",
        type: "肉うどん",
        firmness: "ふつう",
        quantity: 3,
        timerRunning: true,
        timeRemaining: 0,
        cookingStartTime: new Date(Date.now() - 8 * 60000).toISOString(),
        potNumber: 1,
      },
    ],
    status: "準備完了",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
]
