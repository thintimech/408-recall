# 408 Recall MVP 工程规格文档

## 0. 文档目的

本文档用于指导 **408 Recall 第一版 MVP** 的实际开发。上一版计划文档作为产品愿景保留，本版本不再继续扩展功能，而是将项目收敛为可以直接编码实现的工程规格。

MVP 的唯一核心目标是：

> 用户每天能打开软件，看到今日待复习卡片，完成主动回忆，并保存复习结果。

因此，第一版只保留最小学习闭环：

```text
知识点树 → 创建卡片 → 今日复习 → 主动回忆 → 保存复习记录 → 安排下次复习
```

第一版暂不实现：

- AI 制卡；
- 错点记录；
- Markdown 导出；
- 完整题库；
- 登录注册；
- 后端服务；
- 多设备同步；
- 社区、排行榜、打卡等平台化功能。

---

## 1. MVP 功能范围

### 1.1 必做功能

MVP 只包含以下功能：

1. **知识点树**
   - 内置 408 四门课基础章节；
   - 支持查看树形结构；
   - 支持新增、编辑、删除知识点节点；
   - 支持卡片绑定到某个知识点节点。

2. **卡片管理**
   - 支持新增记忆卡片；
   - 支持编辑记忆卡片；
   - 支持删除记忆卡片；
   - 支持按科目、知识点、卡片类型、标签搜索；
   - 每张卡片包含正面、背面、类型、标签、校对状态等信息。

3. **今日复习**
   - 根据 `nextReviewDate` 查询今日及以前到期的卡片；
   - 显示今日待复习数量；
   - 支持卡片正面展示；
   - 支持点击显示答案；
   - 支持用户选择复习结果：忘了、困难、记得、熟练。

4. **复习记录**
   - 每次复习后保存复习记录；
   - 更新卡片的复习状态；
   - 计算下一次复习日期；
   - 首页展示今日复习进度。

5. **JSON 导入导出**
   - 支持导出全部本地数据为 JSON；
   - 支持从 JSON 覆盖导入恢复数据；
   - 导入时校验版本号和基本字段；
   - 导入前明确提示会清空并覆盖本地数据。

### 1.2 暂不做功能

第一版明确不做：

1. 不接入 DeepSeek API；
2. 不做 AI 制卡；
3. 不做错点记录；
4. 不做 Markdown 导出；
5. 不做 Anki 导出；
6. 不做题库和真题解析；
7. 不做用户账号；
8. 不做服务端数据库；
9. 不做移动端原生 App。

---

## 2. 页面路由设计

MVP 页面应保持简单，避免过度设计。

### 2.1 路由表

```ts
const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/knowledge',
    name: 'KnowledgeTree',
    component: () => import('@/pages/KnowledgeTreePage.vue'),
    meta: { title: '知识点树' }
  },
  {
    path: '/cards',
    name: 'CardList',
    component: () => import('@/pages/CardListPage.vue'),
    meta: { title: '卡片列表' }
  },
  {
    path: '/cards/new',
    name: 'CardCreate',
    component: () => import('@/pages/CardEditPage.vue'),
    meta: { title: '新建卡片' }
  },
  {
    path: '/cards/:id/edit',
    name: 'CardEdit',
    component: () => import('@/pages/CardEditPage.vue'),
    meta: { title: '编辑卡片' }
  },
  {
    path: '/review',
    name: 'ReviewToday',
    component: () => import('@/pages/ReviewTodayPage.vue'),
    meta: { title: '今日复习' }
  },
  {
    path: '/records',
    name: 'ReviewRecords',
    component: () => import('@/pages/ReviewRecordsPage.vue'),
    meta: { title: '复习记录' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { title: '设置' }
  }
]
```

### 2.2 页面说明

#### 2.2.1 首页 `/`

首页只展示与复习闭环相关的信息：

- 今日待复习卡片数；
- 今日已完成复习数；
- 四门课卡片数量；
- 最近创建的卡片；
- 最近复习结果；
- “开始今日复习”按钮。

首页不放复杂统计图，避免第一版过重。

#### 2.2.2 知识点树 `/knowledge`

功能：

- 展示 408 四门课树形结构；
- 新增节点；
- 编辑节点；
- 删除节点；
- 点击节点查看该节点下卡片数量；
- 支持跳转到对应卡片列表。

删除节点时需要处理：

- 若节点下存在子节点，不允许直接删除；
- 若节点下存在卡片，不允许直接删除；
- 后续版本再考虑迁移节点下卡片。

#### 2.2.3 卡片列表 `/cards`

功能：

- 展示所有卡片；
- 支持按科目筛选；
- 支持按知识点筛选；
- 支持按卡片类型筛选；
- 支持按关键词搜索正面、背面和标签；
- 支持进入编辑页面；
- 支持删除卡片。

#### 2.2.4 新建/编辑卡片 `/cards/new`、`/cards/:id/edit`

表单字段：

- 所属知识点；
- 卡片类型；
- 正面问题；
- 背面答案；
- 补充说明；
- 标签；
- 校对状态。

保存卡片时：

- 若是新卡片，需要同时创建初始 `ReviewState`；
- 新卡片默认 `nextReviewDate` 为当天；
- 新卡片默认进入待复习队列。

删除卡片时：

- MVP 采用物理删除，不做归档；
- 同步删除该卡片对应的 `ReviewState`；
- 同步删除该卡片对应的 `ReviewRecord`；
- 删除操作应通过同一个业务方法完成，避免产生孤儿复习数据。

#### 2.2.5 今日复习 `/review`

核心页面。

流程：

1. 查询所有 `nextReviewDate <= today` 的卡片；
2. 按 `nextReviewDate` 升序排列；
3. 展示第一张卡片正面；
4. 用户点击“显示答案”；
5. 展示背面答案；
6. 用户选择“忘了 / 困难 / 记得 / 熟练”；
7. 写入复习记录；
8. 更新复习状态；
9. 自动进入下一张；
10. 全部完成后展示本次复习总结。

#### 2.2.6 复习记录 `/records`

功能：

- 展示最近复习记录；
- 支持按日期筛选；
- 支持按复习结果筛选；
- 点击记录可跳转到卡片编辑页面。

MVP 中不做复杂图表。

#### 2.2.7 设置 `/settings`

功能：

- 导出 JSON；
- 导入 JSON；
- 清空本地数据；
- 查看应用版本；
- 查看本地数据统计。

---

## 3. IndexedDB 表结构和索引

数据库名称：`408-recall-db`

数据库版本：`1`

建议使用 `Dexie.js` 封装 IndexedDB，降低原生 IndexedDB 使用复杂度。

### 3.1 表设计概览

MVP 使用 5 张表：

```text
knowledge_nodes   知识点节点
memory_cards      记忆卡片
review_states     卡片当前复习状态
review_records    每次复习记录
app_meta          应用元信息
```

### 3.2 knowledge_nodes

用途：保存 408 科目、章节和知识点树。

主键：`id`

字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 节点 ID |
| subjectId | string | 所属科目 ID |
| parentId | string \| null | 父节点 ID |
| title | string | 节点名称 |
| level | number | 层级，0 表示科目，1 表示章节，2 表示知识点 |
| sortOrder | number | 排序值 |
| description | string | 说明，可选 |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

索引：

```ts
knowledge_nodes: 'id, subjectId, parentId, level, sortOrder, title'
```

说明：

- `subjectId` 用于按科目筛选；
- `parentId` 用于构建树；
- `level` 用于区分科目、章节和知识点；
- `sortOrder` 用于同级排序。

### 3.3 memory_cards

用途：保存记忆卡片内容。

主键：`id`

字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 卡片 ID |
| knowledgeNodeId | string | 所属知识点 ID |
| subjectId | string | 所属科目 ID，冗余字段，便于查询 |
| type | CardType | 卡片类型 |
| front | string | 正面问题 |
| back | string | 背面答案 |
| extra | string | 补充说明，可选 |
| tags | string[] | 标签 |
| verifiedStatus | VerifiedStatus | 校对状态 |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

索引：

```ts
memory_cards: 'id, knowledgeNodeId, subjectId, type, verifiedStatus, createdAt, updatedAt, *tags'
```

说明：

- `subjectId` 是冗余字段，避免每次筛选都回查知识点树；
- `*tags` 表示 multiEntry 索引，便于按标签查询；
- MVP 中删除采用物理删除，不引入 `archived` 字段；后续如需保留历史数据，再迁移到软归档策略。

### 3.4 review_states

用途：保存每张卡片当前复习状态。

主键：`cardId`

字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| cardId | string | 卡片 ID |
| lastReviewDate | string \| null | 最近复习日期 |
| nextReviewDate | string | 下次复习日期，格式 YYYY-MM-DD |
| intervalDays | number | 当前间隔天数 |
| easeFactor | number | 难度因子，第一版保留字段 |
| reviewCount | number | 总复习次数 |
| lapseCount | number | 遗忘次数 |
| updatedAt | string | 更新时间 |

索引：

```ts
review_states: 'cardId, nextReviewDate, lastReviewDate, reviewCount, lapseCount'
```

说明：

- 今日复习主要查询 `nextReviewDate <= today`；
- `easeFactor` 第一版可以固定为 2.5，后续升级算法时使用。

### 3.5 review_records

用途：保存每次复习行为。

主键：`id`

字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 记录 ID |
| cardId | string | 卡片 ID |
| reviewedAt | string | 复习时间，ISO 字符串 |
| reviewDate | string | 复习日期，YYYY-MM-DD |
| result | ReviewResult | 复习结果 |
| previousIntervalDays | number | 复习前间隔 |
| nextIntervalDays | number | 复习后间隔 |
| previousNextReviewDate | string | 原计划复习日期 |
| nextReviewDate | string | 新计划复习日期 |

索引：

```ts
review_records: 'id, cardId, reviewDate, result, reviewedAt'
```

说明：

- `reviewDate` 用于按天统计；
- `reviewedAt` 用于按时间排序；
- `result` 用于筛选“忘了”“困难”等记录。

### 3.6 app_meta

用途：保存应用元信息和数据版本。

主键：`key`

字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| key | string | 元信息 key |
| value | unknown | 元信息 value |
| updatedAt | string | 更新时间 |

索引：

```ts
app_meta: 'key, updatedAt'
```

常用 key：

```text
app_version
data_schema_version
seed_initialized_v1
last_export_at
```

首次启动初始化种子知识点时，使用 `app_meta.seed_initialized_v1` 标记是否已经插入过基础数据。不要只依赖知识点表是否为空，因为用户可能手动清空或导入部分数据。

---

## 4. TypeScript 类型定义

建议放在：`src/types/domain.ts`

```ts
export type ID = string

export type ISODateString = string
export type ISODateTimeString = string

export type CardType =
  | 'CONCEPT'
  | 'COMPARE'
  | 'CLOZE'
  | 'PROCESS'
  | 'FORMULA'
  | 'MISTAKE'
  | 'BIG_QUESTION'

export type VerifiedStatus =
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'DOUBTFUL'

export type ReviewResult =
  | 'FORGOT'
  | 'HARD'
  | 'GOOD'
  | 'EASY'

export interface KnowledgeNode {
  id: ID
  subjectId: ID
  parentId: ID | null
  title: string
  level: number
  sortOrder: number
  description?: string
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface MemoryCard {
  id: ID
  knowledgeNodeId: ID
  subjectId: ID
  type: CardType
  front: string
  back: string
  extra?: string
  tags: string[]
  verifiedStatus: VerifiedStatus
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface ReviewState {
  cardId: ID
  lastReviewDate: ISODateString | null
  nextReviewDate: ISODateString
  intervalDays: number
  easeFactor: number
  reviewCount: number
  lapseCount: number
  updatedAt: ISODateTimeString
}

export interface ReviewRecord {
  id: ID
  cardId: ID
  reviewedAt: ISODateTimeString
  reviewDate: ISODateString
  result: ReviewResult
  previousIntervalDays: number
  nextIntervalDays: number
  previousNextReviewDate: ISODateString
  nextReviewDate: ISODateString
}

export interface AppMeta {
  key: string
  value: unknown
  updatedAt: ISODateTimeString
}
```

### 4.1 表单类型

建议放在：`src/types/forms.ts`

```ts
import type { CardType, ID, VerifiedStatus } from './domain'

export interface CardFormModel {
  knowledgeNodeId: ID | null
  type: CardType
  front: string
  back: string
  extra?: string
  tagsText: string
  verifiedStatus: VerifiedStatus
}

export interface KnowledgeNodeFormModel {
  parentId: ID | null
  subjectId: ID
  title: string
  description?: string
}
```

---

## 5. 复习调度算法

### 5.1 设计目标

MVP 不追求复杂算法，优先保证：

1. 逻辑简单；
2. 行为可解释；
3. 用户能明显感受到“忘了就更快复习，熟练就晚点复习”；
4. 后续可以平滑替换为更成熟的间隔重复算法。

### 5.2 复习结果含义

| 结果 | 含义 |
|---|---|
| FORGOT | 完全没想起来，或答案明显错误 |
| HARD | 想起来一部分，但很吃力或不完整 |
| GOOD | 基本能正确回忆 |
| EASY | 很熟练，几乎不需要思考 |

### 5.3 初始复习状态

新建卡片时创建默认复习状态：

```ts
const initialReviewState: ReviewState = {
  cardId,
  lastReviewDate: null,
  nextReviewDate: today,
  intervalDays: 0,
  easeFactor: 2.5,
  reviewCount: 0,
  lapseCount: 0,
  updatedAt: now
}
```

### 5.4 MVP 调度规则

第一版采用固定规则 + 当前间隔调整。

```ts
export function scheduleNextReview(
  state: ReviewState,
  result: ReviewResult,
  today: string
): ReviewState {
  const currentInterval = state.intervalDays

  let nextInterval: number
  let nextEaseFactor = state.easeFactor || 2.5
  let nextLapseCount = state.lapseCount

  switch (result) {
    case 'FORGOT':
      nextInterval = 1
      nextEaseFactor = Math.max(1.3, nextEaseFactor - 0.2)
      nextLapseCount += 1
      break

    case 'HARD':
      nextInterval = Math.max(2, Math.round(currentInterval * 1.2) || 2)
      nextEaseFactor = Math.max(1.3, nextEaseFactor - 0.1)
      break

    case 'GOOD':
      nextInterval = currentInterval <= 0
        ? 4
        : Math.max(4, Math.round(currentInterval * nextEaseFactor))
      break

    case 'EASY':
      nextEaseFactor = nextEaseFactor + 0.15
      nextInterval = currentInterval <= 0
        ? 7
        : Math.max(7, Math.round(currentInterval * nextEaseFactor * 1.3))
      break
  }

  return {
    ...state,
    lastReviewDate: today,
    nextReviewDate: addDays(today, nextInterval),
    intervalDays: nextInterval,
    easeFactor: nextEaseFactor,
    reviewCount: state.reviewCount + 1,
    lapseCount: nextLapseCount,
    updatedAt: new Date().toISOString()
  }
}
```

### 5.5 日期规则

- `today` 使用本地日期，格式为 `YYYY-MM-DD`；
- 到期判断使用：`nextReviewDate <= today`；
- 复习记录中的 `reviewedAt` 使用完整 ISO 时间；
- 导出数据中统一保留 ISO 字符串，不保存 Date 对象。
- 所有日期生成和日期加减必须统一通过 `dateService.ts`，页面组件和仓储层不要直接散落 `new Date()` 逻辑。

### 5.6 复习记录写入流程

每次用户选择结果时，需要在同一个业务操作中完成：

1. 读取当前 `ReviewState`；
2. 调用 `scheduleNextReview` 计算新状态；
3. 写入一条 `ReviewRecord`；
4. 更新 `ReviewState`；
5. 从当前复习队列中移除该卡片；
6. 展示下一张卡片。

若任一步写入失败，应提示用户复习结果保存失败，并保留当前卡片在复习页面，避免用户误以为结果已经记录。

---

## 6. 导入导出 JSON Schema

### 6.1 导出文件整体结构

导出文件名建议：

```text
408-recall-backup-YYYY-MM-DD.json
```

导出 JSON 结构：

```ts
export interface ExportDataV1 {
  app: {
    name: '408 Recall'
    exportVersion: 1
    exportedAt: string
  }
  data: {
    knowledgeNodes: KnowledgeNode[]
    memoryCards: MemoryCard[]
    reviewStates: ReviewState[]
    reviewRecords: ReviewRecord[]
    appMeta: AppMeta[]
  }
}
```

### 6.2 JSON 示例

```json
{
  "app": {
    "name": "408 Recall",
    "exportVersion": 1,
    "exportedAt": "2026-05-19T12:00:00.000Z"
  },
  "data": {
    "knowledgeNodes": [
      {
        "id": "subject-ds",
        "subjectId": "subject-ds",
        "parentId": null,
        "title": "数据结构",
        "level": 0,
        "sortOrder": 1,
        "description": "",
        "createdAt": "2026-05-19T12:00:00.000Z",
        "updatedAt": "2026-05-19T12:00:00.000Z"
      }
    ],
    "memoryCards": [
      {
        "id": "card-001",
        "knowledgeNodeId": "os-process-thread",
        "subjectId": "subject-os",
        "type": "COMPARE",
        "front": "进程和线程的区别是什么？",
        "back": "进程是资源分配的基本单位，线程是处理机调度的基本单位。",
        "extra": "",
        "tags": ["操作系统", "易混淆"],
        "verifiedStatus": "VERIFIED",
        "createdAt": "2026-05-19T12:00:00.000Z",
        "updatedAt": "2026-05-19T12:00:00.000Z"
      }
    ],
    "reviewStates": [
      {
        "cardId": "card-001",
        "lastReviewDate": null,
        "nextReviewDate": "2026-05-19",
        "intervalDays": 0,
        "easeFactor": 2.5,
        "reviewCount": 0,
        "lapseCount": 0,
        "updatedAt": "2026-05-19T12:00:00.000Z"
      }
    ],
    "reviewRecords": [],
    "appMeta": []
  }
}
```

### 6.3 导入策略

MVP 只提供一种导入模式：

1. **覆盖导入**
   - 清空当前本地数据；
   - 写入导入文件中的全部数据；
   - 适合用户恢复备份。

合并导入不进入 MVP。后续如果需要跨设备合并或部分迁移，再单独设计冲突处理规则。

### 6.4 导入校验规则

导入前至少校验：

1. `app.name === '408 Recall'`；
2. `app.exportVersion === 1`；
3. `data.knowledgeNodes` 是数组；
4. `data.memoryCards` 是数组；
5. `data.reviewStates` 是数组；
6. `data.reviewRecords` 是数组；
7. 每张卡片必须有对应的 `reviewState`；
8. 每张卡片绑定的 `knowledgeNodeId` 应存在。

若校验失败，应提示用户导入文件格式不正确。

---

## 7. 前端目录结构

建议目录结构：

```text
408-recall/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.vue
│   │   │   └── SideNav.vue
│   │   ├── knowledge/
│   │   │   ├── KnowledgeTree.vue
│   │   │   └── KnowledgeNodeForm.vue
│   │   ├── cards/
│   │   │   ├── CardList.vue
│   │   │   ├── CardForm.vue
│   │   │   └── CardPreview.vue
│   │   └── review/
│   │       ├── ReviewCard.vue
│   │       └── ReviewResultButtons.vue
│   ├── data/
│   │   └── seedKnowledgeNodes.ts
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── repositories/
│   │       ├── knowledgeRepository.ts
│   │       ├── cardRepository.ts
│   │       ├── reviewRepository.ts
│   │       └── metaRepository.ts
│   ├── pages/
│   │   ├── DashboardPage.vue
│   │   ├── KnowledgeTreePage.vue
│   │   ├── CardListPage.vue
│   │   ├── CardEditPage.vue
│   │   ├── ReviewTodayPage.vue
│   │   ├── ReviewRecordsPage.vue
│   │   └── SettingsPage.vue
│   ├── router/
│   │   └── index.ts
│   ├── services/
│   │   ├── reviewScheduler.ts
│   │   ├── exportService.ts
│   │   ├── importService.ts
│   │   └── dateService.ts
│   ├── stores/
│   │   ├── knowledgeStore.ts
│   │   ├── cardStore.ts
│   │   ├── reviewStore.ts
│   │   └── appStore.ts
│   ├── types/
│   │   ├── domain.ts
│   │   ├── forms.ts
│   │   └── export.ts
│   ├── utils/
│   │   ├── id.ts
│   │   └── validators.ts
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 7.1 目录职责说明

- `components/`：可复用组件；
- `pages/`：路由页面；
- `db/`：IndexedDB 初始化和数据访问；
- `stores/`：Pinia 状态管理；
- `services/`：业务逻辑，如复习调度、导入导出；
- `types/`：TypeScript 类型；
- `data/`：初始知识点种子数据；
- `utils/`：通用工具函数。

---

## 8. 开发任务清单

### 阶段 1：项目初始化与基础布局

任务：

- 初始化 Vite + Vue 3 + TypeScript 项目；
- 安装 UI 组件库；
- 安装 Pinia、Vue Router、Dexie；
- 创建基础路由；
- 创建 `AppLayout` 和侧边导航；
- 创建空页面占位；
- 配置路径别名 `@`。

验收标准：

- 项目可以正常启动；
- 页面可以在各路由之间切换；
- 侧边导航能进入首页、知识点、卡片、复习、记录、设置页面；
- TypeScript 编译无错误。

### 阶段 2：IndexedDB 与种子数据

任务：

- 定义 TypeScript 领域类型；
- 创建 Dexie 数据库；
- 定义 5 张表结构；
- 编写 408 四门课基础章节种子数据；
- 首次启动时用 `app_meta.seed_initialized_v1` 防重复初始化知识点数据；
- 编写知识点 Repository。

验收标准：

- 首次启动后 IndexedDB 中存在基础知识点；
- 刷新页面后数据不丢失；
- 知识点树可以从数据库读取；
- 重复启动不会重复插入种子数据。

### 阶段 3：知识点树页面

任务：

- 实现知识点树展示；
- 实现新增节点；
- 实现编辑节点；
- 实现删除节点；
- 实现节点排序展示；
- 显示每个节点下卡片数量。

验收标准：

- 用户可以查看 408 四门课章节；
- 用户可以新增自定义知识点；
- 用户可以编辑知识点名称和说明；
- 有子节点或有关联卡片的节点不能直接删除；
- 修改后刷新页面仍然保存。

### 阶段 4：卡片管理

任务：

- 实现卡片新增页面；
- 实现卡片编辑页面；
- 实现卡片列表；
- 实现删除卡片；
- 实现按科目、知识点、类型、标签、关键词筛选；
- 新建卡片时自动创建 `ReviewState`。

验收标准：

- 用户可以创建一张卡片；
- 卡片必须绑定知识点；
- 新卡片默认进入今日待复习；
- 用户可以编辑卡片内容；
- 用户可以删除卡片，删除时同步删除复习状态和该卡片的复习记录；
- 卡片列表筛选和搜索可用。

### 阶段 5：复习调度与今日复习

任务：

- 实现 `scheduleNextReview`；
- 查询今日到期卡片；
- 实现主动回忆页面；
- 实现显示答案；
- 实现四种复习结果按钮；
- 写入 `ReviewRecord`；
- 更新 `ReviewState`；
- 完成本轮复习总结。

验收标准：

- 今日复习页面能显示到期卡片；
- 用户点击显示答案后才能选择结果；
- 选择结果后会进入下一张；
- 全部完成后显示总结；
- 每次复习都会生成复习记录；
- 卡片的下次复习日期会正确变化；
- 刷新页面后复习状态不丢失。

### 阶段 6：首页与复习记录

任务：

- 首页展示今日待复习数量；
- 首页展示今日已完成数量；
- 首页展示四门课卡片数量；
- 首页提供“开始复习”按钮；
- 实现复习记录列表；
- 支持按日期和结果筛选记录。

验收标准：

- 用户打开首页即可看到今日待复习情况；
- 点击按钮能进入今日复习；
- 完成复习后首页数据会更新；
- 复习记录页面能看到历史记录；
- 记录中的卡片可以跳转查看或编辑。

### 阶段 7：JSON 导入导出

任务：

- 实现导出全部数据为 JSON；
- 实现下载备份文件；
- 实现选择 JSON 文件导入；
- 实现导入格式校验；
- 实现覆盖导入；
- 导入前弹窗确认；
- 导入后刷新本地状态。

验收标准：

- 用户可以导出 JSON 文件；
- 导出的 JSON 包含知识点、卡片、复习状态和复习记录；
- 用户可以清空数据后通过 JSON 恢复；
- 导入错误格式文件时有明确提示；
- 导入后今日复习队列与原数据一致。

### 阶段 8：MVP 收尾与发布

任务：

- 完善 README；
- 补充项目定位说明；
- 补充使用说明；
- 配置 GitHub Pages 部署；
- GitHub Pages 部署时在 `vite.config.ts` 中配置 `base`，支持通过 `VITE_BASE_PATH` 覆盖；
- 检查移动端基础响应式；
- 处理空状态和错误提示；
- 做一次完整手工测试。

验收标准：

- 项目可以通过 GitHub Pages 访问；
- 新用户打开后能看到基础知识点树；
- 新用户能创建卡片并完成复习；
- 数据能导出和恢复；
- README 能说明项目不是题库，也不内置商业资料。

---

## 9. MVP 总体验收标准

MVP 完成时，需要满足以下标准：

1. 用户首次打开软件，可以看到 408 四门课基础知识点树；
2. 用户可以新建一张绑定知识点的记忆卡片；
3. 新建卡片会自动出现在今日复习中；
4. 用户可以进入今日复习页面；
5. 用户可以先看正面，再显示答案；
6. 用户可以选择“忘了 / 困难 / 记得 / 熟练”；
7. 系统会保存本次复习记录；
8. 系统会更新该卡片的下次复习日期；
9. 首页能反映今日待复习和已完成数量；
10. 用户可以导出所有数据为 JSON；
11. 用户可以通过 JSON 恢复数据；
12. 刷新页面后数据不丢失；
13. 项目可以部署到 GitHub Pages；
14. 项目不依赖后端服务；
15. 项目不包含商业题库、PDF 或真题解析内容。

---

## 10. 当前开发优先级结论

开发时必须优先保障主链路：

```text
新建卡片 → 今日复习 → 主动回忆 → 保存结果 → 安排下次复习
```

其他功能都要服从这条主链路。

如果开发过程中时间不足，优先级如下：

1. IndexedDB 数据可靠保存；
2. 卡片创建与编辑；
3. 今日复习查询；
4. 主动回忆交互；
5. 复习记录保存；
6. JSON 导入导出；
7. 首页统计；
8. 知识点树编辑体验；
9. 卡片筛选搜索；
10. UI 美化。

MVP 的目标不是功能很多，而是让用户每天真的可以打开它复习。只要复习闭环稳定可用，第一版就算成功。
