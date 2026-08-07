export interface PRDTemplateNode {
  id: string;
  label: string;
  hint: string;
  contentType: 'richtext';
  required: boolean;
  order: number;
}

export interface PRDTemplate {
  id: string;
  name: string;
  description: string;
  nodes: PRDTemplateNode[];
}

export const DEFAULT_TEMPLATES: PRDTemplate[] = [
  {
    id: 'standard',
    name: '标准 PRD 模板',
    description: '适用于大多数产品需求的通用 PRD 模板，涵盖背景、用户、功能、非功能需求和验收标准',
    nodes: [
      {
        id: 'background',
        label: '背景与目标',
        hint: '简述为什么要做这个需求、期望达到什么目标。可以包含市场背景、业务驱动因素等。',
        contentType: 'richtext',
        required: true,
        order: 1,
      },
      {
        id: 'users',
        label: '目标用户',
        hint: '描述主要面向哪些用户角色，他们有什么特征和痛点。可以列出具���的用户画像。',
        contentType: 'richtext',
        required: true,
        order: 2,
      },
      {
        id: 'features',
        label: '核心功能列表',
        hint: '按优先级列出功能点。建议用列表格式，每个功能说明做什么、为什么、预期效果。',
        contentType: 'richtext',
        required: true,
        order: 3,
      },
      {
        id: 'non-functional',
        label: '非功能需求',
        hint: '性能指标、安全要求、兼容性、可维护性、数据一致性等非功能层面的要求。',
        contentType: 'richtext',
        required: true,
        order: 4,
      },
      {
        id: 'acceptance',
        label: '验收标准',
        hint: '可测试的完成条件。使用清单格式，每一条对应一个明确的验证标准。',
        contentType: 'richtext',
        required: true,
        order: 5,
      },
    ],
  },
];
