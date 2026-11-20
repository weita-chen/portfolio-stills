import type { Project } from "./types";
import { addedAlbums } from "./added-albums";

export const projects: Project[] = [
  {
    id: "nyc-spring",
    slug: "nyc-spring",
    title: { en: "NYC Spring", "zh-TW": "紐約春天" },
    description: {
      en: "Street photographs made in New York, filed as NYC Spring.",
      "zh-TW": "在紐約拍攝的街頭影像，資料夾名稱為 NYC Spring。",
    },
    location: { en: "New York", "zh-TW": "紐約" },
    category: { en: "Street", "zh-TW": "街頭" },
    coverImage: "nyc-spring-hero",
    order: 1,
    published: true,
    index: { span: 2 },
    driveFolderId: "1Fc_baSi3wQGSekfbIzW0swp3gkmKzs3j",
    images: [
      {
              id: "nyc-spring-hero",
              src: "/stills/nyc-spring/hero.jpg",
              width: 1053,
              height: 1365,
              alt: { en: "NYC Spring, cover.", "zh-TW": "紐約春天，封面。" },
              drive: { fileId: "1XdG9cwEV7Tbx-Ce6hkeCgtVAlETnrlmD", name: "hero.jpg" },
            },
      {
        id: "nyc-01",
        src: "/stills/nyc-spring/01.jpg",
        width: 2048,
        height: 1365,
        objectPosition: "32% center",
        alt: {
          en: "A woman in a red patterned dress stands by a stoop railing on a New York sidewalk, looking back toward the camera.",
          "zh-TW": "身穿紅色圖紋洋裝的女子站在紐約人行道的階梯欄杆旁，回頭望向鏡頭。",
        },
        drive: { fileId: "1NRLd3wAI6wLgiuI84dLI4-cRa-0I2XwT", name: "NYC SPRING-1.jpg" },
      },
      {
        id: "nyc-02",
        src: "/stills/nyc-spring/02.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "The white ribbed form of the Oculus rises beside a painted corrugated wall in Lower Manhattan.",
          "zh-TW": "下曼哈頓，白色肋狀的 Oculus 與彩繪浪板牆並列。",
        },
        drive: { fileId: "1Gd8wB1IRI6mXoXjhheikkVsJD7bHmzB5", name: "NYC SPRING-2.jpg" },
      },
      {
        id: "nyc-03",
        src: "/stills/nyc-spring/03.jpg",
        width: 2048,
        height: 1365,
        objectPosition: "28% center",
        alt: {
          en: "A man in a navy fleece smiles and gestures at a crosswalk, with a rolling bag in the foreground. New York.",
          "zh-TW": "身穿深藍刷毛外套的男子在斑馬線旁微笑比劃，前景有拖輪行李箱。紐約街頭。",
        },
        drive: { fileId: "1cZO1gwYTnra81XVoT7nIJ6iGFpa3Qpv2", name: "NYC SPRING-3.jpg" },
      },
      {
        id: "nyc-04",
        src: "/stills/nyc-spring/04.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "A brick alley with fire escapes and a green skybridge, a small group standing in the street. New York.",
          "zh-TW": "磚牆巷弄、防火梯與綠色天橋，一小群人站在街上。紐約。",
        },
        drive: { fileId: "1YNiNsKf1wHjqTJgMb7-BqVMLEelqNnHv", name: "NYC SPRING-4.jpg" },
      },
      {
        id: "nyc-05",
        src: "/stills/nyc-spring/05.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "A boy looks at a phone on a bench while a woman beside him holds a yellow pamphlet, at entries marked 348A and 348B. New York.",
          "zh-TW": "男孩坐在長椅上看手機，身旁的女子拿著黃色小冊。入口標著 348A 與 348B。紐約。",
        },
        drive: { fileId: "1aTkaEXiIeoplCFEFmMctLPQ-g6I87SQj", name: "NYC SPRING-5.jpg" },
      },
      {
        id: "nyc-06",
        src: "/stills/nyc-spring/06.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "Two people in white shirts are visible through the glass of dark wood double doors at number 377. New York.",
          "zh-TW": "377 號深色木門的玻璃後，可見兩位穿白襯衫的人。紐約。",
        },
        drive: { fileId: "1U0rNyYvgtdWq5yxgGBUjKHk9SyHWm238", name: "NYC SPRING-6.jpg" },
      },
      {
        id: "nyc-07",
        src: "/stills/nyc-spring/07.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "A woman walks three dogs across a crosswalk near Hudson Street, beside a box truck. New York.",
          "zh-TW": "女子在哈德遜街附近牽著三隻狗走過斑馬線，身旁是一輛箱型貨車。紐約。",
        },
        drive: { fileId: "1-T_krKSEfCB8pqwCKCPO4Uf6T9k7XYVq", name: "NYC SPRING-7.jpg" },
      },
      {
        id: "nyc-08",
        src: "/stills/nyc-spring/08.jpg",
        width: 2048,
        height: 1365,
        objectPosition: "72% center",
        alt: {
          en: "On a sidewalk, one woman photographs another who poses in a black bodysuit against a white wall. New York.",
          "zh-TW": "人行道上，一位女子為靠在白牆、身穿黑色連身衣的另一人拍照。紐約。",
        },
        drive: { fileId: "1D5eVWEcbGGs5Zx6628cNrhkixfsPwb_A", name: "NYC SPRING-8.jpg" },
      },
      {
        id: "nyc-09",
        src: "/stills/nyc-spring/09.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "People gathered around sidewalk scaffolding; one man with a green bandana raises both hands. New York.",
          "zh-TW": "人行道鷹架旁的人們，其中一位戴綠頭巾的男子舉起雙手。紐約。",
        },
        drive: { fileId: "1LprSP2n9cN-kkxIS0xvgiduDpWudnJSw", name: "NYC SPRING-9.jpg" },
      },
    
    ],
    layoutSections: [
      { type: "hero", imageId: "nyc-01" },
      { type: "intro" },
      { type: "full", imageId: "nyc-02" },
      { type: "pair", imageIds: ["nyc-04", "nyc-06"], offset: "right" },
      { type: "asymmetric", imageIds: ["nyc-08", "nyc-03"], emphasis: "left" },
      { type: "full", imageId: "nyc-07" },
      { type: "pair", imageIds: ["nyc-05", "nyc-09"], offset: "left" }
    ],
  },
  {
    id: "yilan-mt-taiping",
    slug: "yilan-mt-taiping",
    title: { en: "Yilan, Mt. Taiping", "zh-TW": "宜蘭太平山" },
    description: {
      en: "Forest paths, mist, and wildlife on Mount Taiping, Yilan.",
      "zh-TW": "宜蘭太平山的林道、霧，以及林間的動物。",
    },
    location: { en: "Yilan", "zh-TW": "宜蘭" },
    category: { en: "Nature", "zh-TW": "自然" },
    coverImage: "yilan-mt-taiping-hero",
    order: 2,
    published: true,
    index: { span: 1 },
    driveFolderId: "10EvzZI8Hu-8O9AfhzVG1hi94SaTuhHe5",
    images: [
      {
              id: "yilan-mt-taiping-hero",
              src: "/stills/yilan-mt-taiping/hero.jpg",
              width: 1113,
              height: 1365,
              alt: { en: "Yilan, Mt. Taiping, cover.", "zh-TW": "宜蘭太平山，封面。" },
              drive: { fileId: "1be9gYkI9S5PVLZpyXH00QSCoo-neQt2v", name: "hero.jpg" },
            },
      {
        id: "yilan-01",
        src: "/stills/yilan-mt-taiping/01.jpg",
        width: 2048,
        height: 1365,
        objectPosition: "72% center",
        alt: {
          en: "A macaque holds a young macaque while resting its hands on a pale blue rail, with tall grass behind. Mount Taiping, Yilan.",
          "zh-TW": "一隻獼猴抱著幼猴，前肢搭在淺藍色欄杆上，後方是高草。宜蘭太平山。",
        },
        drive: { fileId: "1kM09w2FL4zkRQmmqfwAZ431OOAqEFMzU", name: "mt taiping-1.jpg" },
      },
      {
        id: "yilan-02",
        src: "/stills/yilan-mt-taiping/02.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "Mossy trunks and a wooden boardwalk recede into fog. Mount Taiping, Yilan.",
          "zh-TW": "霧中的苔蘚林木與木棧道。宜蘭太平山。",
        },
        drive: { fileId: "12lSHdVLvSn6izx4FNGKHmznCe-dcR0Zf", name: "mt taiping-2.jpg" },
      },
      {
        id: "yilan-03",
        src: "/stills/yilan-mt-taiping/03.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "A moss-covered timber frame beside a gravel stair path in dense forest. Mount Taiping, Yilan.",
          "zh-TW": "密林裡，覆滿苔蘚的木構與碎石階梯並行。宜蘭太平山。",
        },
        drive: { fileId: "19phGNw4A50fjzeYj0eLsoZiSADsvdzYt", name: "mt taiping-3.jpg" },
      },
      {
        id: "yilan-04",
        src: "/stills/yilan-mt-taiping/04.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "A suspension bridge curves into thick fog beside a tree trunk. Mount Taiping, Yilan.",
          "zh-TW": "吊橋隱入濃霧，旁有一株樹。宜蘭太平山。",
        },
        drive: { fileId: "1jZLg8v743SarPGR_EeGR1GL4bLM1Ufsi", name: "mt taiping-4.jpg" },
      },
    
    ],
    layoutSections: [
      { type: "hero", imageId: "yilan-01" },
      { type: "intro" },
      { type: "full", imageId: "yilan-02" },
      { type: "full", imageId: "yilan-04" },
      { type: "full", imageId: "yilan-03" }
    ],
  },
  {
    id: "bubble-tea-shop",
    slug: "bubble-tea-shop",
    title: { en: "Bubble Tea Shop", "zh-TW": "手搖飲店" },
    description: {
      en: "Drink and food stills currently filed under this project. Final wording has not been written.",
      "zh-TW": "此專案資料夾裡目前是飲品與食物靜物。正式說明尚未撰寫。",
    },
    category: { en: "Products", "zh-TW": "產品" },
    coverImage: "bubble-tea-shop-hero",
    order: 3,
    published: true,
    index: { span: 1, shift: true },
    driveFolderId: "1TRnUfTqt_RKKKy-SKbnBCV3yF03eeMRW",
    images: [
      {
              id: "bubble-tea-shop-hero",
              src: "/stills/bubble-tea-shop/hero.jpg",
              width: 1365,
              height: 2048,
              alt: { en: "Bubble Tea Shop, cover.", "zh-TW": "手搖飲店，封面。" },
              drive: { fileId: "1xNOo3oquqLBKeYgK-td4x7oo4ZkZm_6B", name: "hero.jpg" },
            },
      {
        id: "tea-01",
        src: "/stills/bubble-tea-shop/01.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "A glass of amber tea beside a wooden spoon, with a yellow drink on a board behind it.",
          "zh-TW": "玻璃杯中的琥珀色茶飲與木匙，後方木板上有一杯黃色飲品。",
        },
        drive: { fileId: "1R16tOhr30vsnhrHvADqyJ5TenHoYDvGo", name: "tea shop-1.jpg" },
      },
      {
        id: "tea-02",
        src: "/stills/bubble-tea-shop/02.jpg",
        width: 1365,
        height: 2048,
        alt: {
          en: "A handled glass jar of red hibiscus infusion, with dried petals on linen.",
          "zh-TW": "麻布上的把手玻璃杯，裝著紅色洛神花飲，旁有乾花瓣。",
        },
        drive: { fileId: "1S-bdTUaTIwA7ePMA_gj0uPNcmQREaLDF", name: "tea shop-2.jpg" },
      },
      {
        id: "tea-03",
        src: "/stills/bubble-tea-shop/03.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "A clear cup of a dark iced drink on a round wood slice, with herb stems on linen.",
          "zh-TW": "木片上的透明杯，盛著深色冰飲，麻布上散著草本枝葉。",
        },
        drive: { fileId: "1MN4c1AzDNQmeVywCUVmu6eq2ZYF1oRM9", name: "tea shop-3.jpg" },
      },
      {
        id: "tea-04",
        src: "/stills/bubble-tea-shop/04.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "Matcha in a worn bowl with a bamboo whisk, a small cup of whisked tea, and a wooden spoon.",
          "zh-TW": "舊茶碗中的抹茶與竹筅，旁有一小杯打好的茶與木匙。",
        },
        drive: { fileId: "1YWkYn806bBXZcAt_LPoyPD6cPhD851WY", name: "tea shop-4.jpg" },
      },
      {
        id: "tea-05",
        src: "/stills/bubble-tea-shop/05.jpg",
        width: 2048,
        height: 1365,
        alt: {
          en: "Two onigiri on a white plate, one still in packaging labeled Oyamada kombu.",
          "zh-TW": "白盤上的兩顆飯糰，其中一顆包裝標示 Oyamada 昆布。",
        },
        drive: { fileId: "1dAAFh9zoQSKFuRGKP4iwiC5knbYCBe2m", name: "tea shop-5.jpg" },
      },
    
    ],
    layoutSections: [
      { type: "hero", imageId: "tea-04" },
      { type: "intro" },
      { type: "full", imageId: "tea-02" },
      { type: "full", imageId: "tea-01" },
      { type: "full", imageId: "tea-03" },
      { type: "single", imageId: "tea-05", align: "right" }
    ],
  },
  ...addedAlbums,
];
