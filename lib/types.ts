export interface OrderItem {
  id: string
  type: string
  firmness: string
  quantity: number
  timerRunning: boolean
  timeRemaining: number
  cookingStartTime: string | null
  potNumbers: number[] // 茹でがま番号を配列として管理
  toppings?: string[] // トッピングを追加
  isParboiled?: boolean // 仮茹でしているかどうか
  isCooked?: boolean; // 調理完了状態
}

export interface Order {
  id: string
  items: OrderItem[]
  status: string
  createdAt: string
}

export interface MenuItem {
  name: string
  description: string
  category: "udondo" | "toppings" | "curry" | "drinks"
}

export const menuItems: MenuItem[] = [
  { name: "かけウドンド", description: "シンプルながらも深い味わいのかけウドンド", category: "udondo" },
  { name: "かけ油ウドンド", description: "特製の油が香る、風味豊かなウドンド", category: "udondo" },
  { name: "みつか坊主のエビ味噌咖喱ウドンド", description: "みつか坊主特製のエビ味噌咖喱と絶妙に絡むウドンド", category: "udondo" },
  { name: "旨い煮豚", description: "じっくり煮込んだ旨味たっぷりの煮豚", category: "toppings" },
  { name: "大阪スジ煮", description: "大阪風に仕上げた柔らかスジ煮込み", category: "toppings" },
  { name: "麹漬け旨煮鶏", description: "麹に漬け込んだ柔らかジューシーな鶏肉", category: "toppings" },
  { name: "ウドンドの覚醒（激辛ウマすりだね）", description: "激辛好きにはたまらない特製すりだね", category: "toppings" },
  { name: "生たまご", description: "厳選された新鮮な生卵", category: "toppings" },
  { name: "追加ねぎ", description: "シャキシャキの新鮮なねぎ", category: "toppings" },
  { name: "追加麺（1玉）", description: "もっと食べたい方に追加の麺", category: "toppings" },
  { name: "黒毛和牛スジ和風大阪出汁カレー", description: "黒毛和牛のスジを使った本格大阪風出汁カレー", category: "curry" },
  { name: "みつか坊主のエビ味噌咖喱（単品）", description: "みつか坊主特製の濃厚エビ味噌咖喱", category: "curry" },
  { name: "お水", description: "清涼なお水", category: "drinks" },
]
