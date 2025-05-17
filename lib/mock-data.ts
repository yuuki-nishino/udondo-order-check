import type { Order } from "./types"

export const mockOrders: Order[] = [
  {
    id: "O-1001",
    items: [
      {
        id: "I-1001-1",
        type: "かけウドンド",
        firmness: "ふつう",
        quantity: 2,
        timerRunning: false,
        timeRemaining: 0,
        cookingStartTime: null,
        potNumbers: [],
        toppings: ["追加ねぎ", "生たまご"]
      },
      {
        id: "I-1001-2",
        type: "かけ油ウドンド",
        firmness: "かため",
        quantity: 1,
        timerRunning: false,
        timeRemaining: 0,
        cookingStartTime: null,
        potNumbers: [],
        toppings: ["旨い煮豚"]
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
        type: "みつか坊主のエビ味噌咖喱ウドンド",
        firmness: "やわらかめ",
        quantity: 1,
        timerRunning: true,
        timeRemaining: 20,
        cookingStartTime: new Date(Date.now() - 3 * 60000).toISOString(),
        potNumbers: [2],
        toppings: ["麹漬け旨煮鶏", "ウドンドの覚醒（激辛ウマすりだね）"]
      },
      {
        id: "I-1002-2",
        type: "黒毛和牛スジ和風大阪出汁カレー",
        firmness: "ふつう",
        quantity: 1,
        timerRunning: false,
        timeRemaining: 0,
        cookingStartTime: null,
        potNumbers: [],
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
        type: "かけ油ウドンド",
        firmness: "ふつう",
        quantity: 3,
        timerRunning: true,
        timeRemaining: 0,
        cookingStartTime: new Date(Date.now() - 8 * 60000).toISOString(),
        potNumbers: [1, 3, 4],
        toppings: ["大阪スジ煮", "追加麺（1玉）"]
      },
      {
        id: "I-1003-2",
        type: "お水",
        firmness: "",
        quantity: 3,
        timerRunning: false,
        timeRemaining: 0,
        cookingStartTime: null,
        potNumbers: [],
      },
    ],
    status: "準備完了",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
]
