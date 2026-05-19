import type { KnowledgeNode } from '@/types/domain'

const seedTimestamp = '2026-05-19T00:00:00.000Z'

function subject(id: string, title: string, sortOrder: number): KnowledgeNode {
  return {
    id,
    subjectId: id,
    parentId: null,
    title,
    level: 0,
    sortOrder,
    description: '',
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp
  }
}

function chapter(
  id: string,
  subjectId: string,
  title: string,
  sortOrder: number
): KnowledgeNode {
  return {
    id,
    subjectId,
    parentId: subjectId,
    title,
    level: 1,
    sortOrder,
    description: '',
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp
  }
}

export const seedKnowledgeNodes: KnowledgeNode[] = [
  subject('subject-ds', '数据结构', 1),
  chapter('ds-intro', 'subject-ds', '绪论', 1),
  chapter('ds-linear-list', 'subject-ds', '线性表', 2),
  chapter('ds-stack-queue', 'subject-ds', '栈和队列', 3),
  chapter('ds-tree', 'subject-ds', '树与二叉树', 4),
  chapter('ds-graph', 'subject-ds', '图', 5),
  chapter('ds-search', 'subject-ds', '查找', 6),
  chapter('ds-sort', 'subject-ds', '排序', 7),

  subject('subject-co', '计算机组成原理', 2),
  chapter('co-overview', 'subject-co', '计算机系统概述', 1),
  chapter('co-data', 'subject-co', '数据的表示和运算', 2),
  chapter('co-memory', 'subject-co', '存储系统', 3),
  chapter('co-instruction', 'subject-co', '指令系统', 4),
  chapter('co-cpu', 'subject-co', '中央处理器', 5),
  chapter('co-bus', 'subject-co', '总线', 6),
  chapter('co-io', 'subject-co', '输入输出系统', 7),

  subject('subject-os', '操作系统', 3),
  chapter('os-overview', 'subject-os', '操作系统概述', 1),
  chapter('os-process-thread', 'subject-os', '进程与线程', 2),
  chapter('os-scheduling', 'subject-os', '处理机调度', 3),
  chapter('os-sync', 'subject-os', '同步与互斥', 4),
  chapter('os-deadlock', 'subject-os', '死锁', 5),
  chapter('os-memory', 'subject-os', '内存管理', 6),
  chapter('os-file', 'subject-os', '文件管理', 7),
  chapter('os-io', 'subject-os', 'I/O 管理', 8),

  subject('subject-net', '计算机网络', 4),
  chapter('net-architecture', 'subject-net', '网络体系结构', 1),
  chapter('net-physical', 'subject-net', '物理层', 2),
  chapter('net-link', 'subject-net', '数据链路层', 3),
  chapter('net-network', 'subject-net', '网络层', 4),
  chapter('net-transport', 'subject-net', '传输层', 5),
  chapter('net-application', 'subject-net', '应用层', 6)
]
