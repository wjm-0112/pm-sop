# PM SOP 数据库设计文档

> 版本：v1.0.0 ｜ 最后更新：2026-08-05

---

## 1. 存储方案概述

| 存储 | 用途 | 库 |
|------|------|-----|
| IndexedDB | 全部业务数据（10 张表） | Dexie.js |
| localStorage | 设置、UI 状态、主题 | Zustand persist |

IndexedDB 选择理由：支持结构化数据、索引查询、大容量（≥数百 MB），适合离线优先应用。

---

## 2. 实体关系概览

```
Requirement ──parentId──> Requirement (自关联: 需求分解)
Requirement ──versionId──> Version
Version ──requirementIds──> Requirement[] (一对多反向)
Task ──requirementId──> Requirement
Task ──versionId──> Version
Task ──milestoneId──> Milestone
Task ──dependencies──> Task[] (自关联)
Milestone ──taskIds──> Task[]
Milestone ──versionId──> Version
Risk ──relatedTaskIds──> Task[]
Risk ──relatedRequirementIds──> Requirement[]
PRDDocument ──relatedRequirementIds──> Requirement[]
PRDDocument ──relatedVersionId──> Version
Persona ──journeyMap──> JourneyStage[] (内嵌)
Competitor ──features──> CompetitorFeature[] (内嵌)
```

---

## 3. 表结构定义

### 3.1 requirements（需求）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string (UUID) | PK | 主键 |
| title | string | | 标题 |
| description | string | | 描述（HTML） |
| type | enum | ✓ | feature/bug/optimization/technical |
| priority | enum | ✓ | P0/P1/P2/P3 |
| status | enum | ✓ | draft/reviewing/approved/rejected/implemented/closed |
| source | enum | | user/internal/competitive/market/leadership |
| sourceDetail | string | | 来源详情 |
| assignee | string | ✓ | 负责人 |
| reviewer | string | | 审核人 |
| tags | string[] | | 标签 |
| attachments | Attachment[] | | 附件（内嵌） |
| parentId | string\|null | ✓ | 父需求 |
| versionId | string\|null | ✓ | 关联版本 |
| changeLog | ChangeEntry[] | | 变更日志（内嵌） |
| dueDate | Date\|null | | 截止 |
| closedAt | Date\|null | | 关闭 |
| estimatedEffort | number\|null | | 预估人天 |
| businessValue | number\|null | | 业务价值 1-10 |
| createdAt | Date | ✓ | 创建 |
| updatedAt | Date | ✓ | 更新 |

### 3.2 versions（版本）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | PK | |
| name | string | | 版本号 v2.1.0 |
| title | string | | 版本名 |
| description | string | | 描述 |
| status | enum | ✓ | planned/in_progress/released/cancelled |
| startDate | Date | ✓ | 起始 |
| endDate | Date\|null | ✓ | 结束 |
| releaseDate | Date\|null | | 实际发布 |
| goals | string[] | | 目标 |
| requirementIds | string[] | | 关联需求 |
| createdAt | Date | ✓ | |
| updatedAt | Date | ✓ | |

### 3.3 prdDocuments（PRD）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | PK | |
| title | string | | |
| content | string | | TipTap HTML |
| version | string | ✓ | 文档版本 |
| status | enum | ✓ | draft/review/approved/archived |
| relatedRequirementIds | string[] | | |
| relatedVersionId | string\|null | | |
| attachments | Attachment[] | | |
| author | string | | |
| reviewers | string[] | | |
| createdAt | Date | ✓ | |
| updatedAt | Date | ✓ | |

### 3.4 tasks（任务）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | PK | |
| title | string | | |
| description | string | | |
| status | enum | ✓ | backlog/todo/in_progress/review/done/cancelled |
| priority | enum | ✓ | P0/P1/P2/P3 |
| assignee | string | ✓ | |
| requirementId | string\|null | ✓ | |
| versionId | string\|null | ✓ | |
| milestoneId | string\|null | ✓ | |
| storyPoints | number\|null | | |
| estimatedHours | number\|null | | |
| actualHours | number\|null | | |
| tags | string[] | | |
| attachments | Attachment[] | | |
| dependencies | string[] | | 依赖任务 |
| sortOrder | number | ✓ | 看板排序 |
| startedAt | Date\|null | | |
| completedAt | Date\|null | | |
| dueDate | Date\|null | | |
| createdAt | Date | ✓ | |
| updatedAt | Date | ✓ | |

### 3.5 milestones（里程碑）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | PK | |
| title | string | | |
| description | string | | |
| dueDate | Date | ✓ | |
| completedDate | Date\|null | | |
| status | enum | ✓ | pending/in_progress/completed/delayed |
| versionId | string\|null | ✓ | |
| taskIds | string[] | | |
| deliverables | string[] | | 交付物 |
| createdAt | Date | ✓ | |
| updatedAt | Date | ✓ | |

### 3.6 risks（风险）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | PK | |
| title | string | | |
| description | string | | |
| category | enum | | technical/resource/schedule/scope/dependency/other |
| probability | enum | ✓ | low/medium/high/critical |
| impact | enum | ✓ | low/medium/high/critical |
| status | enum | ✓ | identified/monitoring/mitigating/resolved/closed |
| mitigation | string | | 缓解措施 |
| contingency | string | | 应急预案 |
| owner | string | ✓ | 负责人 |
| relatedTaskIds | string[] | | |
| relatedRequirementIds | string[] | | |
| identifiedAt | Date | | |
| resolvedAt | Date\|null | | |
| createdAt | Date | ✓ | |
| updatedAt | Date | ✓ | |

### 3.7 competitors（竞品）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | PK | |
| name | string | | |
| logo | string\|null | | base64 |
| description | string | | |
| website | string\|null | | |
| type | enum | ✓ | direct/indirect/potential |
| strengths | string[] | | 优势 |
| weaknesses | string[] | | 劣势 |
| features | CompetitorFeature[] | | 功能评分（内嵌） |
| marketShare | number\|null | | 百分比 |
| targetUsers | string | | |
| pricing | string\|null | | |
| fundingStage | string\|null | | |
| foundedYear | number\|null | | |
| lastUpdated | Date | ✓ | |
| tags | string[] | | |
| notes | string | | |
| createdAt | Date | ✓ | |
| updatedAt | Date | ✓ | |

### 3.8 marketResearch（市场调研）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | PK | |
| title | string | | |
| content | string | | 富文本 |
| category | string | ✓ | 分类 |
| source | string\|null | | 来源 |
| sourceUrl | string\|null | | 来源链接 |
| keyFindings | string[] | | 关键发现 |
| tags | string[] | | |
| attachments | Attachment[] | | |
| author | string | | |
| researchDate | Date | ✓ | |
| createdAt | Date | ✓ | |
| updatedAt | Date | ✓ | |

### 3.9 personas（用户画像）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | PK | |
| name | string | | |
| role | string | ✓ | 角色 |
| avatar | string\|null | | base64 |
| demographics | object | | 人口统计 |
| goals | string[] | | |
| painPoints | string[] | | |
| behaviors | string[] | | |
| motivations | string[] | | |
| scenarios | string[] | | |
| quotes | string[] | | |
| journeyMap | JourneyStage[] | | 旅程（内嵌） |
| createdAt | Date | ✓ | |
| updatedAt | Date | ✓ | |

### 3.10 settings（设置）

| 字段 | 类型 | 索引 | 说明 |
|------|------|------|------|
| id | string | PK | 固定 'app-settings' |
| theme | enum | | light/dark/system |
| language | enum | | zh-CN/en-US |
| sidebarCollapsed | boolean | | |
| defaultAssignee | string | | |
| autoBackupEnabled | boolean | | |
| autoBackupInterval | number | | 小时 |
| lastBackupAt | Date\|null | | |
| lastBackupSize | number\|null | | bytes |
| defaultView | Record | | 模块默认视图 |
| shortcuts | Record | | 快捷键 |

---

## 4. 内嵌结构

### Attachment
```typescript
{ id, name, type: 'file'|'link'|'image', url, size, createdAt }
```

### ChangeEntry（变更日志）
```typescript
{ id, field, oldValue, newValue, changedBy, changedAt, reason }
```

### CompetitorFeature
```typescript
{ id, name, category, rating: 1-5, notes }
```

### JourneyStage
```typescript
{ id, stage, actions[], thoughts[], emotions: 'positive'|'neutral'|'negative',
  painPoints[], opportunities[], touchpoints[], sortOrder }
```

---

## 5. Dexie 索引声明

```typescript
this.version(1).stores({
  requirements: 'id, status, priority, type, assignee, createdAt, updatedAt, versionId, parentId',
  versions: 'id, status, startDate, endDate, createdAt, updatedAt',
  prdDocuments: 'id, status, version, createdAt, updatedAt',
  tasks: 'id, status, priority, assignee, requirementId, versionId, milestoneId, createdAt, sortOrder',
  milestones: 'id, status, dueDate, versionId, createdAt',
  risks: 'id, status, probability, impact, owner, createdAt',
  competitors: 'id, type, lastUpdated, createdAt',
  marketResearch: 'id, category, researchDate, createdAt',
  personas: 'id, role, createdAt',
  settings: 'id',
});
```

---

## 6. 迁移策略

- 使用 Dexie `version(n)` 递增管理 schema 变更
- 每次结构升级新增 `this.version(n+1).stores({...}).upgrade(tx => {...})`
- 升级回调负责旧数据字段补全/转换
- 当前为 v1，无历史迁移

---

## 7. 性能优化

1. **索引**：所有常用查询/排序字段建索引（见上表）
2. **分页**：列表每页 50 条（`offset/limit`）
3. **虚拟滚动**：单页 > 100 条启用虚拟列表
4. **事务批量写**：批量操作包裹 `db.transaction('rw', ...)`
5. **附件隔离**：大文件（>1MB）独立存表，不内嵌 JSON
6. **备份异步**：导出 JSON 用 Web Worker 避免阻塞 UI
