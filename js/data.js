/* 人物與城市資料：新增預設角色、詞庫或地點時，從這裡擴充。 */
(function (root, factory) {
  'use strict';
  const data = factory(typeof module === 'object' && module.exports ? require('./profiles.js') : root.CityProfiles);
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CityData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PROFILES) {
  'use strict';
  const TIMES = ['早上', '下午', '晚上'];
  const PLACES = [
    {id:'community',name:'社區',icon:'🏘️',desc:'熟悉的街角，常能遇見鄰居'},
    {id:'market',name:'傳統市場',icon:'🥬',desc:'清晨採買，充滿生活氣息'},
    {id:'mall',name:'百貨公司',icon:'🛍️',desc:'購物、美食與休閒時光'},
    {id:'cafe',name:'咖啡廳',icon:'☕',desc:'適合坐下來輕鬆聊天'},
    {id:'park',name:'公園',icon:'🌳',desc:'散步、運動與午後微風'},
    {id:'library',name:'圖書館',icon:'📚',desc:'書香與安靜的午後'}
  ];
  const DEFAULTS = [
    {name:'林若晴',age:32,marital:'已婚',trait:'溫柔慢熟',job:'花藝工作者',hobby:'咖啡與插花',bio:'住在附近的花藝工作者，習慣在市場挑選當季花材。她正在準備第一場社區花藝課，希望用自己的步調與人相處。',emoji:'🌷',schedule:['market','cafe','community'],familiarity:6,trust:4,closeness:0},
    {name:'蘇以安',age:35,marital:'單身',trait:'理性沉穩',job:'平面設計師',hobby:'閱讀與藝術',bio:'自由接案的設計師，喜歡逛書店與展覽。她正在整理一本記錄城市招牌的畫冊，欣賞願意認真傾聽的人。',emoji:'📖',schedule:['library','mall','community'],familiarity:3,trust:3,closeness:0},
    {name:'陳芷妍',age:30,marital:'離婚',trait:'開朗健談',job:'烘焙師',hobby:'甜點與散步',bio:'總能分享附近的新鮮事，對生活中的小細節充滿好奇。重新安排生活後，她正計畫推出以街坊故事命名的甜點。',emoji:'🍰',schedule:['park','market','cafe'],familiarity:8,trust:5,closeness:0}
  ];
  const NAMES = ['許沛珊','周書妍','張詠晴','吳若寧','葉思凡','高語晨','李婉婷','方采薇','曾宜庭','邱沐安','沈知遠','江承宇','何映辰','柯景文'];
  const JOBS = ['書店店員','室內設計師','甜點師','攝影師','社區活動企劃','服飾店經營者','插畫家','行銷企劃','瑜伽老師','咖啡師'];
  const TRAITS = ['活潑外向','溫柔慢熟','理性沉穩','幽默風趣','獨立務實','細膩敏感'];
  const HOBBIES = ['旅行與甜點','植物與攝影','咖啡與閱讀','散步與電影','音樂與烹飪','藝術與運動'];
  const EMOJIS = ['🌷','📖','🪻','🎨','📷','☕','🍰','🌻','📚','🧁','🎵'];
  DEFAULTS.forEach((c,i)=>c.coreId = ['ruoqing','yian','zhiyan'][i]);
  return {PROFILES, TIMES, PLACES, DEFAULTS, NAMES, JOBS, TRAITS, HOBBIES, EMOJIS};
});
