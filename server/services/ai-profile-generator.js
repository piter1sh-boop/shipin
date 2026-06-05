import { v4 as uuid } from 'uuid';

// 创业领域配置
const DOMAIN_CONFIG = {
  'AI开发者': {
    occupations: ['全栈工程师', '前端工程师', 'AI研究员', '独立开发者'],
    products: ['AI工具', 'SaaS平台', 'Chrome扩展', 'API服务'],
    blockers: ['产品沉迷', '技术完美主义', '忽视用户验证'],
  },
  '电商': {
    occupations: ['淘宝卖家', '跨境电商从业者', '微商', '传统零售转型'],
    products: ['垂直电商平台', '一件代发', '私域电商', '直播带货'],
    blockers: ['流量焦虑', '选品纠结', '客服逃避'],
  },
  'SaaS': {
    occupations: ['企业销售', '产品经理', '连续创业者', '技术创始人'],
    products: ['B2B工具', '企业管理SaaS', '垂直行业解决方案', 'API集成平台'],
    blockers: ['企业销售恐惧', '定价纠结', '客户成功担忧'],
  },
  '内容创作': {
    occupations: ['自媒体博主', '知识付费创作者', '视频博主', '编剧'],
    products: ['付费社群', '知识星球', '视频号', '播客'],
    blockers: ['内容创作瓶颈', '流量获取困难', '变现模式迷茫'],
  },
  '本地服务': {
    occupations: ['餐饮老板', '房产中介', '培训师', '导游'],
    products: ['本地服务平台', '预约系统', '会员体系', '社区团购'],
    blockers: ['线下执行困难', '用户获取成本高', '复购率低'],
  },
};

// 城市列表
const CITIES = ['北京', '上海', '深圳', '杭州', '广州', '成都', '南京', '武汉', '西安', '苏州'];

// 姓氏和名字
const XING = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
const MING = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '桂英', '建华', '志强'];

// 随机选择
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 生成随机整数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 性格生成
function generatePersonality(domain) {
  const traits = ['外向', '内向', '中间偏外向', '中间偏内向'];
  return {
    tendency: randomPick(traits),
    executionScore: randomInt(5, 9),
    decisionStyle: randomPick(['果断', '犹豫', '分析 paralysis', '快速试错']),
    stressResponse: randomPick(['寻求支持', '独自消化', '暂时逃避', '积极面对']),
  };
}

// 技能雷达
function generateSkills() {
  return {
    tech: randomInt(3, 10),
    product: randomInt(3, 10),
    sales: randomInt(2, 8),
    operations: randomInt(3, 9),
  };
}

// 思维习惯
function generateThinkingHabits() {
  return {
    analysis: randomPick(['系统分析', '直觉判断', '先模仿再创新', '数据驱动']),
    difficulty: randomPick(['先查资料', '先问人', '自己试错', '拖延回避']),
    learning: randomPick(['实践学习', '理论学习', '边学边做', '系统学习']),
  };
}

export function generateAIProfile(domain, stage) {
  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG['AI开发者'];
  const firstName = randomPick(XING);
  const lastName = randomPick(MING);
  const name = firstName + lastName;

  return {
    id: uuid(),
    name,
    age: randomInt(25, 45),
    occupation: randomPick(config.occupations),
    education: randomPick(['大专', '本科', '硕士']),
    city: randomPick(CITIES),
    personality: generatePersonality(domain),
    skills: generateSkills(),
    background: {
      whyEntrepreneur: `放弃了${randomPick(['大厂高薪', '稳定工作', '海外就业', '研究生录取'])}来创业`,
      expectedGain: randomPick(['财务自由', '个人成长', '证明自己', '帮助更多人']),
      biggestFear: randomPick(['浪费时间', '家人失望', '产品没人用', '经济压力']),
    },
    thinkingHabits: generateThinkingHabits(),
    predictedBlockers: {
      mainBlocker: randomPick(config.blockers),
      secondaryBlocker: randomPick([...config.blockers, '执行拖延', '方向迷茫']),
      triggerCondition: '当任务连续失败2次以上时触发卡点',
    },
    goals30days: {
      product: randomPick(config.products),
      targetUser: `${randomPick(['中小卖家', '独立开发者', '中小企业', '个人用户'])}`,
      coreHypothesis: `${randomPick(['刚需高频', '痛点明显', '付费意愿强', '决策链短'])}的需求存在`,
    },
  };
}