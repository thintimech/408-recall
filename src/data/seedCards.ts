import type { MemoryCard } from '@/types/domain'

const t = '2026-05-19T00:00:00.000Z'

function card(
  id: string, knowledgeNodeId: string, subjectId: string,
  type: MemoryCard['type'], front: string, back: string,
  extra?: string, tags: string[] = []
): MemoryCard {
  return { id, knowledgeNodeId, subjectId, type, front, back, extra, tags, verifiedStatus: 'VERIFIED', createdAt: t, updatedAt: t }
}

export const seedCards: MemoryCard[] = [
  // ═══ 数据结构 ═══════════════════════════════════════════════════════
  card('sc-ds-001', 'ds-linear-list', 'subject-ds', 'COMPARE',
    '顺序表和链表的主要区别是什么？',
    '| 特性 | 顺序表 | 链表 |\n|---|---|---|\n| 存储方式 | 连续内存 | 离散节点 |\n| 随机访问 | O(1) | O(n) |\n| 插入/删除 | O(n) | O(1)（已知位置） |\n| 空间利用 | 可能浪费 | 额外指针开销 |',
    '顺序表适合静态数据，链表适合动态数据。', ['线性表', '对比']),

  card('sc-ds-002', 'ds-linear-list', 'subject-ds', 'CLOZE',
    '单链表中，在节点 p 之后插入新节点 s 的操作顺序是：先令 `___`，再令 `___`。',
    '先令 `s->next = p->next`，再令 `p->next = s`。\n\n顺序不能颠倒，否则会丢失 p 的后继节点。',
    undefined, ['链表', '操作']),

  card('sc-ds-003', 'ds-stack-queue', 'subject-ds', 'FORMULA',
    '循环队列判断队满和队空的条件是什么？',
    '设队头 front，队尾 rear，容量 MaxSize：\n\n**队空：** $front = rear$\n\n**队满：** $(rear + 1) \\% MaxSize = front$\n\n**长度：** $(rear - front + MaxSize) \\% MaxSize$',
    '牺牲一个存储单元是为了区分队满和队空。', ['循环队列', '公式']),

  card('sc-ds-004', 'ds-tree', 'subject-ds', 'FORMULA',
    '完全二叉树中，节点 i 的父节点、左孩子、右孩子编号？',
    '节点从 1 编号，共 n 个节点：\n\n- **父节点：** $\\lfloor i/2 \\rfloor$（$i > 1$）\n- **左孩子：** $2i$（$2i \\leq n$）\n- **右孩子：** $2i+1$（$2i+1 \\leq n$）',
    undefined, ['完全二叉树', '公式']),

  card('sc-ds-005', 'ds-tree', 'subject-ds', 'CONCEPT',
    '什么是哈夫曼树？哈夫曼编码的特点？',
    '**哈夫曼树：** 带权路径长度（WPL）最小的二叉树。\n\n**构造：** 每次选两个权值最小的节点合并，重复直到只剩一个节点。\n\n**编码特点：**\n- 前缀码（任何编码不是另一编码的前缀）\n- 高频字符编码短，低频字符编码长\n- 平均编码长度最短',
    undefined, ['哈夫曼', '编码']),

  card('sc-ds-006', 'ds-graph', 'subject-ds', 'COMPARE',
    'BFS 和 DFS 的区别？',
    '| 特性 | BFS | DFS |\n|---|---|---|\n| 数据结构 | 队列 | 栈/递归 |\n| 遍历顺序 | 按层扩展 | 尽可能深入 |\n| 最短路径 | 适用（无权图） | 不适用 |\n| 拓扑排序 | 不适用 | 适用 |',
    undefined, ['BFS', 'DFS', '图遍历']),

  card('sc-ds-007', 'ds-search', 'subject-ds', 'CONCEPT',
    'B 树和 B+ 树的主要区别？',
    '| 特性 | B 树 | B+ 树 |\n|---|---|---|\n| 数据存储 | 所有节点 | 仅叶节点 |\n| 叶节点链接 | 无 | 链表相连 |\n| 范围查询 | 效率低 | 高效 |\n| 应用 | 文件系统 | 数据库索引 |',
    'B+ 树更适合数据库索引，因为范围查询和顺序扫描效率高。', ['B树', 'B+树']),

  card('sc-ds-008', 'ds-sort', 'subject-ds', 'COMPARE',
    '常见排序算法的时间复杂度和稳定性？',
    '| 算法 | 平均 | 最坏 | 稳定 |\n|---|---|---|---|\n| 冒泡 | O(n^2) | O(n^2) | 是 |\n| 插入 | O(n^2) | O(n^2) | 是 |\n| 选择 | O(n^2) | O(n^2) | 否 |\n| 归并 | O(n log n) | O(n log n) | 是 |\n| 快排 | O(n log n) | O(n^2) | 否 |\n| 堆排 | O(n log n) | O(n log n) | 否 |',
    '稳定的：冒泡、插入、归并、计数/基数/桶。', ['排序', '复杂度']),

  card('sc-ds-009', 'ds-sort', 'subject-ds', 'PROCESS',
    '快速排序的 partition 过程？',
    '1. 选 pivot（如最后一个元素）\n2. 令 i = low - 1\n3. 遍历 j 从 low 到 high-1：若 arr[j] <= pivot，i++，交换 arr[i] 和 arr[j]\n4. 交换 arr[i+1] 和 arr[high]（pivot 归位）\n5. 返回 i+1\n\n**最坏：** 数组已有序时退化为 O(n^2)。',
    undefined, ['快速排序', '分治']),

  // ═══ 操作系统 ═══════════════════════════════════════════════════════
  card('sc-os-001', 'os-process-thread', 'subject-os', 'COMPARE',
    '进程和线程的区别是什么？',
    '| 特性 | 进程 | 线程 |\n|---|---|---|\n| 定位 | 资源分配基本单位 | CPU 调度基本单位 |\n| 地址空间 | 独立 | 共享所属进程 |\n| 通信 | IPC，开销大 | 共享内存，开销小 |\n| 切换代价 | 高（TLB 刷新） | 低（仅切换寄存器和栈） |',
    undefined, ['进程', '线程']),

  card('sc-os-002', 'os-process-thread', 'subject-os', 'PROCESS',
    '进程的五种基本状态及其转换关系？',
    '**五种状态：** 新建、就绪、运行、阻塞、终止\n\n**转换：**\n- 就绪 -> 运行：调度程序选中\n- 运行 -> 就绪：时间片用完/被抢占\n- 运行 -> 阻塞：等待 I/O 或资源\n- 阻塞 -> 就绪：等待的事件发生',
    undefined, ['进程状态']),

  card('sc-os-003', 'os-sync', 'subject-os', 'CONCEPT',
    '信号量的 P 操作和 V 操作分别做什么？',
    '**P(S)：** S = S-1；若 S<0 则阻塞当前进程\n\n**V(S)：** S = S+1；若 S<=0 则唤醒一个等待进程\n\n**互斥信号量初值为 1，同步信号量初值为 0。**',
    'P/V 操作必须是原子操作。', ['信号量', 'PV操作']),

  card('sc-os-004', 'os-deadlock', 'subject-os', 'CONCEPT',
    '死锁产生的四个必要条件？',
    '1. **互斥：** 资源一次只能被一个进程使用\n2. **占有并等待：** 持有资源同时等待其他资源\n3. **不可抢占：** 已分配资源不能被强制剥夺\n4. **循环等待：** 存在进程等待环路\n\n破坏任意一个条件即可预防死锁。',
    '记忆：互占不循。', ['死锁', '必要条件']),

  card('sc-os-005', 'os-deadlock', 'subject-os', 'PROCESS',
    '银行家算法的核心步骤？',
    '1. 进程请求资源，检查请求量 <= 最大需求量\n2. 假设分配，更新 Available、Allocation、Need\n3. 安全性检查：找能满足需求的进程，模拟完成并释放\n4. 若找到安全序列则实际分配，否则拒绝并回滚',
    '核心思想：分配前检查是否会导致不安全状态。', ['银行家算法', '死锁避免']),

  card('sc-os-006', 'os-memory', 'subject-os', 'CONCEPT',
    '页式存储中逻辑地址如何转换为物理地址？',
    '**逻辑地址：** [页号 p | 页内偏移 d]\n\n**转换：**\n1. 提取页号 p 和偏移 d\n2. 查页表得页框号 f\n3. 物理地址 = f * 页大小 + d\n\n**TLB（快表）：** 缓存最近页表项，命中时无需访问内存页表。',
    '页大小通常 4KB，偏移量占 12 位。', ['分页', '地址转换', 'TLB']),

  card('sc-os-007', 'os-memory', 'subject-os', 'COMPARE',
    'LRU、FIFO、OPT 页面置换算法对比？',
    '| 算法 | 思想 | 缺页率 | 实现 |\n|---|---|---|---|\n| OPT | 淘汰未来最久不用的 | 最低 | 不可实现 |\n| LRU | 淘汰最久未使用的 | 接近最优 | 较难 |\n| FIFO | 淘汰最早进入的 | 较高 | 简单 |\n| Clock | FIFO+访问位 | 中等 | 中等 |\n\n**Belady 异常：** FIFO 中增加页框数可能增加缺页次数。LRU/OPT 无此现象。',
    undefined, ['页面置换', '对比']),

  card('sc-os-008', 'os-file', 'subject-os', 'COMPARE',
    '文件的连续分配、链接分配、索引分配的对比？',
    '| 方式 | 优点 | 缺点 |\n|---|---|---|\n| 连续 | 顺序/随机访问快 | 外部碎片，文件不易扩展 |\n| 链接 | 无外部碎片，易扩展 | 只能顺序访问，指针开销 |\n| 索引 | 支持随机访问，易扩展 | 索引块开销 |',
    undefined, ['文件分配', '对比']),

  // ═══ 计算机组成原理 ═══════════════════════════════════════════════════
  card('sc-co-001', 'co-data', 'subject-co', 'CONCEPT',
    '原码、反码、补码的关系？负数的补码如何求？',
    '**正数：** 原码 = 反码 = 补码\n\n**负数：**\n- 反码 = 原码符号位不变，其余取反\n- 补码 = 反码 + 1\n\n**补码优势：** 加减法统一为加法，0 的表示唯一。\n\n**8 位补码范围：** $[-128, +127]$',
    undefined, ['补码', '数据表示']),

  card('sc-co-002', 'co-data', 'subject-co', 'FORMULA',
    'IEEE 754 单精度浮点数的格式？',
    '**32 位：** 1 位符号 + 8 位阶码 + 23 位尾数\n\n$(-1)^S \\times 1.M \\times 2^{E-127}$\n\n- S：符号位\n- E：阶码（偏移 127）\n- M：尾数（隐含前导 1）\n\n**特殊值：** E=0 M=0 表示 0；E=255 M=0 表示无穷',
    undefined, ['浮点数', 'IEEE754']),

  card('sc-co-003', 'co-memory', 'subject-co', 'CONCEPT',
    'Cache 的基本工作原理？三种映射方式的对比？',
    '**原理：** 利用局部性原理，将主存中频繁访问的数据块复制到高速缓存。\n\n| 映射方式 | 冲突率 | 硬件复杂度 | 查找速度 |\n|---|---|---|---|\n| 直接映射 | 高 | 低 | 快 |\n| 全相联 | 低 | 高 | 慢 |\n| 组相联 | 中 | 中 | 中 |',
    '组相联是实际中最常用的折中方案。', ['Cache', '映射']),

  card('sc-co-004', 'co-memory', 'subject-co', 'FORMULA',
    'Cache 命中率和平均访问时间的计算？',
    '设 Cache 访问时间 $t_c$，主存访问时间 $t_m$，命中率 $h$：\n\n**平均访问时间：** $t_a = h \\cdot t_c + (1-h) \\cdot t_m$\n\n**加速比：** $S = t_m / t_a$\n\n**效率：** $e = t_c / t_a$',
    undefined, ['Cache', '命中率']),

  card('sc-co-005', 'co-cpu', 'subject-co', 'COMPARE',
    '指令流水线中的三种数据冒险及解决方法？',
    '| 冒险类型 | 原因 | 解决方法 |\n|---|---|---|\n| 数据冒险 | 指令依赖前一条结果 | 转发/旁路、插入气泡 |\n| 控制冒险 | 分支指令改变 PC | 分支预测、延迟槽 |\n| 结构冒险 | 硬件资源冲突 | 资源复制、流水线暂停 |',
    undefined, ['流水线', '冒险']),

  card('sc-co-006', 'co-cpu', 'subject-co', 'FORMULA',
    '流水线的加速比和吞吐率公式？',
    '设 k 级流水线，每级耗时 $\\Delta t$，执行 n 条指令：\n\n**执行时间：** $T = (k + n - 1) \\cdot \\Delta t$\n\n**加速比：** $S = \\frac{n \\cdot k \\cdot \\Delta t}{(k+n-1) \\cdot \\Delta t} \\approx k$（$n \\to \\infty$）\n\n**吞吐率：** $TP = \\frac{n}{(k+n-1) \\cdot \\Delta t} \\approx \\frac{1}{\\Delta t}$',
    undefined, ['流水线', '加速比']),

  card('sc-co-007', 'co-io', 'subject-co', 'COMPARE',
    'I/O 方式：程序查询、中断、DMA 的对比？',
    '| 方式 | CPU 参与度 | 数据传送单位 | 适用场景 |\n|---|---|---|---|\n| 程序查询 | 全程等待 | 字/字节 | 低速设备 |\n| 中断 | 仅中断时 | 字/字节 | 中速设备 |\n| DMA | 仅开始/结束 | 数据块 | 高速设备 |',
    'DMA 控制器直接控制内存与设备间的数据传输，CPU 只在传输开始和结束时介入。', ['IO', 'DMA', '中断']),

  // ═══ 计算机网络 ═══════════════════════════════════════════════════════
  card('sc-net-001', 'net-architecture', 'subject-net', 'CONCEPT',
    'OSI 七层模型和 TCP/IP 四层模型的对应关系？',
    '| OSI | TCP/IP | 功能 |\n|---|---|---|\n| 应用层 | 应用层 | HTTP, DNS, FTP |\n| 表示层 | 应用层 | 数据格式转换 |\n| 会话层 | 应用层 | 会话管理 |\n| 传输层 | 传输层 | TCP, UDP |\n| 网络层 | 网际层 | IP, 路由 |\n| 数据链路层 | 网络接口层 | 帧传输 |\n| 物理层 | 网络接口层 | 比特流 |',
    undefined, ['OSI', 'TCP/IP']),

  card('sc-net-002', 'net-transport', 'subject-net', 'COMPARE',
    'TCP 和 UDP 的区别？',
    '| 特性 | TCP | UDP |\n|---|---|---|\n| 连接 | 面向连接 | 无连接 |\n| 可靠性 | 可靠传输 | 尽最大努力 |\n| 流量控制 | 有（滑动窗口） | 无 |\n| 拥塞控制 | 有 | 无 |\n| 首部开销 | 20 字节 | 8 字节 |\n| 传输方式 | 字节流 | 数据报 |',
    undefined, ['TCP', 'UDP', '对比']),

  card('sc-net-003', 'net-transport', 'subject-net', 'PROCESS',
    'TCP 三次握手的过程？为什么不能两次？',
    '1. 客户端发送 SYN=1, seq=x\n2. 服务器回复 SYN=1, ACK=1, seq=y, ack=x+1\n3. 客户端发送 ACK=1, seq=x+1, ack=y+1\n\n**为什么不能两次：** 防止已失效的连接请求到达服务器后，服务器误以为是新连接而分配资源（历史连接问题）。',
    undefined, ['TCP', '三次握手']),

  card('sc-net-004', 'net-transport', 'subject-net', 'PROCESS',
    'TCP 拥塞控制的四个阶段？',
    '1. **慢启动：** cwnd 从 1 开始指数增长，到 ssthresh 后进入拥塞避免\n2. **拥塞避免：** cwnd 线性增长（每 RTT 加 1）\n3. **快重传：** 收到 3 个重复 ACK 立即重传\n4. **快恢复：** ssthresh = cwnd/2，cwnd = ssthresh，进入拥塞避免',
    undefined, ['TCP', '拥塞控制']),

  card('sc-net-005', 'net-network', 'subject-net', 'CONCEPT',
    'IP 地址的分类和子网掩码的作用？',
    '| 类别 | 范围 | 默认掩码 |\n|---|---|---|\n| A | 1.0.0.0 - 126.x.x.x | 255.0.0.0 (/8) |\n| B | 128.0.0.0 - 191.255.x.x | 255.255.0.0 (/16) |\n| C | 192.0.0.0 - 223.255.255.x | 255.255.255.0 (/24) |\n\n**子网掩码作用：** 区分网络号和主机号，用于判断目的地址是否在同一子网。',
    undefined, ['IP地址', '子网']),

  card('sc-net-006', 'net-network', 'subject-net', 'CONCEPT',
    'ARP 协议的工作过程？',
    '**目的：** 将 IP 地址解析为 MAC 地址。\n\n**过程：**\n1. 检查 ARP 缓存，若有则直接使用\n2. 若无，广播 ARP 请求（目标 IP 是谁？告诉我你的 MAC）\n3. 目标主机收到后单播回复自己的 MAC 地址\n4. 发送方更新 ARP 缓存\n\n**ARP 在数据链路层工作，但服务于网络层。**',
    undefined, ['ARP', '地址解析']),

  card('sc-net-007', 'net-application', 'subject-net', 'CONCEPT',
    'DNS 域名解析的过程？递归查询和迭代查询的区别？',
    '**解析过程：**\n1. 查本地 DNS 缓存\n2. 查本地 DNS 服务器\n3. 本地 DNS 向根域名服务器查询\n4. 根 -> 顶级域 -> 权威域名服务器，逐级返回\n\n**递归：** 服务器代替客户端完成全部查询\n**迭代：** 服务器返回下一步应查询的地址，客户端自己继续',
    undefined, ['DNS', '域名解析']),

  card('sc-net-008', 'net-link', 'subject-net', 'CONCEPT',
    '以太网 CSMA/CD 协议的工作原理？',
    '**载波监听多路访问/冲突检测：**\n1. **先听后发：** 发送前监听信道是否空闲\n2. **边发边听：** 发送时持续检测冲突\n3. **冲突退避：** 检测到冲突后停止发送，等待随机时间后重试\n\n**最小帧长 = 2 * 传播时延 * 数据率**（确保发送期间能检测到冲突）',
    undefined, ['CSMA/CD', '以太网']),

  // ═══ 高等数学 ═══════════════════════════════════════════════════════
  card('sc-calc-001', 'calc-limit', 'subject-calculus', 'FORMULA',
    '七个常用等价无穷小（x->0 时）？',
    '$x \\to 0$ 时：\n\n- $\\sin x \\sim x$\n- $\\tan x \\sim x$\n- $\\arcsin x \\sim x$\n- $\\arctan x \\sim x$\n- $1 - \\cos x \\sim \\frac{x^2}{2}$\n- $e^x - 1 \\sim x$\n- $\\ln(1+x) \\sim x$',
    '等价无穷小只能在乘除中替换，不能在加减中直接替换。', ['等价无穷小', '极限']),

  card('sc-calc-002', 'calc-limit', 'subject-calculus', 'METHOD',
    '求极限的常用方法有哪些？如何选择？',
    '**方法选择：**\n1. **直接代入** -> 若不是未定型\n2. **等价无穷小替换** -> 0/0 型，乘除因子\n3. **洛必达法则** -> 0/0 或 inf/inf 型\n4. **泰勒展开** -> 加减相消型\n5. **夹逼准则** -> 有界量 * 无穷小\n6. **单调有界** -> 递推数列极限\n\n**识别特征：** 看未定型类型和表达式结构。',
    undefined, ['极限', '题型套路']),

  card('sc-calc-003', 'calc-derivative', 'subject-calculus', 'FORMULA',
    '常用求导公式（基本初等函数）？',
    '- $(x^n)\' = nx^{n-1}$\n- $(e^x)\' = e^x$\n- $(a^x)\' = a^x \\ln a$\n- $(\\ln x)\' = 1/x$\n- $(\\sin x)\' = \\cos x$\n- $(\\cos x)\' = -\\sin x$\n- $(\\tan x)\' = \\sec^2 x$\n- $(\\arctan x)\' = \\frac{1}{1+x^2}$\n- $(\\arcsin x)\' = \\frac{1}{\\sqrt{1-x^2}}$',
    undefined, ['求导', '公式']),

  card('sc-calc-004', 'calc-derivative', 'subject-calculus', 'THEOREM',
    '中值定理体系：罗尔、拉格朗日、柯西定理的条件和结论？',
    '**罗尔定理：** [a,b] 连续，(a,b) 可导，f(a)=f(b) => 存在 c 使 $f\'(c) = 0$\n\n**拉格朗日：** [a,b] 连续，(a,b) 可导 => 存在 c 使 $f\'(c) = \\frac{f(b)-f(a)}{b-a}$\n\n**柯西：** 在拉格朗日基础上，$\\frac{f\'(c)}{g\'(c)} = \\frac{f(b)-f(a)}{g(b)-g(a)}$',
    '罗尔是拉格朗日的特例，拉格朗日是柯西的特例。', ['中值定理', '定理条件']),

  card('sc-calc-005', 'calc-integral', 'subject-calculus', 'METHOD',
    '不定积分的常用方法？如何选择？',
    '1. **凑微分法：** 被积函数含复合结构\n2. **换元法：** 三角换元（根号下二次式）、倒代换\n3. **分部积分：** $\\int u\\,dv = uv - \\int v\\,du$\n   - 反对幂指三（ILATE 法则）\n4. **有理函数分解：** 分母可因式分解\n\n**识别：** 看被积函数结构，优先尝试凑微分。',
    undefined, ['积分', '题型套路']),

  card('sc-calc-006', 'calc-integral', 'subject-calculus', 'FORMULA',
    '定积分的几个重要公式和性质？',
    '**华里士公式（点火公式）：**\n$\\int_0^{\\pi/2} \\sin^n x\\,dx = \\int_0^{\\pi/2} \\cos^n x\\,dx$\n\n**区间再现：**\n$\\int_a^b f(x)\\,dx = \\int_a^b f(a+b-x)\\,dx$\n\n**奇偶性：** 对称区间 [-a,a] 上，奇函数积分为 0。',
    undefined, ['定积分', '公式']),

  card('sc-calc-007', 'calc-ode', 'subject-calculus', 'METHOD',
    '常微分方程的类型识别和解法？',
    '| 类型 | 特征 | 解法 |\n|---|---|---|\n| 可分离变量 | g(y)dy = f(x)dx | 两边积分 |\n| 一阶线性 | y\'+P(x)y = Q(x) | 公式法 |\n| 伯努利 | y\'+Py = Qy^n | 令 z=y^(1-n) |\n| 二阶常系数齐次 | y\"+py\'+qy=0 | 特征方程 |\n| 二阶常系数非齐次 | y\"+py\'+qy=f(x) | 特解+通解 |',
    undefined, ['微分方程', '题型套路']),

  card('sc-calc-008', 'calc-multi-diff', 'subject-calculus', 'CONCEPT',
    '多元函数可微、可偏导、连续之间的关系？',
    '**关系：**\n- 可微 => 连续\n- 可微 => 可偏导\n- 连续 ≠> 可偏导\n- 可偏导 ≠> 连续\n- 偏导连续 => 可微\n\n**判断可微：** 验证 $\\Delta z - f_x \\Delta x - f_y \\Delta y = o(\\rho)$',
    '偏导数存在不能保证函数连续，这是多元函数与一元函数的重要区别。', ['多元函数', '可微性']),

  // ═══ 线性代数 ═══════════════════════════════════════════════════════
  card('sc-la-001', 'la-determinant', 'subject-linalg', 'METHOD',
    '行列式的计算方法有哪些？',
    '1. **定义法：** 2阶、3阶直接展开\n2. **性质化简：** 行列互换、提公因子、行加减\n3. **按行/列展开：** 选零多的行列\n4. **递推法：** 找规律建立递推关系\n5. **特殊行列式：** 范德蒙德、三角形\n\n**范德蒙德：** $\\prod_{1 \\leq j < i \\leq n}(x_i - x_j)$',
    undefined, ['行列式', '计算方法']),

  card('sc-la-002', 'la-matrix', 'subject-linalg', 'FORMULA',
    '矩阵的初等变换和初等矩阵的关系？',
    '**三种初等变换对应三种初等矩阵：**\n1. 交换两行 -> $E(i,j)$\n2. 某行乘 k -> $E(i(k))$\n3. 某行的 k 倍加到另一行 -> $E(i,j(k))$\n\n**左乘 = 行变换，右乘 = 列变换**\n\n**性质：** 初等矩阵均可逆，逆仍为初等矩阵。',
    undefined, ['初等变换', '矩阵']),

  card('sc-la-003', 'la-matrix', 'subject-linalg', 'THEOREM',
    '矩阵可逆的充要条件有哪些？',
    '以下等价：\n1. A 可逆\n2. $|A| \\neq 0$\n3. $r(A) = n$（满秩）\n4. A 的行/列向量线性无关\n5. Ax=0 只有零解\n6. A 的特征值全不为 0\n7. A 可表示为初等矩阵的乘积',
    undefined, ['可逆矩阵', '充要条件']),

  card('sc-la-004', 'la-vector', 'subject-linalg', 'CONCEPT',
    '向量组线性相关和线性无关的判定方法？',
    '**线性相关：** 存在不全为零的系数使 $k_1\\alpha_1 + ... + k_n\\alpha_n = 0$\n\n**判定方法：**\n1. 构造矩阵，求秩：$r(A) < $ 向量个数 => 相关\n2. 行列式法（方阵）：$|A| = 0$ => 相关\n3. 向量个数 > 维数 => 必相关\n4. 含零向量 => 必相关',
    undefined, ['线性相关', '向量']),

  card('sc-la-005', 'la-equations', 'subject-linalg', 'THEOREM',
    '线性方程组解的判定定理？',
    '**Ax = b：**\n- $r(A) = r(A|b) = n$ => 唯一解\n- $r(A) = r(A|b) < n$ => 无穷多解\n- $r(A) < r(A|b)$ => 无解\n\n**Ax = 0：**\n- $r(A) = n$ => 只有零解\n- $r(A) < n$ => 有非零解（基础解系含 n-r(A) 个向量）',
    undefined, ['线性方程组', '解的判定']),

  card('sc-la-006', 'la-eigenvalue', 'subject-linalg', 'PROCESS',
    '求特征值和特征向量的步骤？',
    '1. 求特征方程 $|A - \\lambda E| = 0$ 的根 -> 特征值 $\\lambda_i$\n2. 对每个 $\\lambda_i$，解 $(A - \\lambda_i E)x = 0$ -> 基础解系即特征向量\n\n**性质：**\n- $\\sum \\lambda_i = tr(A)$（迹）\n- $\\prod \\lambda_i = |A|$\n- 不同特征值的特征向量线性无关',
    undefined, ['特征值', '特征向量']),

  card('sc-la-007', 'la-eigenvalue', 'subject-linalg', 'THEOREM',
    '矩阵可对角化的充要条件？',
    '**n 阶矩阵 A 可对角化的充要条件：**\n1. A 有 n 个线性无关的特征向量\n2. 每个特征值的几何重数 = 代数重数\n\n**充分条件：** A 有 n 个不同的特征值\n\n**对角化：** $P^{-1}AP = \\Lambda$，P 的列为特征向量，$\\Lambda$ 对角线为特征值。',
    '实对称矩阵一定可对角化，且可用正交矩阵对角化。', ['对角化', '充要条件']),

  card('sc-la-008', 'la-quadratic', 'subject-linalg', 'PROCESS',
    '二次型化标准形的步骤（正交变换法）？',
    '1. 写出二次型矩阵 A\n2. 求 A 的特征值 $\\lambda_1, ..., \\lambda_n$\n3. 求对应的特征向量\n4. 将特征向量正交化（施密特）、单位化\n5. 构造正交矩阵 P\n6. 令 x = Py，得标准形 $\\sum \\lambda_i y_i^2$',
    '正交变换不改变二次型的正定性。', ['二次型', '标准形']),

  // ═══ 概率论与数理统计 ═══════════════════════════════════════════════
  card('sc-prob-001', 'prob-event', 'subject-prob', 'FORMULA',
    '条件概率、全概率公式、贝叶斯公式？',
    '**条件概率：** $P(B|A) = \\frac{P(AB)}{P(A)}$\n\n**全概率：** $P(B) = \\sum_{i=1}^n P(A_i)P(B|A_i)$\n\n**贝叶斯：** $P(A_k|B) = \\frac{P(A_k)P(B|A_k)}{\\sum_{i=1}^n P(A_i)P(B|A_i)}$',
    '全概率是"由因求果"，贝叶斯是"由果溯因"。', ['条件概率', '贝叶斯']),

  card('sc-prob-002', 'prob-rv', 'subject-prob', 'COMPARE',
    '常见离散分布的期望和方差？',
    '| 分布 | 记号 | E(X) | D(X) |\n|---|---|---|---|\n| 0-1 分布 | B(1,p) | p | p(1-p) |\n| 二项 | B(n,p) | np | np(1-p) |\n| 泊松 | P(λ) | λ | λ |\n| 几何 | Ge(p) | 1/p | (1-p)/p^2 |',
    undefined, ['离散分布', '期望', '方差']),

  card('sc-prob-003', 'prob-rv', 'subject-prob', 'COMPARE',
    '常见连续分布的期望和方差？',
    '| 分布 | 记号 | E(X) | D(X) |\n|---|---|---|---|\n| 均匀 | U(a,b) | (a+b)/2 | (b-a)^2/12 |\n| 指数 | Exp(λ) | 1/λ | 1/λ^2 |\n| 正态 | N(μ,σ^2) | μ | σ^2 |\n| 卡方 | χ^2(n) | n | 2n |',
    '指数分布具有无记忆性：P(X>s+t|X>s) = P(X>t)。', ['连续分布', '期望', '方差']),

  card('sc-prob-004', 'prob-numeric', 'subject-prob', 'FORMULA',
    '期望和方差的性质公式？',
    '**期望：**\n- $E(aX+b) = aE(X)+b$\n- $E(X+Y) = E(X)+E(Y)$（无需独立）\n- $E(XY) = E(X)E(Y)$（需独立）\n\n**方差：**\n- $D(X) = E(X^2) - [E(X)]^2$\n- $D(aX+b) = a^2 D(X)$\n- $D(X \\pm Y) = D(X)+D(Y)$（需独立）',
    undefined, ['期望', '方差', '性质']),

  card('sc-prob-005', 'prob-law', 'subject-prob', 'THEOREM',
    '中心极限定理的内容和应用条件？',
    '**林德伯格-列维（独立同分布 CLT）：**\n\n设 $X_1,...,X_n$ iid，$E(X_i)=\\mu$，$D(X_i)=\\sigma^2$，则：\n\n$$\\frac{\\sum X_i - n\\mu}{\\sqrt{n}\\sigma} \\xrightarrow{d} N(0,1)$$\n\n**应用：** 当 n 充分大时，$\\bar{X} \\approx N(\\mu, \\sigma^2/n)$',
    '实际应用中 n>=30 通常认为近似成立。', ['中心极限定理']),

  card('sc-prob-006', 'prob-estimation', 'subject-prob', 'PROCESS',
    '最大似然估计（MLE）的步骤？',
    '1. 写出似然函数 $L(\\theta) = \\prod_{i=1}^n f(x_i; \\theta)$\n2. 取对数 $\\ln L(\\theta)$\n3. 对 $\\theta$ 求导，令 $\\frac{d \\ln L}{d\\theta} = 0$\n4. 解方程得 $\\hat{\\theta}$\n\n**性质：** MLE 具有不变性，即 $g(\\theta)$ 的 MLE 为 $g(\\hat{\\theta})$。',
    undefined, ['最大似然估计', '参数估计']),

  card('sc-prob-007', 'prob-stat', 'subject-prob', 'CONCEPT',
    '三大抽样分布及其构造？',
    '设 $X_1,...,X_n$ iid $\\sim N(0,1)$：\n\n**卡方分布：** $\\chi^2 = X_1^2 + ... + X_n^2 \\sim \\chi^2(n)$\n\n**t 分布：** $t = \\frac{X_0}{\\sqrt{\\chi^2/n}} \\sim t(n)$\n\n**F 分布：** $F = \\frac{\\chi_1^2/n_1}{\\chi_2^2/n_2} \\sim F(n_1, n_2)$',
    't 分布当 n->∞ 时趋近标准正态分布。', ['抽样分布', '三大分布']),

  // ═══ 高等数学（补充） ═══════════════════════════════════════════════════
  card('sc-calc-009', 'calc-ode', 'subject-calculus', 'METHOD',
    '常微分方程如何分类？各类型的解法选择？',
    '**一阶 ODE：**\n| 类型 | 识别特征 | 解法 |\n|---|---|---|\n| 可分离变量 | $\\frac{dy}{dx}=f(x)g(y)$ | 分离后两边积分 |\n| 齐次方程 | $\\frac{dy}{dx}=\\varphi(y/x)$ | 令 $u=y/x$ |\n| 一阶线性 | $y\'+P(x)y=Q(x)$ | $y=e^{-\\int P\\,dx}[\\int Qe^{\\int P\\,dx}dx+C]$ |\n| 伯努利 | $y\'+Py=Qy^n$ | 令 $z=y^{1-n}$ 化为线性 |\n\n**二阶常系数线性：**\n- 齐次：特征方程 $r^2+pr+q=0$\n- 非齐次：通解 = 齐次通解 + 特解（待定系数法）',
    '特征根为重根时通解含 $xe^{rx}$ 项；复根 $\\alpha\\pm\\beta i$ 时含 $e^{\\alpha x}(C_1\\cos\\beta x+C_2\\sin\\beta x)$。', ['微分方程', '分类', '解法选择']),

  card('sc-calc-010', 'calc-multi-diff', 'subject-calculus', 'FORMULA',
    '多元函数偏导数与全微分的定义和计算？',
    '**偏导数：**\n$f_x(x_0,y_0)=\\lim_{\\Delta x\\to 0}\\frac{f(x_0+\\Delta x,y_0)-f(x_0,y_0)}{\\Delta x}$\n\n**全微分：**\n$dz = f_x\\,dx + f_y\\,dy$\n\n**复合函数求导（链式法则）：**\n设 $z=f(u,v)$，$u=u(x,y)$，$v=v(x,y)$：\n$\\frac{\\partial z}{\\partial x}=\\frac{\\partial f}{\\partial u}\\frac{\\partial u}{\\partial x}+\\frac{\\partial f}{\\partial v}\\frac{\\partial v}{\\partial x}$\n\n**隐函数求导：**\n$F(x,y,z)=0$ 时 $\\frac{\\partial z}{\\partial x}=-\\frac{F_x}{F_z}$',
    '全微分存在的充分条件：偏导数连续。', ['偏导数', '全微分', '链式法则']),

  card('sc-calc-011', 'calc-multi-diff', 'subject-calculus', 'METHOD',
    '多元函数极值与条件极值（拉格朗日乘数法）如何求解？',
    '**无条件极值：**\n1. 求驻点：$f_x=0,\\;f_y=0$\n2. 判别：令 $A=f_{xx},B=f_{xy},C=f_{yy}$，$\\Delta=AC-B^2$\n   - $\\Delta>0,A>0$：极小值\n   - $\\Delta>0,A<0$：极大值\n   - $\\Delta<0$：非极值\n   - $\\Delta=0$：需进一步讨论\n\n**条件极值（拉格朗日乘数法）：**\n求 $f(x,y)$ 在约束 $\\varphi(x,y)=0$ 下的极值：\n1. 构造 $L=f(x,y)+\\lambda\\varphi(x,y)$\n2. 解方程组 $L_x=0,\\;L_y=0,\\;\\varphi=0$',
    '多个约束条件时引入多个乘子：$L=f+\\lambda_1\\varphi_1+\\lambda_2\\varphi_2$。', ['极值', '拉格朗日乘数法']),

  card('sc-calc-012', 'calc-multi-int', 'subject-calculus', 'FORMULA',
    '二重积分的计算方法（直角坐标与极坐标）？',
    '**直角坐标（X 型区域）：**\n$\\iint_D f(x,y)\\,d\\sigma = \\int_a^b dx\\int_{y_1(x)}^{y_2(x)} f(x,y)\\,dy$\n\n**极坐标：**\n$\\iint_D f(x,y)\\,d\\sigma = \\int_{\\alpha}^{\\beta} d\\theta\\int_0^{r(\\theta)} f(r\\cos\\theta,r\\sin\\theta)\\cdot r\\,dr$\n\n**选择策略：**\n- 积分区域为圆域/扇形 -> 极坐标\n- 被积函数含 $x^2+y^2$ -> 极坐标\n- 区域边界为直线 -> 直角坐标',
    '极坐标变换时不要忘记雅可比行列式 $r$（即 $d\\sigma = r\\,dr\\,d\\theta$）。', ['二重积分', '极坐标']),

  card('sc-calc-013', 'calc-series', 'subject-calculus', 'THEOREM',
    '常见级数敛散性判别法有哪些？',
    '**正项级数：**\n1. **比较判别法：** $u_n \\leq v_n$，$\\sum v_n$ 收敛则 $\\sum u_n$ 收敛\n2. **比值判别法：** $\\lim\\frac{u_{n+1}}{u_n}=\\rho$，$\\rho<1$ 收敛，$\\rho>1$ 发散\n3. **根值判别法：** $\\lim\\sqrt[n]{u_n}=\\rho$，判断同上\n4. **积分判别法：** $\\sum f(n)$ 与 $\\int_1^\\infty f(x)dx$ 同敛散\n\n**交错级数：** 莱布尼茨判别法（$u_n$ 单调递减趋于 0）\n\n**任意项级数：** 绝对收敛 => 条件收敛',
    '比值法适合含 $n!$ 或 $a^n$ 的级数；根值法适合含 $n$ 次幂的级数。', ['级数', '敛散性', '判别法']),

  card('sc-calc-014', 'calc-series', 'subject-calculus', 'FORMULA',
    '常见函数的泰勒（麦克劳林）级数展开？',
    '**常用展开（$|x|<$ 收敛半径）：**\n\n$e^x = \\sum_{n=0}^{\\infty}\\frac{x^n}{n!},\\quad(-\\infty,+\\infty)$\n\n$\\sin x = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+1}}{(2n+1)!},\\quad(-\\infty,+\\infty)$\n\n$\\cos x = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n}}{(2n)!},\\quad(-\\infty,+\\infty)$\n\n$\\ln(1+x) = \\sum_{n=1}^{\\infty}\\frac{(-1)^{n-1}x^n}{n},\\quad(-1,1]$\n\n$\\frac{1}{1-x} = \\sum_{n=0}^{\\infty}x^n,\\quad(-1,1)$\n\n$(1+x)^\\alpha = 1+\\sum_{n=1}^{\\infty}\\frac{\\alpha(\\alpha-1)\\cdots(\\alpha-n+1)}{n!}x^n$',
    '求幂级数的和函数时常用逐项求导或逐项积分。', ['泰勒级数', '幂级数展开']),

  // ═══ 概率论与数理统计（补充） ═══════════════════════════════════════════
  card('sc-prob-008', 'prob-event', 'subject-prob', 'FORMULA',
    '全概率公式与贝叶斯公式的应用要点？',
    '**全概率公式：**\n$P(B)=\\sum_{i=1}^n P(A_i)P(B|A_i)$\n\n**使用条件：** $A_1,...,A_n$ 构成样本空间的完备事件组（互斥且并为全集）。\n\n**贝叶斯公式：**\n$P(A_k|B)=\\frac{P(A_k)P(B|A_k)}{\\sum_{i=1}^n P(A_i)P(B|A_i)}$\n\n**应用技巧：**\n- 全概率：已知各"原因"的概率和条件概率，求"结果"的概率\n- 贝叶斯：已知"结果"发生，反推最可能的"原因"\n- 关键步骤：正确划分完备事件组',
    '贝叶斯公式中 $P(A_k)$ 称为先验概率，$P(A_k|B)$ 称为后验概率。', ['全概率', '贝叶斯', '完备事件组']),

  card('sc-prob-009', 'prob-rv', 'subject-prob', 'FORMULA',
    '常见离散分布（二项/泊松/几何）的分布律、期望和方差？',
    '| 分布 | $P(X=k)$ | $E(X)$ | $D(X)$ |\n|---|---|---|---|\n| $B(n,p)$ | $C_n^k p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |\n| $P(\\lambda)$ | $\\frac{\\lambda^k}{k!}e^{-\\lambda}$ | $\\lambda$ | $\\lambda$ |\n| $Ge(p)$ | $(1-p)^{k-1}p$ | $1/p$ | $(1-p)/p^2$ |\n| $H(N,M,n)$ | $\\frac{C_M^k C_{N-M}^{n-k}}{C_N^n}$ | $\\frac{nM}{N}$ | — |\n\n**泊松近似：** 当 $n$ 大 $p$ 小时，$B(n,p)\\approx P(np)$。',
    '几何分布具有无记忆性：$P(X>m+n|X>m)=P(X>n)$。', ['二项分布', '泊松分布', '几何分布']),

  card('sc-prob-010', 'prob-rv', 'subject-prob', 'FORMULA',
    '常见连续分布（均匀/指数/正态）的密度函数和数字特征？',
    '**均匀分布 $U(a,b)$：**\n$f(x)=\\frac{1}{b-a},\\;a<x<b$\n$E(X)=\\frac{a+b}{2},\\;D(X)=\\frac{(b-a)^2}{12}$\n\n**指数分布 $Exp(\\lambda)$：**\n$f(x)=\\lambda e^{-\\lambda x},\\;x>0$\n$E(X)=\\frac{1}{\\lambda},\\;D(X)=\\frac{1}{\\lambda^2}$\n\n**正态分布 $N(\\mu,\\sigma^2)$：**\n$f(x)=\\frac{1}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$\n$E(X)=\\mu,\\;D(X)=\\sigma^2$\n\n**标准化：** $Z=\\frac{X-\\mu}{\\sigma}\\sim N(0,1)$',
    '$3\\sigma$ 原则：$P(|X-\\mu|<3\\sigma)=0.9974$。', ['均匀分布', '指数分布', '正态分布']),

  card('sc-prob-011', 'prob-multi-rv', 'subject-prob', 'METHOD',
    '求二维随机变量函数 $Z=g(X,Y)$ 的分布的方法？',
    '**离散型：** 列出所有 $(X,Y)$ 取值组合，计算 $Z=g(X,Y)$ 对应概率并合并相同值。\n\n**连续型（分布函数法）：**\n1. 求 $F_Z(z)=P(g(X,Y)\\leq z)$\n2. 将事件转化为 $(X,Y)$ 的区域\n3. 用联合密度积分：$F_Z(z)=\\iint_{g(x,y)\\leq z}f(x,y)\\,dxdy$\n4. 对 $z$ 求导得 $f_Z(z)$\n\n**常用结论（独立时）：**\n- $Z=X+Y$：$f_Z(z)=\\int_{-\\infty}^{+\\infty}f_X(x)f_Y(z-x)\\,dx$（卷积公式）\n- $Z=\\max(X,Y)$：$F_Z(z)=F_X(z)F_Y(z)$\n- $Z=\\min(X,Y)$：$F_Z(z)=1-[1-F_X(z)][1-F_Y(z)]$',
    '求 $\\max/\\min$ 分布是考研常考题型，注意独立性条件。', ['二维随机变量', '函数分布', '卷积']),

  card('sc-prob-012', 'prob-numeric', 'subject-prob', 'FORMULA',
    '协方差与相关系数的定义、性质和计算？',
    '**协方差：**\n$Cov(X,Y)=E(XY)-E(X)E(Y)$\n\n**相关系数：**\n$\\rho_{XY}=\\frac{Cov(X,Y)}{\\sqrt{D(X)}\\sqrt{D(Y)}}$\n\n**性质：**\n- $Cov(X,X)=D(X)$\n- $Cov(aX,bY)=ab\\,Cov(X,Y)$\n- $Cov(X_1+X_2,Y)=Cov(X_1,Y)+Cov(X_2,Y)$\n- $|\\rho|\\leq 1$；$|\\rho|=1$ 时 $X,Y$ 线性相关\n- 独立 => $\\rho=0$（不相关），反之不一定成立\n\n**方差公式：**\n$D(X\\pm Y)=D(X)+D(Y)\\pm 2Cov(X,Y)$',
    '对于二维正态分布，不相关与独立等价。', ['协方差', '相关系数', '独立性']),

  // ═══ 线性代数（补充） ═══════════════════════════════════════════════════
  card('sc-la-009', 'la-determinant', 'subject-linalg', 'FORMULA',
    'n阶行列式的展开定理与代数余子式？',
    '**代数余子式：** $A_{ij}=(-1)^{i+j}M_{ij}$，其中 $M_{ij}$ 是去掉第 $i$ 行第 $j$ 列后的 $n-1$ 阶行列式。\n\n**按第 $i$ 行展开：**\n$|A|=\\sum_{j=1}^n a_{ij}A_{ij}$\n\n**重要性质：**\n- 某行元素与另一行对应代数余子式乘积之和为 0：$\\sum_{j=1}^n a_{ij}A_{kj}=0$（$i\\neq k$）\n- 即 $AA^*=|A|E$（伴随矩阵关系的来源）',
    '展开时选含零元素最多的行或列可减少计算量。', ['行列式', '代数余子式', '展开定理']),

  card('sc-la-010', 'la-determinant', 'subject-linalg', 'METHOD',
    '特殊行列式的计算方法（范德蒙德/三对角/爪形）？',
    '**范德蒙德行列式：**\n$V_n=\\prod_{1\\leq j<i\\leq n}(x_i-x_j)$\n\n**三对角行列式：** 按第一行展开建立递推关系 $D_n=aD_{n-1}-b^2 D_{n-2}$，解特征方程求通项。\n\n**爪形行列式：** 用第一行（或列）消去"爪"的非对角元素，化为上（下）三角。\n\n**加边法：** 对行列式增加一行一列，利用新结构简化计算。\n\n**拆项法：** 某行/列元素为两项之和时，拆为两个行列式之和。',
    '考研常考：识别范德蒙德结构是关键，注意下标顺序。', ['范德蒙德', '三对角', '爪形', '行列式计算']),

  card('sc-la-011', 'la-matrix', 'subject-linalg', 'FORMULA',
    '分块矩阵的运算规则？',
    '**加法：** 同型分块对应相加\n\n**乘法：** $\\begin{pmatrix}A&B\\\\C&D\\end{pmatrix}\\begin{pmatrix}X\\\\Y\\end{pmatrix}=\\begin{pmatrix}AX+BY\\\\CX+DY\\end{pmatrix}$\n\n**转置：** 先将子块视为元素转置，再对每个子块转置\n\n**分块对角阵求逆：**\n$\\begin{pmatrix}A&0\\\\0&B\\end{pmatrix}^{-1}=\\begin{pmatrix}A^{-1}&0\\\\0&B^{-1}\\end{pmatrix}$\n\n**副对角分块：**\n$\\begin{pmatrix}0&A\\\\B&0\\end{pmatrix}^{-1}=\\begin{pmatrix}0&B^{-1}\\\\A^{-1}&0\\end{pmatrix}$',
    '分块乘法要求内部分块的行列数匹配，不能随意分块。', ['分块矩阵', '矩阵运算']),

  card('sc-la-012', 'la-matrix', 'subject-linalg', 'THEOREM',
    '矩阵秩的重要性质？',
    '**基本不等式：**\n- $r(AB)\\leq\\min(r(A),r(B))$\n- $r(A+B)\\leq r(A)+r(B)$\n- $r(A)+r(B)-n\\leq r(AB)$（Sylvester 不等式）\n\n**其他性质：**\n- $r(A)=r(A^T)=r(A^TA)=r(AA^T)$\n- 初等变换不改变秩\n- $r(A_{m\\times n})\\leq\\min(m,n)$\n- $A$ 可逆时 $r(AB)=r(B)$，$r(BA)=r(B)$\n- $r(A^*)=\\begin{cases}n & r(A)=n\\\\ 1 & r(A)=n-1\\\\ 0 & r(A)<n-1\\end{cases}$',
    'Sylvester 不等式常用于证明题，注意 n 是 A 的列数（=B 的行数）。', ['矩阵秩', '不等式']),

  card('sc-la-013', 'la-matrix', 'subject-linalg', 'FORMULA',
    '伴随矩阵的性质？',
    '**定义：** $A^*=(A_{ji})_{n\\times n}$（代数余子式转置）\n\n**核心公式：**\n- $AA^*=A^*A=|A|E$\n- $A^*=|A|A^{-1}$（$A$ 可逆时）\n- $|A^*|=|A|^{n-1}$\n- $(A^*)^{-1}=(A^{-1})^*=\\frac{A}{|A|}$\n- $(kA)^*=k^{n-1}A^*$\n- $(AB)^*=B^*A^*$\n- $(A^T)^*=(A^*)^T$\n- $(A^*)^*=|A|^{n-2}A$（$n\\geq 3$）',
    '伴随矩阵的秩：满秩时为 n，秩为 n-1 时为 1，否则为 0。', ['伴随矩阵', '公式']),

  card('sc-la-014', 'la-vector', 'subject-linalg', 'THEOREM',
    '向量组等价与秩的关系？',
    '**向量组等价：** 两个向量组可以互相线性表示。\n\n**定理：**\n- 等价的向量组有相同的秩\n- 秩相同的向量组不一定等价\n- 若向量组 I 能被向量组 II 线性表示，则 $r(I)\\leq r(II)$\n- 向量组与其极大线性无关组等价\n\n**矩阵等价：** $r(A)=r(B)$ 且同型 <=> 存在可逆 $P,Q$ 使 $PAQ=B$\n\n**注意：** 矩阵等价 ≠ 向量组等价（矩阵等价只要求秩相同且同型）',
    '向量组等价是等价关系（自反、对称、传递）。', ['向量组等价', '秩']),

  card('sc-la-015', 'la-vector', 'subject-linalg', 'METHOD',
    '判断向量组线性相关性的方法？',
    '**方法一（定义法）：** 构造 $k_1\\alpha_1+...+k_n\\alpha_n=0$，判断是否只有零解。\n\n**方法二（行列式法）：** 向量个数=维数时，$|A|=0$ <=> 线性相关。\n\n**方法三（秩判定）：** 将向量组构成矩阵 $A$，$r(A)<$ 向量个数 <=> 线性相关。\n\n**方法四（性质判定）：**\n- 向量个数 > 维数 => 必相关\n- 含零向量 => 必相关\n- 部分相关 => 整体相关\n- 整体无关 => 部分无关\n\n**方法五（延伸/缩短）：** 缩短无关 => 原来无关；延伸相关 => 原来相关。',
    '考研选择题常用性质判定快速得出结论。', ['线性相关', '判定方法']),

  card('sc-la-016', 'la-vector', 'subject-linalg', 'CONCEPT',
    '极大线性无关组与向量空间的基？',
    '**极大线性无关组：** 向量组中一个最大的线性无关子组，满足：\n1. 该子组线性无关\n2. 向量组中任一向量都能被该子组线性表示\n\n**性质：**\n- 极大无关组不唯一，但所含向量个数相同（=秩）\n- 向量组与其极大无关组等价\n\n**向量空间的基：** $V$ 中一组线性无关的向量 $\\alpha_1,...,\\alpha_r$，使得 $V$ 中任一向量都能被它们线性表示。\n\n**维数：** 基所含向量的个数，记为 $\\dim V=r$。',
    '求极大无关组：对矩阵做行变换化为行阶梯形，主元所在列对应的原向量即为极大无关组。', ['极大无关组', '基', '维数']),

  card('sc-la-017', 'la-equations', 'subject-linalg', 'THEOREM',
    '齐次方程组有非零解的条件？',
    '**$Ax=0$ 有非零解的充要条件：**\n- $r(A)<n$（$n$ 为未知数个数）\n- 系数矩阵的列向量线性相关\n- $|A|=0$（方阵时）\n- $A$ 有特征值 0（方阵时）\n\n**基础解系：** 含 $n-r(A)$ 个线性无关的解向量，齐次方程组的通解为基础解系的线性组合。\n\n**推论：** $m$ 个方程 $n$ 个未知数，$m<n$ 时必有非零解。',
    '方程个数少于未知数个数时一定有非零解，但反之不一定无非零解。', ['齐次方程组', '非零解', '基础解系']),

  card('sc-la-018', 'la-equations', 'subject-linalg', 'FORMULA',
    '非齐次方程组解的结构？',
    '**$Ax=b$ 的解的结构：**\n\n通解 = 特解 $\\eta_0$ + 齐次通解\n\n即 $x=\\eta_0+k_1\\xi_1+k_2\\xi_2+...+k_{n-r}\\xi_{n-r}$\n\n其中 $\\xi_1,...,\\xi_{n-r}$ 是 $Ax=0$ 的基础解系。\n\n**性质：**\n- 两个特解之差是齐次方程组的解\n- 特解 + 齐次解 仍是非齐次的解\n- $k_1\\eta_1+k_2\\eta_2$（$k_1+k_2=1$）是非齐次的解\n- $k_1\\eta_1+k_2\\eta_2$（$k_1+k_2\\neq 1$）不是非齐次的解',
    '解的线性组合系数之和=1时仍为非齐次解，这是常考性质。', ['非齐次方程组', '解的结构']),

  card('sc-la-019', 'la-equations', 'subject-linalg', 'METHOD',
    '求基础解系的步骤？',
    '**步骤：**\n1. 对系数矩阵 $A$ 做初等行变换化为行最简形\n2. 确定主元列（约束变量）和自由列（自由变量）\n3. 令自由变量分别取单位向量值（如 $(1,0,...,0)^T$, $(0,1,...,0)^T$ 等）\n4. 由行最简形回代求出对应的约束变量值\n5. 得到 $n-r(A)$ 个解向量，即为基础解系\n\n**验证：** 基础解系的向量个数 = $n-r(A)$，且它们线性无关。',
    '自由变量取单位向量只是一种方便的选取方式，取其他线性无关的值也可以。', ['基础解系', '行最简形', '自由变量']),

  card('sc-la-020', 'la-eigenvalue', 'subject-linalg', 'FORMULA',
    '特征多项式与特征方程？',
    '**特征多项式：** $f(\\lambda)=|A-\\lambda E|$\n\n**特征方程：** $|A-\\lambda E|=0$\n\n**展开形式（$n$ 阶）：**\n$f(\\lambda)=(-1)^n[\\lambda^n-tr(A)\\lambda^{n-1}+...+(-1)^n|A|]$\n\n**韦达定理（特征值与系数）：**\n- $\\lambda_1+\\lambda_2+...+\\lambda_n=tr(A)=\\sum a_{ii}$\n- $\\lambda_1\\lambda_2...\\lambda_n=|A|$\n\n**Hamilton-Cayley 定理：** 矩阵满足自身的特征方程，即 $f(A)=O$。',
    'Hamilton-Cayley 定理可用于求矩阵高次幂：将 $A^k$ 用 $f(A)=0$ 降次。', ['特征多项式', '特征方程', 'Hamilton-Cayley']),

  card('sc-la-021', 'la-eigenvalue', 'subject-linalg', 'THEOREM',
    '特征值的性质？',
    '设 $A$ 的特征值为 $\\lambda$，对应特征向量为 $\\xi$：\n\n| 矩阵 | 特征值 | 特征向量 |\n|---|---|---|\n| $A$ | $\\lambda$ | $\\xi$ |\n| $kA$ | $k\\lambda$ | $\\xi$ |\n| $A^m$ | $\\lambda^m$ | $\\xi$ |\n| $A^{-1}$ | $1/\\lambda$ | $\\xi$ |\n| $A^*$ | $|A|/\\lambda$ | $\\xi$ |\n| $A+kE$ | $\\lambda+k$ | $\\xi$ |\n| $P^{-1}AP$ | $\\lambda$ | $P^{-1}\\xi$ |\n| $f(A)$ | $f(\\lambda)$ | $\\xi$ |\n\n**重要结论：**\n- $tr(A)=\\sum\\lambda_i$\n- $|A|=\\prod\\lambda_i$',
    '相似矩阵有相同的特征值、迹、行列式、秩，但特征向量一般不同。', ['特征值性质', '相似矩阵']),

  card('sc-la-022', 'la-eigenvalue', 'subject-linalg', 'MISTAKE',
    '特征向量的常见错误？',
    '**错误一：** 不同特征值的特征向量线性无关 ≠ 正交\n- 线性无关一定成立，但正交只对实对称矩阵成立\n\n**错误二：** 同一特征值的特征向量的线性组合仍是该特征值的特征向量\n- 注意：零向量不是特征向量，所以组合不能为零向量\n\n**错误三：** 不同特征值的特征向量不能相加作为某个特征值的特征向量\n- $\\xi_1+\\xi_2$ 既不是 $\\lambda_1$ 也不是 $\\lambda_2$ 的特征向量\n\n**错误四：** 特征向量的倍数仍是特征向量，但 $k\\neq 0$',
    '考研常设陷阱：将"线性无关"与"正交"混淆。', ['特征向量', '易错点']),

  card('sc-la-023', 'la-eigenvalue', 'subject-linalg', 'PROCESS',
    '实对称矩阵的正交对角化步骤？',
    '**步骤：**\n1. 求特征方程 $|A-\\lambda E|=0$ 的所有特征值\n2. 对每个特征值 $\\lambda_i$，解 $(A-\\lambda_i E)x=0$ 得特征向量\n3. 不同特征值的特征向量已正交，无需处理\n4. 同一特征值对应多个特征向量时，用施密特正交化\n5. 将所有特征向量单位化\n6. 构造正交矩阵 $P=(\\xi_1,...,\\xi_n)$\n7. $P^TAP=P^{-1}AP=\\Lambda=diag(\\lambda_1,...,\\lambda_n)$\n\n**实对称矩阵性质：**\n- 特征值全为实数\n- 一定可对角化\n- 不同特征值的特征向量正交',
    '施密特正交化只需对同一特征值的特征向量进行。', ['正交对角化', '实对称矩阵', '施密特']),

  card('sc-la-024', 'la-quadratic', 'subject-linalg', 'FORMULA',
    '二次型的矩阵表示？',
    '**二次型：** $f(x_1,...,x_n)=\\sum_{i=1}^n\\sum_{j=1}^n a_{ij}x_ix_j=x^TAx$\n\n其中 $A$ 为对称矩阵（$a_{ij}=a_{ji}$）。\n\n**矩阵构造规则：**\n- 对角线 $a_{ii}$：$x_i^2$ 的系数\n- 非对角线 $a_{ij}$（$i\\neq j$）：$x_ix_j$ 系数的一半\n\n**例：** $f=x_1^2+4x_1x_2+3x_2^2$\n$A=\\begin{pmatrix}1&2\\\\2&3\\end{pmatrix}$\n\n**二次型的秩 = 矩阵 $A$ 的秩 = 标准形中非零项个数。**',
    '注意交叉项系数要除以 2 放入矩阵。', ['二次型', '矩阵表示']),

  card('sc-la-025', 'la-quadratic', 'subject-linalg', 'THEOREM',
    '正定矩阵的等价条件？',
    '实对称矩阵 $A$ 正定的等价条件：\n1. 对任意 $x\\neq 0$，$x^TAx>0$\n2. $A$ 的特征值全为正\n3. $A$ 的各阶顺序主子式全为正\n4. $A$ 合同于单位阵 $E$（存在可逆 $C$ 使 $C^TAC=E$）\n5. $A=C^TC$（$C$ 可逆）\n6. $A$ 的正惯性指数 $p=n$\n\n**正定的必要条件：**\n- $a_{ii}>0$（对角线元素全正）\n- $|A|>0$',
    '判断正定：小规模用顺序主子式，大规模用特征值。半正定将">"改为"≥"。', ['正定矩阵', '等价条件']),

  card('sc-la-026', 'la-quadratic', 'subject-linalg', 'METHOD',
    '用配方法化二次型为标准形？',
    '**步骤：**\n1. 若有平方项 $x_i^2$：将含 $x_i$ 的项配方，消去交叉项\n2. 若无平方项：先做变量替换（如 $x_1=y_1+y_2,x_2=y_1-y_2$）产生平方项\n3. 重复直到所有交叉项消除\n4. 得标准形 $f=d_1y_1^2+d_2y_2^2+...+d_ny_n^2$\n\n**例：** $f=2x_1x_2$\n令 $x_1=y_1+y_2,x_2=y_1-y_2$\n$f=2(y_1+y_2)(y_1-y_2)=2y_1^2-2y_2^2$\n\n**注意：** 配方法得到的变换矩阵不一定正交。',
    '配方法适合填空/计算题；正交变换法适合需要正交矩阵的题目。', ['配方法', '标准形', '二次型']),

  card('sc-la-027', 'la-matrix', 'subject-linalg', 'MISTAKE',
    '矩阵运算的常见错误？',
    '**错误一：** $AB=BA$（矩阵乘法一般不可交换）\n- 反例：$AB\\neq BA$ 是常态，$AB=BA$ 需特殊条件\n\n**错误二：** $AB=0$ 推出 $A=0$ 或 $B=0$\n- 反例：$A=\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix},B=\\begin{pmatrix}0&0\\\\1&0\\end{pmatrix}$\n\n**错误三：** $(AB)^T=A^TB^T$\n- 正确：$(AB)^T=B^TA^T$（转置要逆序）\n\n**错误四：** $(A+B)^2=A^2+2AB+B^2$\n- 正确：$(A+B)^2=A^2+AB+BA+B^2$\n\n**错误五：** $A^2=A$ 推出 $A=E$ 或 $A=O$\n- 反例：任何幂等矩阵（$r(A)\\neq 0,n$）',
    '矩阵消去律不成立：$AB=AC$ 且 $A\\neq O$ 不能推出 $B=C$（除非 $A$ 可逆）。', ['矩阵运算', '易错点']),

  card('sc-la-028', 'la-equations', 'subject-linalg', 'COMPARE',
    '克拉默法则与高斯消元法的适用场景？',
    '| 特性 | 克拉默法则 | 高斯消元法 |\n|---|---|---|\n| 适用条件 | 方程数=未知数，$|A|\\neq 0$ | 任意线性方程组 |\n| 解的情况 | 只能求唯一解 | 可处理无解/无穷多解 |\n| 计算量 | $O(n\\cdot n!)$（行列式） | $O(n^3)$（消元） |\n| 理论价值 | 高（证明解的存在唯一性） | 实际计算首选 |\n| 公式 | $x_j=|A_j|/|A|$ | 增广矩阵行变换 |\n\n**克拉默法则：** $x_j=\\frac{D_j}{D}$，$D_j$ 是将 $D$ 中第 $j$ 列替换为常数列。',
    '克拉默法则主要用于理论证明和小规模（2-3阶）计算。', ['克拉默法则', '高斯消元', '对比']),

  // ═══ 概率论与数理统计（补充 II） ═══════════════════════════════════════════
  card('sc-prob-013', 'prob-event', 'subject-prob', 'FORMULA',
    '条件概率与乘法公式？',
    '**条件概率：** $P(B|A)=\\frac{P(AB)}{P(A)}$，$P(A)>0$\n\n**乘法公式：**\n- $P(AB)=P(A)P(B|A)=P(B)P(A|B)$\n- $P(ABC)=P(A)P(B|A)P(C|AB)$\n\n**推广（链式法则）：**\n$P(A_1A_2...A_n)=P(A_1)P(A_2|A_1)P(A_3|A_1A_2)...P(A_n|A_1...A_{n-1})$\n\n**注意：** 条件概率本身也是概率，满足概率的所有公理。',
    '乘法公式是全概率公式和贝叶斯公式的基础。', ['条件概率', '乘法公式']),

  card('sc-prob-014', 'prob-event', 'subject-prob', 'THEOREM',
    '事件独立性的定义与判定？',
    '**两事件独立：** $P(AB)=P(A)P(B)$\n\n**等价条件：**\n- $P(B|A)=P(B)$\n- $P(A|B)=P(A)$\n\n**三事件相互独立：** 需同时满足：\n- $P(AB)=P(A)P(B)$\n- $P(AC)=P(A)P(C)$\n- $P(BC)=P(B)P(C)$\n- $P(ABC)=P(A)P(B)P(C)$\n\n**注意：** 两两独立 ≠ 相互独立（两两独立不需要最后一个条件）\n\n**性质：** $A,B$ 独立 => $A,\\bar{B}$ 独立 => $\\bar{A},\\bar{B}$ 独立。',
    '考研常考：构造两两独立但不相互独立的例子。', ['独立性', '相互独立', '两两独立']),

  card('sc-prob-015', 'prob-event', 'subject-prob', 'METHOD',
    '古典概型与几何概型的解题策略？',
    '**古典概型：** 有限等可能样本空间\n$P(A)=\\frac{A\\text{包含的样本点数}}{\\text{样本点总数}}$\n\n**常用计数方法：**\n- 排列 $A_n^k=\\frac{n!}{(n-k)!}$\n- 组合 $C_n^k=\\frac{n!}{k!(n-k)!}$\n- 隔板法、捆绑法、插空法\n\n**几何概型：** 样本空间为区域，概率与面积/体积/长度成正比\n$P(A)=\\frac{A\\text{对应的几何度量}}{\\Omega\\text{的几何度量}}$\n\n**解题关键：** 正确确定样本空间和事件对应的区域。',
    '几何概型常见模型：会面问题（$|x-y|<t$ 的面积）、Buffon 投针。', ['古典概型', '几何概型', '计数']),

  card('sc-prob-016', 'prob-rv', 'subject-prob', 'CONCEPT',
    '分布函数的性质？',
    '**分布函数 $F(x)=P(X\\leq x)$ 的性质：**\n\n1. **单调不减：** $x_1<x_2$ => $F(x_1)\\leq F(x_2)$\n2. **右连续：** $F(x^+)=F(x)$（即 $\\lim_{t\\to x^+}F(t)=F(x)$）\n3. **极限：** $F(-\\infty)=0$，$F(+\\infty)=1$\n4. **取值范围：** $0\\leq F(x)\\leq 1$\n\n**概率计算：**\n- $P(a<X\\leq b)=F(b)-F(a)$\n- $P(X=a)=F(a)-F(a^-)$\n- $P(X>a)=1-F(a)$\n- $P(a\\leq X\\leq b)=F(b)-F(a^-)$',
    '连续型 $F(x)$ 处处连续；离散型 $F(x)$ 为右连续阶梯函数。', ['分布函数', '性质', '右连续']),

  card('sc-prob-017', 'prob-rv', 'subject-prob', 'FORMULA',
    '随机变量函数的分布（Y=g(X)的密度公式）？',
    '**离散型：** 直接计算 $P(Y=y_k)=\\sum_{g(x_i)=y_k}P(X=x_i)$\n\n**连续型（公式法）：** 若 $y=g(x)$ 在 $(a,b)$ 上严格单调，反函数 $x=h(y)$：\n$f_Y(y)=f_X(h(y))\\cdot|h\'(y)|$，$y\\in(\\alpha,\\beta)$\n\n**分布函数法（通用）：**\n1. $F_Y(y)=P(Y\\leq y)=P(g(X)\\leq y)$\n2. 将不等式转化为 $X$ 的范围\n3. 用 $f_X$ 积分求 $F_Y(y)$\n4. 求导得 $f_Y(y)=F_Y\'(y)$\n\n**非单调情况：** 分段处理，分别求各单调区间的贡献再相加。',
    '公式法只适用于严格单调函数；非单调必须用分布函数法。', ['随机变量函数', '密度公式', '分布函数法']),

  card('sc-prob-018', 'prob-rv', 'subject-prob', 'MISTAKE',
    '连续型随机变量 P(X=a)=0 但不代表不可能事件？',
    '**核心区别：**\n- 不可能事件 $\\emptyset$：绝对不会发生\n- $P(X=a)=0$：概率为零，但 $\\{X=a\\}$ 可能发生\n\n**原因：** 连续型随机变量取任何单点值的概率为 0，因为 $P(X=a)=\\int_a^a f(x)dx=0$\n\n**推论：**\n- $P(a<X<b)=P(a\\leq X\\leq b)=P(a<X\\leq b)=P(a\\leq X<b)$\n- 连续型中端点是否包含不影响概率\n\n**反例：** $X\\sim U(0,1)$，$P(X=0.5)=0$，但 $X=0.5$ 是可能的取值。',
    '这是概率论中"几乎必然"概念的基础：$P(A)=1$ 不意味着 $A$ 一定发生。', ['连续型', '零概率事件', '易错点']),

  card('sc-prob-019', 'prob-multi-rv', 'subject-prob', 'FORMULA',
    '二维正态分布的五个参数及边缘分布？',
    '**$(X,Y)\\sim N(\\mu_1,\\mu_2,\\sigma_1^2,\\sigma_2^2,\\rho)$**\n\n**五个参数：** $\\mu_1,\\mu_2$（均值），$\\sigma_1^2,\\sigma_2^2$（方差），$\\rho$（相关系数）\n\n**边缘分布：**\n- $X\\sim N(\\mu_1,\\sigma_1^2)$\n- $Y\\sim N(\\mu_2,\\sigma_2^2)$\n\n**重要性质：**\n- $X,Y$ 独立 <=> $\\rho=0$（正态分布中不相关等价于独立）\n- $aX+bY\\sim N(a\\mu_1+b\\mu_2,\\;a^2\\sigma_1^2+b^2\\sigma_2^2+2ab\\rho\\sigma_1\\sigma_2)$\n- 条件分布仍为正态分布',
    '二维正态是唯一由边缘分布不能确定联合分布的反例来源（$\\rho$ 不同则联合分布不同）。', ['二维正态', '边缘分布', '五参数']),

  card('sc-prob-020', 'prob-multi-rv', 'subject-prob', 'THEOREM',
    '随机变量独立性的判定条件？',
    '**定义：** $F(x,y)=F_X(x)F_Y(y)$ 对所有 $x,y$ 成立。\n\n**等价条件：**\n- 离散型：$P(X=x_i,Y=y_j)=P(X=x_i)P(Y=y_j)$ 对所有 $i,j$ 成立\n- 连续型：$f(x,y)=f_X(x)f_Y(y)$ 几乎处处成立\n\n**判定技巧：**\n1. 联合密度能否分离为 $g(x)h(y)$ 的形式（注意定义域也要可分离）\n2. 若 $f(x,y)$ 的非零区域不是矩形，则 $X,Y$ 不独立\n\n**重要结论：**\n- 独立 => 不相关（$\\rho=0$）\n- 不相关 ≠> 独立（除非正态分布）',
    '判断独立性时，定义域的形状是关键：三角形区域一定不独立。', ['独立性', '判定', '联合分布']),

  card('sc-prob-021', 'prob-multi-rv', 'subject-prob', 'METHOD',
    '求条件分布的步骤？',
    '**离散型条件分布：**\n$P(X=x_i|Y=y_j)=\\frac{P(X=x_i,Y=y_j)}{P(Y=y_j)}=\\frac{p_{ij}}{p_{\\cdot j}}$\n\n**连续型条件密度：**\n$f_{X|Y}(x|y)=\\frac{f(x,y)}{f_Y(y)}$，$f_Y(y)>0$\n\n**求解步骤：**\n1. 求边缘密度 $f_Y(y)=\\int_{-\\infty}^{+\\infty}f(x,y)dx$\n2. 代入公式 $f_{X|Y}(x|y)=\\frac{f(x,y)}{f_Y(y)}$\n3. 确定条件密度的取值范围（可能依赖于 $y$）\n\n**条件期望：** $E(X|Y=y)=\\int_{-\\infty}^{+\\infty}x\\cdot f_{X|Y}(x|y)dx$',
    '条件密度的积分范围可能随条件变量 $y$ 的值而变化。', ['条件分布', '条件密度', '条件期望']),

  card('sc-prob-022', 'prob-numeric', 'subject-prob', 'FORMULA',
    '期望和方差的运算性质？',
    '**期望性质：**\n- $E(C)=C$\n- $E(aX+b)=aE(X)+b$\n- $E(X\\pm Y)=E(X)\\pm E(Y)$（无需独立）\n- $E(XY)=E(X)E(Y)$（需 $X,Y$ 独立）\n\n**方差性质：**\n- $D(X)=E(X^2)-[E(X)]^2$\n- $D(C)=0$\n- $D(aX+b)=a^2D(X)$\n- $D(X\\pm Y)=D(X)+D(Y)\\pm 2Cov(X,Y)$\n- 独立时：$D(X\\pm Y)=D(X)+D(Y)$\n- $D(X)=0$ <=> $P(X=E(X))=1$\n\n**最小方差性质：** $E(X-C)^2$ 在 $C=E(X)$ 时最小，最小值为 $D(X)$。',
    '$E(X+Y)=E(X)+E(Y)$ 不需要独立条件，这是期望的线性性。', ['期望', '方差', '运算性质']),

  card('sc-prob-023', 'prob-numeric', 'subject-prob', 'THEOREM',
    '切比雪夫不等式及其应用？',
    '**切比雪夫不等式：** 设 $E(X)=\\mu$，$D(X)=\\sigma^2$，则对任意 $\\varepsilon>0$：\n\n$$P(|X-\\mu|\\geq\\varepsilon)\\leq\\frac{\\sigma^2}{\\varepsilon^2}$$\n\n等价形式：$P(|X-\\mu|<\\varepsilon)\\geq 1-\\frac{\\sigma^2}{\\varepsilon^2}$\n\n**应用：**\n1. 估计概率的上/下界\n2. 证明大数定律（切比雪夫大数定律）\n3. 说明方差越小，$X$ 越集中在均值附近\n\n**条件：** 只需知道期望和方差，不需要知道具体分布。',
    '切比雪夫不等式给出的是粗略估计，实际概率通常远小于上界。', ['切比雪夫不等式', '概率估计']),

  card('sc-prob-024', 'prob-law', 'subject-prob', 'THEOREM',
    '大数定律（伯努利/辛钦/切比雪夫）的条件与结论？',
    '**伯努利大数定律：**\n$n$ 次独立试验中事件 $A$ 发生 $n_A$ 次，$P(A)=p$：\n$\\frac{n_A}{n}\\xrightarrow{P}p$（频率依概率收敛于概率）\n\n**辛钦大数定律：**\n$X_1,...,X_n$ iid，$E(X_i)=\\mu$ 存在：\n$\\bar{X}=\\frac{1}{n}\\sum X_i\\xrightarrow{P}\\mu$\n\n**切比雪夫大数定律：**\n$X_1,...,X_n$ 相互独立，$E(X_i),D(X_i)$ 存在且方差有公共上界：\n$\\frac{1}{n}\\sum X_i-\\frac{1}{n}\\sum E(X_i)\\xrightarrow{P}0$\n\n**核心：** 样本均值依概率收敛于总体均值。',
    '辛钦定律条件最弱（只需期望存在），伯努利是辛钦的特例（$X_i\\sim B(1,p)$）。', ['大数定律', '依概率收敛']),

  card('sc-prob-025', 'prob-stat', 'subject-prob', 'FORMULA',
    '正态总体下的抽样分布定理？',
    '设 $X_1,...,X_n$ iid $\\sim N(\\mu,\\sigma^2)$，$\\bar{X}$ 为样本均值，$S^2$ 为样本方差：\n\n**定理一：** $\\bar{X}\\sim N(\\mu,\\sigma^2/n)$\n\n**定理二：** $\\frac{(n-1)S^2}{\\sigma^2}\\sim\\chi^2(n-1)$\n\n**定理三：** $\\bar{X}$ 与 $S^2$ 相互独立\n\n**定理四：** $\\frac{\\bar{X}-\\mu}{S/\\sqrt{n}}\\sim t(n-1)$\n\n**两总体：**\n$\\frac{S_1^2/\\sigma_1^2}{S_2^2/\\sigma_2^2}\\sim F(n_1-1,n_2-1)$',
    '定理三（$\\bar{X}$ 与 $S^2$ 独立）是正态总体特有的性质，非正态不一定成立。', ['抽样分布', '正态总体', 't分布']),

  card('sc-prob-026', 'prob-stat', 'subject-prob', 'CONCEPT',
    '统计量的概念（样本均值/样本方差的性质）？',
    '**统计量：** 样本的不含未知参数的函数。\n\n**常用统计量：**\n- 样本均值：$\\bar{X}=\\frac{1}{n}\\sum_{i=1}^n X_i$\n- 样本方差：$S^2=\\frac{1}{n-1}\\sum_{i=1}^n(X_i-\\bar{X})^2$\n- 样本标准差：$S=\\sqrt{S^2}$\n- 样本 $k$ 阶矩：$A_k=\\frac{1}{n}\\sum X_i^k$\n\n**性质：**\n- $E(\\bar{X})=\\mu$，$D(\\bar{X})=\\sigma^2/n$\n- $E(S^2)=\\sigma^2$（无偏性，这是分母用 $n-1$ 的原因）\n- $\\bar{X}$ 是 $\\mu$ 的无偏估计\n- $S^2$ 是 $\\sigma^2$ 的无偏估计',
    '分母用 $n-1$（而非 $n$）称为 Bessel 校正，保证无偏性。', ['统计量', '样本均值', '样本方差', '无偏']),

  card('sc-prob-027', 'prob-estimation', 'subject-prob', 'COMPARE',
    '矩估计与最大似然估计的对比？',
    '| 特性 | 矩估计（MOM） | 最大似然估计（MLE） |\n|---|---|---|\n| 思想 | 用样本矩替代总体矩 | 使样本出现概率最大 |\n| 步骤 | 列 $E(X^k)=A_k$ 解方程 | 求 $\\ln L$ 的极值点 |\n| 计算难度 | 简单 | 可能较复杂 |\n| 唯一性 | 一般唯一 | 可能不唯一 |\n| 无偏性 | 不一定无偏 | 不一定无偏 |\n| 有效性 | 一般较差 | 渐近有效 |\n| 不变性 | 无 | 有（$g(\\theta)$ 的 MLE 为 $g(\\hat{\\theta})$） |\n\n**矩估计步骤：**\n1. 求 $E(X)=g_1(\\theta)$，$E(X^2)=g_2(\\theta)$\n2. 令 $\\bar{X}=g_1(\\theta)$，$A_2=g_2(\\theta)$\n3. 解出 $\\hat{\\theta}$',
    '两种方法结果可能不同；MLE 统计性质更优但计算更复杂。', ['矩估计', '最大似然估计', '对比']),

  card('sc-prob-028', 'prob-estimation', 'subject-prob', 'THEOREM',
    '估计量的评价标准（无偏性/有效性/一致性）？',
    '**无偏性：** $E(\\hat{\\theta})=\\theta$\n- $\\bar{X}$ 是 $\\mu$ 的无偏估计\n- $S^2$ 是 $\\sigma^2$ 的无偏估计\n- $\\frac{1}{n}\\sum(X_i-\\bar{X})^2$ 不是 $\\sigma^2$ 的无偏估计\n\n**有效性：** 在无偏估计中，方差越小越有效。\n- $D(\\hat{\\theta}_1)<D(\\hat{\\theta}_2)$ 则 $\\hat{\\theta}_1$ 更有效\n- Cramer-Rao 下界：$D(\\hat{\\theta})\\geq\\frac{1}{nI(\\theta)}$\n\n**一致性（相合性）：** $\\hat{\\theta}_n\\xrightarrow{P}\\theta$（$n\\to\\infty$）\n- 由大数定律，矩估计量通常具有一致性',
    '无偏性是对估计量的基本要求；有效性在无偏估计中比较才有意义。', ['无偏性', '有效性', '一致性', '估计量评价']),

  card('sc-prob-029', 'prob-hypothesis', 'subject-prob', 'PROCESS',
    '假设检验的一般步骤？',
    '**步骤：**\n1. **建立假设：** $H_0$（原假设）与 $H_1$（备择假设）\n2. **选择检验统计量：** 根据问题类型选择（$Z$, $t$, $\\chi^2$, $F$）\n3. **确定拒绝域：** 由显著性水平 $\\alpha$ 和 $H_1$ 的形式（单侧/双侧）确定\n4. **计算统计量的值：** 代入样本数据\n5. **做出判断：** 统计量落入拒绝域则拒绝 $H_0$\n\n**常用检验：**\n| 参数 | $\\sigma^2$ 已知 | $\\sigma^2$ 未知 |\n|---|---|---|\n| $\\mu$ | $Z$ 检验 | $t$ 检验 |\n| $\\sigma^2$ | — | $\\chi^2$ 检验 |',
    '显著性水平 $\\alpha$ 越小，拒绝域越小，犯第一类错误的概率越小。', ['假设检验', '步骤', '拒绝域']),

  card('sc-prob-030', 'prob-hypothesis', 'subject-prob', 'CONCEPT',
    '两类错误（弃真/取伪）与显著性水平？',
    '**第一类错误（弃真）：** $H_0$ 为真但拒绝了 $H_0$\n- 概率：$\\alpha=P(\\text{拒绝}H_0|H_0\\text{为真})$\n\n**第二类错误（取伪）：** $H_0$ 为假但接受了 $H_0$\n- 概率：$\\beta=P(\\text{接受}H_0|H_0\\text{为假})$\n\n**关系：**\n- $\\alpha$ 和 $\\beta$ 不能同时减小（样本量固定时）\n- 增大样本量 $n$ 可同时减小 $\\alpha$ 和 $\\beta$\n- Neyman-Pearson 原则：控制 $\\alpha$（更严重的错误），在此前提下尽量减小 $\\beta$\n\n**显著性水平：** 预先给定的 $\\alpha$ 值（常取 0.05 或 0.01）。',
    '假设检验只能"拒绝 $H_0$"或"不拒绝 $H_0$"，不能说"接受 $H_0$"。', ['两类错误', '显著性水平', '弃真取伪']),

  card('sc-prob-031', 'prob-numeric', 'subject-prob', 'METHOD',
    '求随机变量函数的期望（LOTUS公式）？',
    '**LOTUS（Law of the Unconscious Statistician）：**\n\n不需要先求 $Y=g(X)$ 的分布，直接用 $X$ 的分布求 $E(Y)$：\n\n**离散型：** $E(g(X))=\\sum_i g(x_i)p_i$\n\n**连续型：** $E(g(X))=\\int_{-\\infty}^{+\\infty}g(x)f_X(x)dx$\n\n**二维推广：**\n$E(g(X,Y))=\\int\\int g(x,y)f(x,y)dxdy$\n\n**常用技巧：**\n- $E(X^2)$ 用于求方差：$D(X)=E(X^2)-[E(X)]^2$\n- $E(XY)$ 用于求协方差：$Cov(X,Y)=E(XY)-E(X)E(Y)$',
    'LOTUS 公式避免了求 $g(X)$ 分布的繁琐过程，是计算期望的核心工具。', ['LOTUS', '期望', '随机变量函数']),

  card('sc-prob-032', 'prob-multi-rv', 'subject-prob', 'FORMULA',
    '最大值最小值分布 $P(\\max\\leq x)=\\prod F_i(x)$？',
    '设 $X_1,...,X_n$ 相互独立，分布函数分别为 $F_1,...,F_n$：\n\n**最大值 $M=\\max(X_1,...,X_n)$：**\n$F_M(x)=P(M\\leq x)=P(X_1\\leq x,...,X_n\\leq x)=\\prod_{i=1}^n F_i(x)$\n\n**最小值 $N=\\min(X_1,...,X_n)$：**\n$F_N(x)=1-P(N>x)=1-\\prod_{i=1}^n[1-F_i(x)]$\n\n**iid 情形：**\n- $F_M(x)=[F(x)]^n$，$f_M(x)=n[F(x)]^{n-1}f(x)$\n- $F_N(x)=1-[1-F(x)]^n$，$f_N(x)=n[1-F(x)]^{n-1}f(x)$\n\n**应用：** 系统可靠性（串联=最小值，并联=最大值）。',
    '串联系统寿命取最小值（一个坏全坏），并联系统寿命取最大值（全坏才坏）。', ['最大值分布', '最小值分布', '顺序统计量']),

  // ═══ 408 专项卡片 — 数据结构 ═══════════════════════════════════════════
  card('sc-408-001', 'ds-seq-list', 'subject-ds', 'FORMULA',
    '顺序表插入和删除操作的平均移动次数是多少？',
    '设顺序表长度为 $n$，等概率情况下：\n\n**插入：** 在第 $i$（$1 \\leq i \\leq n+1$）个位置插入，需移动 $n-i+1$ 个元素。\n$$E_{insert} = \\frac{1}{n+1}\\sum_{i=1}^{n+1}(n-i+1) = \\frac{n}{2}$$\n\n**删除：** 删除第 $i$（$1 \\leq i \\leq n$）个元素，需移动 $n-i$ 个元素。\n$$E_{delete} = \\frac{1}{n}\\sum_{i=1}^{n}(n-i) = \\frac{n-1}{2}$$',
    '插入有 n+1 个合法位置，删除有 n 个合法位置，注意分母不同。', ['顺序表', '平均移动次数']),

  card('sc-408-002', 'ds-linked-list', 'subject-ds', 'PROCESS',
    '单链表头插法和尾插法建表的过程？',
    '**头插法（逆序建表）：**\n1. 创建头节点 L，L->next = NULL\n2. 对每个新节点 s：\n   - s->next = L->next\n   - L->next = s\n3. 结果：节点顺序与输入顺序相反\n\n**尾插法（正序建表）：**\n1. 创建头节点 L，尾指针 r = L\n2. 对每个新节点 s：\n   - r->next = s\n   - r = s\n3. 最后 r->next = NULL\n4. 结果：节点顺序与输入顺序相同',
    '头插法常用于链表逆置；尾插法需要维护尾指针 r。时间复杂度均为 O(n)。', ['链表', '建表', '头插法', '尾插法']),

  card('sc-408-003', 'ds-stack-app', 'subject-ds', 'METHOD',
    '栈在中缀表达式转后缀表达式中的应用？',
    '**算法步骤（运算符栈法）：**\n1. 从左到右扫描中缀表达式\n2. 遇到操作数：直接输出\n3. 遇到左括号：入栈\n4. 遇到右括号：弹出栈顶并输出，直到遇到左括号（左括号弹出不输出）\n5. 遇到运算符：\n   - 若栈空或栈顶为 ( 或当前运算符优先级 > 栈顶，入栈\n   - 否则弹出栈顶并输出，重复比较，最后当前运算符入栈\n6. 扫描结束后，依次弹出栈中剩余运算符\n\n**示例：** a+b*c-(d+e) -> abc*+de+-',
    '后缀表达式求值：遇到操作数入栈，遇到运算符弹出两个操作数计算后结果入栈。', ['栈', '表达式求值', '中缀转后缀']),

  card('sc-408-004', 'ds-queue', 'subject-ds', 'FORMULA',
    '循环队列的入队和出队操作及队列长度公式？',
    '设数组大小 MaxSize，队头 front，队尾 rear（指向下一个插入位置）：\n\n**入队：** Q[rear] = x; rear = (rear + 1) % MaxSize;\n\n**出队：** x = Q[front]; front = (front + 1) % MaxSize;\n\n**队空：** $front = rear$\n**队满：** $(rear + 1) \\% MaxSize = front$\n**队列长度：** $(rear - front + MaxSize) \\% MaxSize$',
    '牺牲一个存储单元区分队空和队满。也可用 size 变量或 tag 标志位代替。', ['循环队列', '入队', '出队']),

  card('sc-408-005', 'ds-binary-tree', 'subject-ds', 'FORMULA',
    '二叉树的基本性质（节点数与度的关系）？',
    '**性质 1：** 第 $i$ 层最多有 $2^{i-1}$ 个节点（$i \\geq 1$）\n\n**性质 2：** 深度为 $k$ 的二叉树最多有 $2^k - 1$ 个节点\n\n**性质 3（核心）：** 设度为 0、1、2 的节点数分别为 $n_0, n_1, n_2$：\n$$n_0 = n_2 + 1$$\n\n**推导：** 总节点 $n = n_0 + n_1 + n_2$；总边数 $= n-1 = n_1 + 2n_2$\n联立得 $n_0 = n_2 + 1$\n\n**完全二叉树：** $n$ 个节点的完全二叉树深度为 $\\lfloor\\log_2 n\\rfloor + 1$',
    '叶子节点数 = 度为2的节点数 + 1，这是所有二叉树的通用性质。', ['二叉树', '性质', '节点数']),

  card('sc-408-006', 'ds-tree-traversal', 'subject-ds', 'PROCESS',
    '二叉树前中后序遍历的递归与非递归实现？',
    '**递归定义：**\n- 前序：根 -> 左 -> 右\n- 中序：左 -> 根 -> 右\n- 后序：左 -> 右 -> 根\n\n**非递归中序遍历（栈）：**\n1. 当前节点非空或栈非空时循环\n2. 当前节点非空：入栈，走向左子树\n3. 当前节点为空：弹栈，访问，走向右子树\n\n**非递归后序遍历：**\n- 方法一：双栈法（前序变形"根右左"的结果逆序）\n- 方法二：设 prev 指针记录上次访问节点，判断右子树是否已访问',
    '已知前序+中序或后序+中序可唯一确定二叉树；前序+后序不能唯一确定。', ['遍历', '递归', '非递归', '栈']),

  card('sc-408-007', 'ds-bst', 'subject-ds', 'PROCESS',
    'BST（二叉排序树）的查找、插入、删除操作？',
    '**查找：** 从根开始，key < 当前节点走左子树，key > 当前节点走右子树，相等则找到。\n\n**插入：** 查找失败的位置即为插入位置（新节点一定是叶子）。\n\n**删除（三种情况）：**\n1. 叶子节点：直接删除\n2. 只有一棵子树：用子树替代\n3. 有两棵子树：用中序前驱（左子树最大）或中序后继（右子树最小）替代，再删除替代节点\n\n**时间复杂度：** 平均 $O(\\log n)$，最坏（退化为链表）$O(n)$',
    'BST 的中序遍历结果是有序序列。', ['BST', '查找', '插入', '删除']),

  card('sc-408-008', 'ds-avl', 'subject-ds', 'CONCEPT',
    'AVL树的四种旋转操作（LL/RR/LR/RL）？',
    '**平衡因子：** 左子树高度 - 右子树高度，AVL 树中 $|BF| \\leq 1$\n\n**四种失衡与旋转：**\n| 失衡类型 | 原因 | 旋转操作 |\n|---|---|---|\n| LL | 在左子树的左子树插入 | 右旋 |\n| RR | 在右子树的右子树插入 | 左旋 |\n| LR | 在左子树的右子树插入 | 先左旋后右旋 |\n| RL | 在右子树的左子树插入 | 先右旋后左旋 |\n\n**右旋（LL）：** 将失衡节点的左孩子提升为新根，失衡节点成为新根的右孩子。\n**左旋（RR）：** 将失衡节点的右孩子提升为新根，失衡节点成为新根的左孩子。',
    '插入后从插入点向上找第一个失衡节点，对其进行旋转即可恢复平衡。', ['AVL', '旋转', '平衡二叉树']),

  card('sc-408-009', 'ds-graph-storage', 'subject-ds', 'COMPARE',
    '邻接矩阵与邻接表的对比？',
    '| 特性 | 邻接矩阵 | 邻接表 |\n|---|---|---|\n| 存储空间 | $O(V^2)$ | $O(V+E)$ |\n| 适用图 | 稠密图 | 稀疏图 |\n| 判断边存在 | $O(1)$ | $O(度)$ |\n| 求顶点的度 | $O(V)$ | $O(度)$ |\n| 遍历所有边 | $O(V^2)$ | $O(V+E)$ |\n| 唯一性 | 唯一 | 不唯一（边表顺序可变） |\n\n**邻接矩阵：** 无向图对称，$A[i][j]=1$ 表示边存在。\n**邻接表：** 每个顶点一个链表，存储其邻接顶点。',
    '有向图中邻接表只能求出度，求入度需遍历整个表或使用逆邻接表。', ['邻接矩阵', '邻接表', '图存储']),

  card('sc-408-010', 'ds-mst', 'subject-ds', 'COMPARE',
    'Prim算法与Kruskal算法对比？',
    '| 特性 | Prim | Kruskal |\n|---|---|---|\n| 策略 | 选最近的顶点 | 选最短的边 |\n| 数据结构 | 优先队列/数组 | 并查集 |\n| 时间复杂度 | $O(V^2)$ 或 $O(E\\log V)$ | $O(E\\log E)$ |\n| 适用场景 | 稠密图 | 稀疏图 |\n| 思想 | 从一个顶点扩展 | 从所有边中选 |\n\n**Prim：** 维护已选顶点集合 $U$，每次选 $U$ 到 $V-U$ 的最小权边。\n**Kruskal：** 将边按权排序，依次选不构成环的最小边（并查集判环）。',
    '两种算法都基于贪心策略，结果可能不同但权值和相同（MST 可能不唯一）。', ['Prim', 'Kruskal', '最小生成树']),

  card('sc-408-011', 'ds-shortest-path', 'subject-ds', 'COMPARE',
    'Dijkstra算法与Floyd算法对比？',
    '| 特性 | Dijkstra | Floyd |\n|---|---|---|\n| 问题 | 单源最短路径 | 所有顶点对最短路径 |\n| 负权边 | 不适用 | 可处理（无负权回路） |\n| 时间复杂度 | $O(V^2)$ 或 $O(E\\log V)$ | $O(V^3)$ |\n| 空间复杂度 | $O(V)$ | $O(V^2)$ |\n| 思想 | 贪心 | 动态规划 |\n\n**Dijkstra：** 维护 dist[] 数组，每次选未访问的最小 dist 顶点，松弛其邻接边。\n**Floyd：** $dist[i][j] = \\min(dist[i][j], dist[i][k]+dist[k][j])$，枚举中间顶点 k。',
    'Dijkstra 不能处理负权边；Bellman-Ford 可以处理负权边但复杂度为 O(VE)。', ['Dijkstra', 'Floyd', '最短路径']),

  card('sc-408-012', 'ds-topo-sort', 'subject-ds', 'PROCESS',
    '拓扑排序的步骤和应用？',
    '**算法步骤（BFS/Kahn）：**\n1. 计算所有顶点的入度\n2. 将入度为 0 的顶点入队\n3. 队列非空时循环：\n   - 出队顶点 v，输出 v\n   - 将 v 的所有邻接顶点入度减 1\n   - 若某邻接顶点入度变为 0，入队\n4. 若输出顶点数 < 总顶点数，则图中有环\n\n**DFS 法：** 对 DFS 的完成时间逆序即为拓扑序。\n\n**应用：** 任务调度、课程先修关系、编译依赖分析。',
    '拓扑排序结果不唯一；可用于判断 DAG（有向无环图）。', ['拓扑排序', 'DAG', '入度']),

  card('sc-408-013', 'ds-hash', 'subject-ds', 'FORMULA',
    '散列表的装填因子与冲突处理方法？',
    '**装填因子：** $\\alpha = \\frac{表中记录数}{散列表长度}$\n\n$\\alpha$ 越大，冲突概率越高，查找效率越低。\n\n**冲突处理方法：**\n| 方法 | 公式/思想 | 特点 |\n|---|---|---|\n| 线性探测 | $H_i=(H(key)+i)\\%m$ | 堆积现象严重 |\n| 二次探测 | $H_i=(H(key)+d_i)\\%m$，$d_i=1^2,-1^2,2^2,-2^2...$ | 减少堆积 |\n| 双散列 | $H_i=(H(key)+i \\cdot H_2(key))\\%m$ | 效果好 |\n| 链地址法 | 同义词存入同一链表 | 无堆积，适合动态表 |\n\n**查找成功/失败的 ASL 计算：** 需逐个分析每个位置的比较次数。',
    '链地址法的装填因子可以大于 1；开放定址法的装填因子必须小于 1。', ['散列表', '装填因子', '冲突处理']),

  card('sc-408-014', 'ds-insert-sort', 'subject-ds', 'MISTAKE',
    '希尔排序的易错点（增量序列选择）？',
    '**希尔排序原理：** 将序列按增量 d 分组，对每组进行直接插入排序，逐步缩小 d 直到 d=1。\n\n**易错点：**\n1. **增量序列必须递减且最后为 1**\n2. **希尔排序是不稳定的**（相同元素可能在不同子序列中交换相对位置）\n3. **增量序列的选择影响性能：**\n   - Shell 原始序列 $d=n/2,n/4,...,1$：最坏 $O(n^2)$\n   - Hibbard 序列 $2^k-1$：最坏 $O(n^{3/2})$\n   - 增量序列中的值应互质（否则前面的排序可能无效）\n4. **不是每趟排序都能使一个元素到达最终位置**\n5. **时间复杂度与增量序列有关，无法用简单公式表示**',
    '希尔排序突破了 O(n^2) 的简单排序下界，但不如 O(n log n) 的高级排序。', ['希尔排序', '增量序列', '不稳定']),

  card('sc-408-015', 'ds-swap-sort', 'subject-ds', 'PROCESS',
    '快速排序的partition过程及优化？',
    '**Lomuto partition：**\n1. 选 pivot = arr[high]\n2. i = low - 1\n3. for j = low to high-1：若 arr[j] <= pivot，i++，swap(arr[i], arr[j])\n4. swap(arr[i+1], arr[high])，返回 i+1\n\n**Hoare partition：**\n1. pivot = arr[low]，i = low，j = high\n2. 从右向左找 < pivot 的元素，从左向右找 > pivot 的元素，交换\n3. i >= j 时停止，pivot 归位\n\n**优化策略：**\n- 三数取中选 pivot（避免最坏情况）\n- 小规模子数组用插入排序\n- 随机化选 pivot\n- 三路划分（处理大量重复元素）\n\n**复杂度：** 平均 $O(n\\log n)$，最坏 $O(n^2)$（已有序时）',
    '快排是实践中最快的内部排序算法；最坏情况可通过随机化避免。', ['快速排序', 'partition', '优化']),

  // ═══ 408 专项卡片 — 计算机组成原理 ═══════════════════════════════════════
  card('sc-408-016', 'co-radix', 'subject-co', 'METHOD',
    '原码/反码/补码/移码的转换规则？',
    '**正数：** 原码 = 反码 = 补码（移码 = 补码符号位取反）\n\n**负数（设字长 n 位）：**\n| 编码 | 规则 | 示例（-5，8位） |\n|---|---|---|\n| 原码 | 符号位1 + 绝对值 | 1000 0101 |\n| 反码 | 符号位不变，数值位取反 | 1111 1010 |\n| 补码 | 反码 + 1 | 1111 1011 |\n| 移码 | 补码符号位取反 | 0111 1011 |\n\n**快速求补码：** 从右向左找到第一个 1，该位及其右边不变，左边（不含符号位）取反。\n\n**表示范围（n 位）：**\n- 原码/反码：$[-(2^{n-1}-1), 2^{n-1}-1]$\n- 补码：$[-2^{n-1}, 2^{n-1}-1]$\n- 移码：$[-2^{n-1}, 2^{n-1}-1]$',
    '移码主要用于浮点数的阶码表示，便于比较大小。', ['原码', '反码', '补码', '移码']),

  card('sc-408-017', 'co-fixed-point', 'subject-co', 'FORMULA',
    '补码加减运算与溢出判断？',
    '**补码加法：** $[A+B]_补 = [A]_补 + [B]_补$（mod $2^n$）\n**补码减法：** $[A-B]_补 = [A]_补 + [-B]_补$\n\n**溢出判断方法：**\n1. **单符号位法：** 正+正=负 或 负+负=正 则溢出\n2. **双符号位法（变形补码）：** 两个符号位不同则溢出\n   - 00：正数，无溢出\n   - 01：正溢出\n   - 10：负溢出\n   - 11：负数，无溢出\n3. **进位判断法：** 最高数值位进位 $C_n$ 与符号位进位 $C_{n+1}$ 不同则溢出\n   - 溢出 = $C_n \\oplus C_{n+1}$',
    '补码运算的核心优势：加减法统一为加法，硬件实现简单。', ['补码运算', '溢出判断']),

  card('sc-408-018', 'co-float', 'subject-co', 'FORMULA',
    'IEEE 754浮点数格式（单精度/双精度）？',
    '**格式：** $(-1)^S \\times 1.M \\times 2^{E-bias}$\n\n| 参数 | 单精度(32位) | 双精度(64位) |\n|---|---|---|\n| 符号位 S | 1 位 | 1 位 |\n| 阶码 E | 8 位 | 11 位 |\n| 尾数 M | 23 位 | 52 位 |\n| 偏移量 bias | 127 | 1023 |\n| 阶码范围 | 1~254 | 1~2046 |\n\n**特殊值：**\n- E=0, M=0：表示 $\\pm 0$\n- E=全1, M=0：表示 $\\pm \\infty$\n- E=全1, M!=0：NaN\n- E=0, M!=0：非规格化数 $(-1)^S \\times 0.M \\times 2^{1-bias}$',
    '隐含前导 1 使有效位多一位；非规格化数实现了与 0 的平滑过渡。', ['IEEE754', '浮点数', '单精度', '双精度']),

  card('sc-408-019', 'co-alu', 'subject-co', 'CONCEPT',
    '加法器的进位链（串行/并行/分组）？',
    '**串行进位加法器：**\n- 每位的进位依赖前一位：$C_i = G_i + P_i \\cdot C_{i-1}$\n- 其中 $G_i = A_i \\cdot B_i$（生成），$P_i = A_i \\oplus B_i$（传播）\n- 延迟：$O(n)$\n\n**并行进位加法器（CLA）：**\n- 将 $C_i$ 展开为仅依赖 $C_0$ 的表达式\n- $C_1 = G_0 + P_0 C_0$\n- $C_2 = G_1 + P_1 G_0 + P_1 P_0 C_0$\n- 延迟：$O(1)$，但硬件复杂度高\n\n**分组并行进位：**\n- 组内并行，组间串行（或组间也并行）\n- 常见：4位一组的 74182 CLA',
    '实际中常用分组方式折中速度和硬件复杂度。', ['加法器', '进位链', 'CLA']),

  card('sc-408-020', 'co-main-mem', 'subject-co', 'FORMULA',
    '存储器容量计算（字长x字数）？',
    '**基本概念：**\n- 存储容量 = 字数 $\\times$ 字长 = 地址线数决定的空间 $\\times$ 数据线宽度\n- 字数 = $2^{地址线位数}$\n- 字长 = 数据线位数\n\n**芯片扩展：**\n| 方式 | 目的 | 方法 |\n|---|---|---|\n| 位扩展 | 增加字长 | 多片并联，共享地址线 |\n| 字扩展 | 增加字数 | 高位地址译码选片 |\n| 字位同时扩展 | 两者都增加 | 组合使用 |\n\n**例：** 用 $1K \\times 4$ 位芯片组成 $4K \\times 8$ 位存储器：\n- 位扩展：每组 2 片（$4/8=2$）\n- 字扩展：4 组（$4K/1K=4$）\n- 共需 $2 \\times 4 = 8$ 片',
    '地址线数 = $\\log_2$(字数)；片选信号由高位地址译码产生。', ['存储器', '容量计算', '芯片扩展']),

  card('sc-408-021', 'co-cache', 'subject-co', 'FORMULA',
    'Cache命中率与平均访问时间计算？',
    '设 Cache 访问时间 $t_c$，主存访问时间 $t_m$，命中率 $h$：\n\n**同时访问方式：**\n$t_a = h \\cdot t_c + (1-h) \\cdot t_m$\n\n**先访问 Cache 方式：**\n$t_a = h \\cdot t_c + (1-h) \\cdot (t_c + t_m)$\n\n**加速比：** $S = t_m / t_a$\n\n**效率：** $e = t_c / t_a \\times 100\\%$\n\n**命中率计算：** $h = \\frac{N_c}{N_c + N_m}$（$N_c$：Cache 命中次数，$N_m$：访问主存次数）\n\n**多级 Cache：** $t_a = h_1 t_1 + (1-h_1)h_2 t_2 + (1-h_1)(1-h_2)t_m$',
    '现代 CPU 的 L1 Cache 命中率通常 > 95%。', ['Cache', '命中率', '平均访问时间']),

  card('sc-408-022', 'co-cache', 'subject-co', 'COMPARE',
    'Cache的三种映射方式对比？',
    '| 特性 | 直接映射 | 全相联映射 | 组相联映射 |\n|---|---|---|---|\n| 映射规则 | 固定位置 | 任意位置 | 组间直接，组内全相联 |\n| 主存块号->Cache | $i = j \\% C$ | 任意 | 组号 $= j \\% Q$ |\n| 标记位数 | 少 | 多 | 中 |\n| 冲突概率 | 高 | 无 | 中 |\n| 硬件成本 | 低 | 高 | 中 |\n| 查找速度 | 快（直接比较） | 慢（全部比较） | 中 |\n\n**地址结构：**\n- 直接映射：标记 + Cache行号 + 块内地址\n- 全相联：标记 + 块内地址\n- 组相联：标记 + 组号 + 块内地址',
    '实际中最常用 n 路组相联（n=2,4,8），兼顾命中率和硬件复杂度。', ['Cache', '映射方式', '直接映射', '组相联']),

  card('sc-408-023', 'co-pipeline', 'subject-co', 'FORMULA',
    '流水线加速比和吞吐率计算？',
    '设 k 级流水线，每级耗时 $\\Delta t$，执行 n 条指令：\n\n**执行时间：** $T_{流水} = (k + n - 1) \\cdot \\Delta t$\n**非流水时间：** $T_{顺序} = n \\cdot k \\cdot \\Delta t$\n\n**加速比：** $S = \\frac{T_{顺序}}{T_{流水}} = \\frac{n \\cdot k}{k+n-1}$\n当 $n \\to \\infty$ 时，$S \\to k$\n\n**吞吐率：** $TP = \\frac{n}{T_{流水}} = \\frac{n}{(k+n-1)\\Delta t}$\n最大吞吐率：$TP_{max} = \\frac{1}{\\Delta t}$\n\n**各级不等时：** $\\Delta t$ 取最慢一级的时间（瓶颈段）\n$T_{流水} = k \\cdot \\Delta t_{max} + (n-1) \\cdot \\Delta t_{max}$',
    '流水线加速比的理论上限为级数 k；实际受冒险、中断等影响。', ['流水线', '加速比', '吞吐率']),

  card('sc-408-024', 'co-controller', 'subject-co', 'COMPARE',
    '硬布线控制器与微程序控制器对比？',
    '| 特性 | 硬布线控制器 | 微程序控制器 |\n|---|---|---|\n| 实现方式 | 组合逻辑电路 | 微指令存储在控存中 |\n| 速度 | 快 | 较慢（需访问控存） |\n| 灵活性 | 差（修改需改硬件） | 好（修改微程序即可） |\n| 规整性 | 不规整 | 规整 |\n| 适用 | RISC | CISC |\n| 扩展性 | 难 | 易 |\n\n**微程序层次：**\n- 机器指令 -> 微程序 -> 微指令 -> 微操作\n- 一条机器指令对应一个微程序\n- 一条微指令可包含多个并行微操作\n\n**微指令格式：** 水平型（并行度高）vs 垂直型（类似机器指令）',
    '微程序控制器的核心思想：用软件方法设计硬件。', ['硬布线', '微程序', '控制器']),

  card('sc-408-025', 'co-interrupt', 'subject-co', 'PROCESS',
    '中断处理的完整过程？',
    '**中断处理流程：**\n1. **中断请求：** 设备发出中断请求信号\n2. **中断判优：** 硬件排队器或软件查询确定优先级\n3. **中断响应（硬件自动完成）：**\n   - 关中断（IF=0）\n   - 保存断点（PC -> 栈或特定寄存器）\n   - 转中断服务程序（通过中断向量表）\n4. **中断服务：**\n   - 保护现场（通用寄存器入栈）\n   - 开中断（允许更高优先级中断嵌套）\n   - 执行中断服务程序\n   - 关中断\n   - 恢复现场\n5. **中断返回：** 恢复 PC，开中断，返回断点继续执行\n\n**中断向量：** 中断服务程序的入口地址\n**中断向量表：** 存放所有中断向量的表',
    '中断响应的条件：有中断请求、CPU 允许中断（IF=1）、当前指令执行完毕。', ['中断', '中断处理', '中断向量']),

  card('sc-408-026', 'co-dma', 'subject-co', 'COMPARE',
    '程序查询/中断/DMA三种I/O方式对比？',
    '| 特性 | 程序查询 | 中断方式 | DMA |\n|---|---|---|---|\n| CPU 介入 | 全程等待 | 仅中断时 | 仅开始/结束 |\n| 数据传送 | CPU 执行指令 | CPU 执行指令 | DMA 控制器 |\n| 传送单位 | 字/字节 | 字/字节 | 数据块 |\n| 响应时机 | 随时 | 指令执行完 | 总线空闲时 |\n| 优先级 | 最低 | 中 | 最高（总线使用权） |\n| 适用设备 | 低速 | 中速 | 高速（磁盘等） |\n\n**DMA 传送方式：**\n- 停止 CPU 访存\n- 周期挪用（周期窃取）\n- DMA 与 CPU 交替访存',
    'DMA 方式中 CPU 和 DMA 控制器共享主存，通过总线仲裁解决冲突。', ['程序查询', '中断', 'DMA', 'IO方式']),

  card('sc-408-027', 'co-virtual-mem', 'subject-co', 'CONCEPT',
    '虚拟存储器的地址变换过程？',
    '**虚拟存储器：** 主存和辅存结合，给用户提供比实际主存大得多的地址空间。\n\n**地址变换过程：**\n1. CPU 给出虚拟地址（逻辑地址）\n2. 分解为：虚页号 + 页内偏移\n3. 查 TLB（快表）：\n   - 命中：直接得到物理页框号\n   - 未命中：查页表\n4. 查页表：\n   - 有效位=1：得到物理页框号，更新 TLB\n   - 有效位=0：缺页中断，从磁盘调入页面\n5. 物理地址 = 物理页框号 + 页内偏移\n\n**层次结构：** CPU -> TLB -> 页表(主存) -> Cache -> 主存 -> 磁盘',
    '虚拟存储器由 OS 和硬件（MMU）协同实现；对程序员透明。', ['虚拟存储器', '地址变换', 'TLB', '缺页']),

  // ═══ 408 专项卡片 — 操作系统 ═══════════════════════════════════════════
  card('sc-408-028', 'os-process', 'subject-os', 'CONCEPT',
    '进程的五状态模型及转换条件？',
    '**五种状态：**\n- 创建态（New）：正在被创建\n- 就绪态（Ready）：已获得除 CPU 外的所有资源\n- 运行态（Running）：正在 CPU 上执行\n- 阻塞态（Blocked）：等待某事件（I/O、信号量等）\n- 终止态（Terminated）：正在释放资源\n\n**转换条件：**\n| 转换 | 条件 |\n|---|---|\n| 创建->就绪 | 资源分配完毕，进入就绪队列 |\n| 就绪->运行 | 被调度程序选中 |\n| 运行->就绪 | 时间片用完/被更高优先级抢占 |\n| 运行->阻塞 | 请求 I/O/等待信号量/等待事件 |\n| 阻塞->就绪 | 等待的事件发生（I/O完成等） |\n| 运行->终止 | 正常结束或异常终止 |',
    '注意：阻塞->运行的转换不存在，必须经过就绪态。', ['进程状态', '五状态模型', '状态转换']),

  card('sc-408-029', 'os-thread', 'subject-os', 'COMPARE',
    '用户级线程与内核级线程对比？',
    '| 特性 | 用户级线程（ULT） | 内核级线程（KLT） |\n|---|---|---|\n| 管理者 | 用户空间的线程库 | 操作系统内核 |\n| 切换开销 | 小（无需陷入内核） | 大（需要内核态切换） |\n| 并行性 | 不能利用多核 | 可以利用多核 |\n| 阻塞影响 | 一个阻塞全部阻塞 | 一个阻塞不影响其他 |\n| OS 感知 | 不感知 | 感知 |\n| 调度单位 | 进程 | 线程 |\n\n**多线程模型：**\n- 多对一：多个 ULT 映射到一个 KLT\n- 一对一：每个 ULT 对应一个 KLT（Linux、Windows）\n- 多对多：m 个 ULT 映射到 n 个 KLT（$m \\geq n$）',
    '现代 OS 多采用一对一模型；Go 语言的 goroutine 采用多对多模型（M:N）。', ['用户级线程', '内核级线程', '多线程模型']),

  card('sc-408-030', 'os-ipc', 'subject-os', 'COMPARE',
    '进程通信方式（共享内存/消息传递/管道）对比？',
    '| 方式 | 原理 | 优点 | 缺点 |\n|---|---|---|---|\n| 共享内存 | 多个进程共享一块内存区域 | 速度最快 | 需要同步机制 |\n| 消息传递 | 通过 send/receive 原语 | 无需共享变量 | 开销较大 |\n| 管道 | 半双工的字节流通道 | 简单 | 半双工，亲缘进程 |\n\n**消息传递分类：**\n- 直接通信：指定接收方，send(P, msg)\n- 间接通信：通过信箱/端口，send(mailbox, msg)\n\n**管道特点：**\n- 半双工（单向流动）\n- 写满时写进程阻塞，读空时读进程阻塞\n- 数据被读后即删除（一次性消费）',
    '共享内存适合大量数据交换；消息传递适合分布式系统；管道适合父子进程。', ['进程通信', 'IPC', '共享内存', '管道']),

  card('sc-408-031', 'os-semaphore', 'subject-os', 'PROCESS',
    '用信号量解决生产者-消费者问题？',
    '**问题描述：** 生产者向缓冲区放产品，消费者从缓冲区取产品，缓冲区大小为 n。\n\n**信号量定义：**\n- mutex = 1（互斥访问缓冲区）\n- empty = n（空缓冲区数量）\n- full = 0（满缓冲区数量）\n\n**生产者：**\n```\nP(empty);  // 申请空缓冲区\nP(mutex);  // 进入临界区\n放入产品;\nV(mutex);  // 离开临界区\nV(full);   // 增加满缓冲区\n```\n\n**消费者：**\n```\nP(full);   // 申请满缓冲区\nP(mutex);  // 进入临界区\n取出产品;\nV(mutex);  // 离开临界区\nV(empty);  // 增加空缓冲区\n```',
    '关键：P(empty/full) 必须在 P(mutex) 之前，否则可能死锁！V 操作顺序无所谓。', ['生产者消费者', '信号量', 'PV操作']),

  card('sc-408-032', 'os-sync-classic', 'subject-os', 'PROCESS',
    '读者-写者问题的信号量解法？',
    '**问题：** 允许多个读者同时读，但写者必须独占。\n\n**读者优先解法：**\n```\n信号量：rw = 1（读写互斥），mutex = 1（保护 count）\n整型：count = 0（当前读者数）\n\n读者：\nP(mutex);\ncount++;\nif (count == 1) P(rw); // 第一个读者加锁\nV(mutex);\n读数据;\nP(mutex);\ncount--;\nif (count == 0) V(rw); // 最后一个读者解锁\nV(mutex);\n\n写者：\nP(rw);\n写数据;\nV(rw);\n```\n\n**写者优先：** 增加信号量 w=1，写者到来时阻止新读者进入。',
    '读者优先可能导致写者饥饿；写者优先可能导致读者饥饿。公平策略用队列。', ['读者写者', '信号量', '经典同步']),

  card('sc-408-033', 'os-sync-classic', 'subject-os', 'PROCESS',
    '哲学家进餐问题的解法？',
    '**问题：** 5 个哲学家围坐，每人需要左右两根筷子才能进餐。\n\n**死锁场景：** 每人都拿起左边筷子，等待右边筷子 -> 死锁。\n\n**解法一：限制人数**\n- 最多允许 4 人同时拿筷子（信号量 count=4）\n\n**解法二：奇偶策略**\n- 奇数号先拿左再拿右\n- 偶数号先拿右再拿左\n\n**解法三：同时拿起**\n- 用 AND 信号量（同时申请两根筷子）\n- 或用互斥信号量保护拿筷子的操作\n\n**解法四：资源有序分配**\n- 对筷子编号，总是先拿编号小的',
    '核心思想：破坏死锁的四个必要条件之一（通常破坏循环等待）。', ['哲学家进餐', '死锁预防', '经典同步']),

  card('sc-408-034', 'os-paging', 'subject-os', 'FORMULA',
    '页表项计算与地址变换？',
    '**逻辑地址结构：** [页号P | 页内偏移W]\n- 页内偏移位数 = $\\log_2$(页大小)\n- 页号位数 = 逻辑地址位数 - 偏移位数\n\n**页表项内容：** 页框号 + 有效位 + 访问位 + 修改位 + 保护位\n\n**页表项大小计算：**\n- 页框号位数 = $\\lceil\\log_2$(物理页框总数)$\\rceil$\n- 加上控制位后向上取整到字节\n\n**地址变换：**\n1. 页号 P = 逻辑地址 / 页大小\n2. 偏移 W = 逻辑地址 % 页大小\n3. 查页表得页框号 F\n4. 物理地址 = F * 页大小 + W\n\n**多级页表：** 解决页表过大问题，将页号再分为多级索引。',
    '二级页表：逻辑地址 = [一级页号|二级页号|页内偏移]，需要两次访存查页表。', ['页表', '地址变换', '多级页表']),

  card('sc-408-035', 'os-segmentation', 'subject-os', 'COMPARE',
    '分页与分段的对比？',
    '| 特性 | 分页 | 分段 |\n|---|---|---|\n| 划分依据 | 物理大小（固定） | 逻辑意义（可变） |\n| 页/段大小 | 固定（如4KB） | 不固定 |\n| 地址空间 | 一维 | 二维（段号+段内偏移） |\n| 碎片 | 内部碎片 | 外部碎片 |\n| 共享 | 不便 | 以段为单位方便共享 |\n| 用户可见 | 对用户透明 | 用户可见 |\n| 目的 | 提高内存利用率 | 满足用户逻辑需求 |\n\n**段页式：** 先分段再分页\n- 逻辑地址：段号 + 段内页号 + 页内偏移\n- 优点：兼具两者优点\n- 缺点：需要两次查表（段表+页表）',
    '现代 OS 多采用段页式（如 x86）或纯分页（如 ARM 的简化实现）。', ['分页', '分段', '段页式']),

  card('sc-408-036', 'os-virtual', 'subject-os', 'CONCEPT',
    '页面置换算法（OPT/FIFO/LRU/Clock）？',
    '| 算法 | 策略 | 优缺点 |\n|---|---|---|\n| OPT | 淘汰未来最久不用的页 | 最优但不可实现（需预知未来） |\n| FIFO | 淘汰最早进入内存的页 | 简单但性能差，有 Belady 异常 |\n| LRU | 淘汰最近最久未使用的页 | 性能好但实现代价高（需硬件支持） |\n| Clock | FIFO + 访问位，给第二次机会 | 折中方案 |\n| 改进 Clock | 考虑访问位和修改位 | 优先淘汰未访问未修改的页 |\n\n**Clock 算法：**\n1. 页面组成循环链表，每页有访问位 A\n2. 缺页时，从指针位置扫描：\n   - A=0：淘汰该页\n   - A=1：置 A=0，指针前移，继续扫描\n\n**改进 Clock（A, M）优先级：** (0,0) > (0,1) > (1,0) > (1,1)',
    'LRU 的精确实现需要栈或计数器；实际中常用近似 LRU（Clock 算法）。', ['页面置换', 'OPT', 'FIFO', 'LRU', 'Clock']),

  card('sc-408-037', 'os-virtual', 'subject-os', 'MISTAKE',
    'Belady异常（FIFO页面置换的反常现象）？',
    '**Belady 异常：** 使用 FIFO 算法时，增加分配的物理页框数，缺页次数反而增加。\n\n**经典示例：** 页面引用串 1,2,3,4,1,2,5,1,2,3,4,5\n- 3 个页框：缺页 9 次\n- 4 个页框：缺页 10 次（反而更多！）\n\n**原因分析：** FIFO 淘汰的是最早进入的页面，而非最不常用的。增加页框后，淘汰顺序改变，可能导致更多有用页面被提前淘汰。\n\n**哪些算法没有 Belady 异常：**\n- OPT：无\n- LRU：无\n- 所有"栈算法"（$n$ 个页框时内存中的页面集合是 $n+1$ 个页框时的子集）',
    'FIFO 不是栈算法，所以存在 Belady 异常；LRU 是栈算法，不存在此异常。', ['Belady异常', 'FIFO', '栈算法']),

  card('sc-408-038', 'os-directory', 'subject-os', 'CONCEPT',
    '文件目录结构（单级/两级/树形/无环图）？',
    '| 结构 | 特点 | 优缺点 |\n|---|---|---|\n| 单级目录 | 所有文件在同一目录 | 简单，但不允许重名，不适合多用户 |\n| 两级目录 | 主目录+用户目录 | 解决重名，但缺乏灵活性 |\n| 树形目录 | 多级层次结构 | 便于分类管理，路径唯一 |\n| 无环图目录 | 允许共享（硬链接） | 支持文件共享，但需处理删除问题 |\n\n**路径：**\n- 绝对路径：从根目录开始\n- 相对路径：从当前目录开始\n\n**目录实现：**\n- 目录项：文件名 + 文件控制块（FCB）指针\n- FCB/inode：包含文件属性、权限、物理地址等\n\n**共享与链接：**\n- 硬链接：多个目录项指向同一 inode（引用计数）\n- 软链接：存储目标文件的路径名',
    '删除共享文件时，硬链接用引用计数（减为0才真正删除）；软链接可能产生悬空指针。', ['文件目录', '树形目录', '硬链接', '软链接']),

  card('sc-408-039', 'os-disk', 'subject-os', 'FORMULA',
    '磁盘调度算法（FCFS/SSTF/SCAN/C-SCAN）？',
    '| 算法 | 策略 | 特点 |\n|---|---|---|\n| FCFS | 按请求到达顺序 | 公平但效率低 |\n| SSTF | 选最近的磁道 | 效率高但可能饥饿 |\n| SCAN（电梯） | 单方向扫描到头再反向 | 无饥饿，但两端等待时间不均 |\n| C-SCAN | 单方向扫描，到头后回起点 | 等待时间更均匀 |\n| LOOK | SCAN 改进，到最远请求即反向 | 减少不必要的移动 |\n| C-LOOK | C-SCAN 改进，到最远请求即回起点 | 实际最常用 |\n\n**磁盘访问时间：**\n$T = 寻道时间 + 旋转延迟 + 传输时间$\n- 寻道时间：磁头移动到目标磁道（最耗时）\n- 旋转延迟：平均半圈 = $\\frac{1}{2} \\times \\frac{60}{转速(rpm)}$\n- 传输时间：数据量/传输速率',
    '调度算法主要优化寻道时间；旋转延迟和传输时间由硬件决定。', ['磁盘调度', 'SCAN', 'SSTF', 'FCFS']),

  // ═══ 408 专项卡片 — 计算机网络 ═══════════════════════════════════════════
  card('sc-408-040', 'net-error-ctrl', 'subject-net', 'FORMULA',
    'CRC校验的计算步骤？',
    '**CRC（循环冗余校验）计算步骤：**\n1. 设数据为 M，生成多项式为 G(x)，G(x) 的阶为 r\n2. 在 M 后面添加 r 个 0，得到 $M \\times 2^r$\n3. 用 $M \\times 2^r$ 对 G(x) 对应的二进制数做模 2 除法\n4. 余数即为 FCS（帧校验序列），长度为 r 位\n5. 发送：M 后附加 FCS\n\n**模 2 除法规则：** 不借位的异或运算（XOR）\n\n**接收方检验：** 用收到的帧除以 G(x)，余数为 0 则无错。\n\n**示例：** M=101001，G(x)=$x^3+x+1$（即 1011）\n- 101001000 / 1011 = ... 余 110\n- 发送：101001110',
    'CRC 能检测所有奇数位错误、所有双比特错误、所有小于等于 r 位的突发错误。', ['CRC', '循环冗余校验', '模2除法']),

  card('sc-408-041', 'net-flow-ctrl', 'subject-net', 'COMPARE',
    '停止等待/后退N帧/选择重传对比？',
    '| 特性 | 停止等待 | 后退N帧(GBN) | 选择重传(SR) |\n|---|---|---|---|\n| 发送窗口 | 1 | $W_T \\leq 2^n - 1$ | $W_T \\leq 2^{n-1}$ |\n| 接收窗口 | 1 | 1 | $W_R \\leq 2^{n-1}$ |\n| 确认方式 | 逐帧确认 | 累积确认 | 逐帧确认 |\n| 出错处理 | 重传该帧 | 重传该帧及之后所有 | 只重传出错帧 |\n| 缓冲区需求 | 小 | 发送方大 | 两方都大 |\n| 信道利用率 | 低 | 中 | 高 |\n\n**信道利用率：** $U = \\frac{W_T \\times T_f}{T_f + RTT + T_a}$\n\n其中 $n$ 为序号位数，$T_f$ 为帧传输时间。',
    'GBN 接收方只按序接收，失序帧丢弃；SR 接收方可缓存失序帧。', ['停止等待', 'GBN', '选择重传', '滑动窗口']),

  card('sc-408-042', 'net-mac', 'subject-net', 'CONCEPT',
    'CSMA/CD协议的工作原理？',
    '**CSMA/CD（载波监听多路访问/冲突检测）：**\n\n**工作流程：**\n1. **先听后发：** 监听信道，空闲则发送\n2. **边发边听：** 发送过程中持续检测冲突\n3. **冲突检测：** 发现冲突立即停止发送\n4. **发送干扰信号（Jam）：** 通知所有站点发生冲突\n5. **二进制指数退避：** 等待随机时间后重试\n\n**二进制指数退避算法：**\n- 第 k 次冲突后，从 $[0, 2^k-1]$ 中随机选一个数 r\n- 等待 $r \\times 2\\tau$（$\\tau$ 为单程传播时延）\n- $k \\leq 10$ 时指数增长，$k > 10$ 固定为 $2^{10}-1$\n- 重传 16 次仍失败则放弃\n\n**争用期：** $2\\tau$（往返传播时延），是检测冲突的最长时间。',
    'CSMA/CD 用于半双工以太网；全双工以太网不需要 CSMA/CD。', ['CSMA/CD', '冲突检测', '退避算法']),

  card('sc-408-043', 'net-ethernet', 'subject-net', 'FORMULA',
    '以太网最短帧长的计算？',
    '**最短帧长公式：**\n$$L_{min} = 2\\tau \\times R$$\n\n其中：\n- $\\tau$：信号在最远两站间的单程传播时延\n- $R$：数据传输速率\n- $2\\tau$：争用期（往返时延）\n\n**10Mbps 以太网：**\n- 最大段长 2500m，$\\tau \\approx 25.6\\mu s$\n- $2\\tau = 51.2\\mu s$\n- $L_{min} = 51.2\\mu s \\times 10Mbps = 512 bits = 64 bytes$\n\n**意义：** 发送方在发完最短帧之前必须能检测到冲突。若帧太短，发完后才检测到冲突，无法判断帧是否成功发送。\n\n**不足 64 字节的帧需要填充（padding）。**',
    '100Mbps 以太网通过缩短最大网段长度（而非增加最短帧长）来保持 64 字节最短帧。', ['以太网', '最短帧长', '争用期']),

  card('sc-408-044', 'net-ip', 'subject-net', 'CONCEPT',
    'IP地址分类与子网划分？',
    '**IP 地址分类：**\n| 类别 | 网络号 | 范围 | 默认掩码 |\n|---|---|---|---|\n| A | 8位(0开头) | 1.0.0.0~126.x.x.x | /8 |\n| B | 16位(10开头) | 128.0.0.0~191.255.x.x | /16 |\n| C | 24位(110开头) | 192.0.0.0~223.255.255.x | /24 |\n\n**子网划分：** 从主机号中借位作为子网号\n- 子网掩码：网络号+子网号全1，主机号全0\n- 子网数 = $2^{借位数}$（全0全1是否可用取决于题目）\n- 每个子网主机数 = $2^{剩余主机位} - 2$（去掉网络地址和广播地址）\n\n**CIDR（无类域间路由）：**\n- 表示：IP/前缀长度（如 192.168.1.0/24）\n- 支持路由聚合（超网）：多个网络合并为一个更大的地址块',
    '特殊地址：127.x.x.x（环回）、0.0.0.0（本网络）、255.255.255.255（受限广播）。', ['IP地址', '子网划分', 'CIDR']),

  card('sc-408-045', 'net-routing', 'subject-net', 'COMPARE',
    'RIP与OSPF路由协议对比？',
    '| 特性 | RIP | OSPF |\n|---|---|---|\n| 类型 | 距离向量 | 链路状态 |\n| 度量 | 跳数（最大15） | 带宽/延迟等 |\n| 更新方式 | 周期性广播全部路由表 | 触发更新，只发变化部分 |\n| 收敛速度 | 慢 | 快 |\n| 适用规模 | 小型网络 | 大型网络 |\n| 环路问题 | 存在（需毒性逆转等） | 不存在 |\n| 协议层 | UDP 520端口 | 直接封装在 IP 中 |\n\n**RIP 工作原理：**\n- 每 30s 与邻居交换路由表\n- 选择跳数最少的路径\n- 好消息传得快，坏消息传得慢\n\n**OSPF 工作原理：**\n- 洪泛法发送链路状态信息\n- 每个路由器构建完整网络拓扑图\n- 用 Dijkstra 算法计算最短路径',
    'RIP 适合小型网络（跳数<=15）；OSPF 支持区域划分，适合大型网络。', ['RIP', 'OSPF', '路由协议', '距离向量', '链路状态']),

  card('sc-408-046', 'net-tcp', 'subject-net', 'PROCESS',
    'TCP三次握手与四次挥手？',
    '**三次握手（建立连接）：**\n1. 客户端 -> SYN=1, seq=x（SYN_SENT）\n2. 服务器 -> SYN=1, ACK=1, seq=y, ack=x+1（SYN_RCVD）\n3. 客户端 -> ACK=1, seq=x+1, ack=y+1（ESTABLISHED）\n\n**为什么三次：** 防止已失效的连接请求到达服务器，避免资源浪费。\n\n**四次挥手（释放连接）：**\n1. 客户端 -> FIN=1, seq=u（FIN_WAIT_1）\n2. 服务器 -> ACK=1, ack=u+1（CLOSE_WAIT）\n3. 服务器 -> FIN=1, seq=w, ack=u+1（LAST_ACK）\n4. 客户端 -> ACK=1, ack=w+1（TIME_WAIT，等待 2MSL）\n\n**为什么四次：** TCP 全双工，每个方向需单独关闭。\n**TIME_WAIT（2MSL）：** 确保最后的 ACK 到达；让旧连接的报文段消失。',
    'SYN 和 FIN 都要消耗一个序号；ACK 不消耗序号。', ['TCP', '三次握手', '四次挥手', 'TIME_WAIT']),

  card('sc-408-047', 'net-tcp', 'subject-net', 'FORMULA',
    'TCP滑动窗口与流量控制？',
    '**滑动窗口机制：**\n- 发送窗口大小 = min(拥塞窗口 cwnd, 接收窗口 rwnd)\n- 接收方通过 ACK 中的窗口字段通告 rwnd\n\n**发送窗口内的数据分类：**\n1. 已发送已确认（窗口左边）\n2. 已发送未确认（窗口内左部）\n3. 可发送未发送（窗口内右部）\n4. 不可发送（窗口右边）\n\n**流量控制：**\n- 接收方通过调整 rwnd 控制发送速率\n- rwnd = 0 时发送方停止发送（零窗口）\n- 零窗口探测：发送方定期发送探测报文，防止死锁\n\n**确认机制：**\n- 累积确认：ACK 表示该序号之前的所有数据已收到\n- 延迟确认：等待一段时间或收到第二个报文段再确认',
    '发送窗口不一定等于接收窗口（网络延迟导致信息不同步）。', ['TCP', '滑动窗口', '流量控制', 'rwnd']),

  card('sc-408-048', 'net-congestion', 'subject-net', 'PROCESS',
    'TCP拥塞控制四个阶段？',
    '**四个阶段：**\n\n**1. 慢启动（Slow Start）：**\n- cwnd 从 1 MSS 开始\n- 每收到一个 ACK，cwnd += 1 MSS（指数增长）\n- 达到 ssthresh 后进入拥塞避免\n\n**2. 拥塞避免（Congestion Avoidance）：**\n- 每个 RTT，cwnd += 1 MSS（线性增长）\n- 发生超时：ssthresh = cwnd/2，cwnd = 1，回到慢启动\n\n**3. 快重传（Fast Retransmit）：**\n- 收到 3 个重复 ACK，立即重传丢失报文段\n- 不必等待超时计时器\n\n**4. 快恢复（Fast Recovery）：**\n- ssthresh = cwnd/2\n- cwnd = ssthresh（而非 1）\n- 直接进入拥塞避免（跳过慢启动）\n\n**区别：** 超时 -> 慢启动；3个重复ACK -> 快恢复',
    '慢启动的"慢"是相对于一开始就发送大量数据而言；实际增长速度是指数级的。', ['拥塞控制', '慢启动', '快重传', '快恢复']),

  card('sc-408-049', 'net-udp', 'subject-net', 'COMPARE',
    'TCP与UDP的对比？',
    '| 特性 | TCP | UDP |\n|---|---|---|\n| 连接 | 面向连接（三次握手） | 无连接 |\n| 可靠性 | 可靠传输（确认重传） | 尽最大努力交付 |\n| 有序性 | 保证有序 | 不保证有序 |\n| 流量控制 | 有（滑动窗口） | 无 |\n| 拥塞控制 | 有 | 无 |\n| 首部开销 | 20 字节（最小） | 8 字节 |\n| 传输方式 | 面向字节流 | 面向数据报 |\n| 通信模式 | 点对点 | 支持一对多、多对多 |\n| 适用场景 | 文件传输、网页、邮件 | 视频流、DNS、游戏 |\n\n**UDP 首部：** 源端口(2B) + 目的端口(2B) + 长度(2B) + 校验和(2B)\n**TCP 首部：** 源端口 + 目的端口 + 序号 + 确认号 + 数据偏移 + 标志位 + 窗口 + 校验和 + 紧急指针',
    'UDP 的"不可靠"不是缺点，而是设计选择——将可靠性交给应用层处理。', ['TCP', 'UDP', '对比', '传输层']),

  card('sc-408-050', 'net-dns', 'subject-net', 'PROCESS',
    'DNS域名解析过程（递归/迭代）？',
    '**DNS 解析完整过程：**\n1. 客户端查本地 DNS 缓存\n2. 查 hosts 文件\n3. 向本地 DNS 服务器发送查询\n4. 本地 DNS 查缓存，未命中则向上查询：\n   - 根域名服务器 -> 返回顶级域服务器地址\n   - 顶级域服务器 -> 返回权威域名服务器地址\n   - 权威域名服务器 -> 返回最终 IP 地址\n5. 本地 DNS 缓存结果并返回给客户端\n\n**递归查询：** 服务器代替客户端完成全部查询过程\n- 客户端 -> 本地 DNS（通常是递归）\n\n**迭代查询：** 服务器返回下一步应查询的地址\n- 本地 DNS -> 根/顶级域/权威（通常是迭代）\n\n**DNS 使用 UDP 端口 53**（区域传送用 TCP）',
    '实际中：客户端到本地DNS用递归，本地DNS到其他服务器用迭代。', ['DNS', '域名解析', '递归查询', '迭代查询']),

  card('sc-408-051', 'net-http', 'subject-net', 'CONCEPT',
    'HTTP请求方法与状态码？',
    '**常用请求方法：**\n| 方法 | 作用 | 幂等 |\n|---|---|---|\n| GET | 获取资源 | 是 |\n| POST | 提交数据/创建资源 | 否 |\n| PUT | 更新资源（完整替换） | 是 |\n| DELETE | 删除资源 | 是 |\n| HEAD | 获取响应头（不含体） | 是 |\n\n**状态码分类：**\n| 类别 | 含义 | 常见 |\n|---|---|---|\n| 1xx | 信息性 | 100 Continue |\n| 2xx | 成功 | 200 OK, 201 Created |\n| 3xx | 重定向 | 301 永久, 302 临时, 304 未修改 |\n| 4xx | 客户端错误 | 400 Bad Request, 403 Forbidden, 404 Not Found |\n| 5xx | 服务器错误 | 500 Internal Error, 503 Service Unavailable |\n\n**HTTP/1.0 vs 1.1：** 1.1 默认持久连接（Keep-Alive），支持管线化。\n**HTTP/2：** 多路复用、头部压缩、服务器推送、二进制帧。',
    '304 Not Modified 表示资源未变化，客户端可使用缓存（条件请求机制）。', ['HTTP', '请求方法', '状态码']),
]
