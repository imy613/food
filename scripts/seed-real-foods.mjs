import fs from "node:fs/promises";
import path from "node:path";

const provincesPath = path.join(process.cwd(), "data", "provinces.json");

const dishPoolBySlug = {
  beijing: ["北京烤鸭", "炸酱面", "卤煮火烧", "豆汁焦圈", "炒肝", "铜锅涮肉", "驴打滚", "艾窝窝"],
  tianjin: ["狗不理包子", "煎饼果子", "耳朵眼炸糕", "十八街麻花", "锅巴菜", "罾蹦鲤鱼", "八珍豆腐", "熟梨糕"],
  hebei: ["驴肉火烧", "牛肉罩饼", "缸炉烧饼", "金毛狮子鱼", "承德御土荷叶鸡", "棋子烧饼", "正定崩肝", "焖子"],
  shanxi: ["刀削面", "过油肉", "平遥牛肉", "莜面栲栳栳", "太谷饼", "羊杂割", "剔尖", "猫耳朵"],
  "inner-mongolia": ["手把肉", "烤全羊", "奶茶", "血肠", "奶皮子", "风干牛肉", "呼和浩特烧麦", "羊杂碎"],
  liaoning: ["锅包肉", "沈阳鸡架", "老边饺子", "马家烧麦", "海城馅饼", "锦州烧烤", "大连焖子", "咸鱼饼子"],
  jilin: ["延吉冷面", "打糕", "石锅拌饭", "杀猪菜", "人参鸡汤", "长白山野菜炖菜", "朝鲜族米肠", "鹿茸三珍汤"],
  heilongjiang: ["哈尔滨红肠", "地三鲜", "小鸡炖蘑菇", "杀猪菜", "得莫利炖鱼", "大列巴", "酸菜白肉锅", "锅包肉"],
  shanghai: ["生煎包", "南翔小笼", "红烧肉", "葱油拌面", "腌笃鲜", "白斩鸡", "排骨年糕", "蟹壳黄"],
  jiangsu: ["松鼠鳜鱼", "盐水鸭", "扬州炒饭", "大煮干丝", "狮子头", "无锡酱排骨", "桂花糖藕", "阳澄湖大闸蟹"],
  zhejiang: ["西湖醋鱼", "龙井虾仁", "东坡肉", "宁波汤圆", "片儿川", "叫花鸡", "金华火腿", "舟山海鲜面"],
  anhui: ["臭鳜鱼", "毛豆腐", "李鸿章杂烩", "黄山烧饼", "一品锅", "徽州刀板香", "格拉条", "淮南牛肉汤"],
  fujian: ["佛跳墙", "沙县拌面", "海蛎煎", "土笋冻", "荔枝肉", "面线糊", "福州鱼丸", "姜母鸭"],
  jiangxi: ["瓦罐汤", "南昌拌粉", "藜蒿炒腊肉", "三杯鸡", "余干辣椒炒肉", "景德镇冷粉", "弋阳年糕", "赣南小炒鱼"],
  shandong: ["九转大肠", "葱烧海参", "糖醋鲤鱼", "德州扒鸡", "把子肉", "煎饼卷大葱", "油旋", "鲅鱼水饺"],
  henan: ["烩面", "胡辣汤", "洛阳水席", "开封灌汤包", "道口烧鸡", "桶子鸡", "焖饼", "牡丹燕菜"],
  hubei: ["热干面", "清蒸武昌鱼", "排骨藕汤", "三鲜豆皮", "周黑鸭", "襄阳牛肉面", "面窝", "洪山菜薹炒腊肉"],
  hunan: ["剁椒鱼头", "臭豆腐", "腊味合蒸", "口味虾", "糖油粑粑", "酱板鸭", "东安子鸡", "永州血鸭"],
  guangdong: ["白切鸡", "烧鹅", "广式早茶", "肠粉", "双皮奶", "潮汕牛肉火锅", "老火靓汤", "煲仔饭"],
  guangxi: ["螺蛳粉", "桂林米粉", "啤酒鱼", "老友粉", "柠檬鸭", "荔浦芋扣肉", "恭城油茶", "酸笋炒肉"],
  hainan: ["文昌鸡", "加积鸭", "东山羊", "和乐蟹", "海南粉", "清补凉", "椰子鸡", "糟粕醋火锅"],
  chongqing: ["重庆火锅", "重庆小面", "酸辣粉", "毛血旺", "泡椒凤爪", "山城小汤圆", "豆花饭", "辣子鸡"],
  sichuan: ["麻婆豆腐", "宫保鸡丁", "回锅肉", "夫妻肺片", "钟水饺", "担担面", "钵钵鸡", "兔头"],
  guizhou: ["酸汤鱼", "丝娃娃", "肠旺面", "花溪牛肉粉", "折耳根拌菜", "豆米火锅", "辣子鸡", "糟辣脆哨"],
  yunnan: ["过桥米线", "汽锅鸡", "宣威火腿", "野生菌火锅", "饵丝", "乳扇", "凉拌木瓜丝", "鲜花饼"],
  tibet: ["糌粑", "酥油茶", "牦牛肉干", "甜茶", "藏面", "青稞酒", "藏香猪", "青稞饼"],
  shaanxi: ["肉夹馍", "羊肉泡馍", "凉皮", "biangbiang面", "油泼面", "岐山臊子面", "葫芦鸡", "柿子饼"],
  gansu: ["兰州牛肉面", "手抓羊肉", "酿皮子", "灰豆子", "甜醅子", "河西烤羊排", "浆水面", "搓鱼子"],
  qinghai: ["手抓羊肉", "青海酿皮", "炕锅羊排", "牦牛酸奶", "尕面片", "狗浇尿油饼", "青稞饼", "杂碎汤"],
  ningxia: ["手抓羊肉", "羊杂碎", "烩小吃", "八宝茶", "枸杞宴", "清炖羊肉", "炒糊饽", "宁夏烩面"],
  xinjiang: ["大盘鸡", "烤羊肉串", "手抓饭", "馕", "拉条子", "烤包子", "椒麻鸡", "新疆酸奶"],
  taiwan: ["卤肉饭", "牛肉面", "蚵仔煎", "珍珠奶茶", "三杯鸡", "凤梨酥", "盐酥鸡", "大肠包小肠"],
  "hong-kong": ["云吞面", "烧味拼盘", "菠萝包", "港式奶茶", "叉烧饭", "杨枝甘露", "蛋挞", "煲仔饭"],
  macau: ["葡式蛋挞", "猪扒包", "葡国鸡", "木糠布甸", "澳门水蟹粥", "马介休球", "免治牛肉饭", "葡式海鲜饭"]
};

const imagePool = [
  "/images/foods/spicy-red.svg",
  "/images/foods/soy-ink.svg",
  "/images/foods/sea-blue.svg",
  "/images/foods/river-silver.svg",
  "/images/foods/northern-heat.svg",
  "/images/foods/noodle-amber.svg",
  "/images/foods/highland-gold.svg",
  "/images/foods/heritage-brown.svg",
  "/images/foods/dimsum-jade.svg"
];

function buildFood(provinceName, regionName, dishName, seed) {
  return {
    title: dishName,
    image: imagePool[seed % imagePool.length],
    story: `${dishName}是${provinceName}${regionName}广泛认知的代表风味之一，常用于展示本地餐桌特色。`,
    craft: `${dishName}强调原料处理、火候节奏与调味平衡，体现${provinceName}地方烹饪的技法取向。`,
    culture: `${dishName}在节庆、家宴与街巷日常中都具辨识度，是${provinceName}饮食文化的重要符号。`,
    dialect: `“来一份${dishName}，这口味道最地道。”`,
    heritage: `${provinceName}地方传统风味代表（初稿）`
  };
}

async function main() {
  const provinces = JSON.parse(await fs.readFile(provincesPath, "utf8"));

  provinces.forEach((province) => {
    const pool = dishPoolBySlug[province.slug];
    if (!pool || pool.length < 3) {
      throw new Error(`Missing real dish pool for ${province.slug}`);
    }

    province.regions = province.regions.map((region, regionIndex) => {
      const start = (regionIndex * 2) % pool.length;
      const picked = [pool[start], pool[(start + 1) % pool.length], pool[(start + 2) % pool.length]];
      return {
        ...region,
        foods: picked.map((dish, dishIndex) => buildFood(province.name, region.name, dish, start + dishIndex))
      };
    });
  });

  await fs.writeFile(provincesPath, `${JSON.stringify(provinces, null, 2)}\n`, "utf8");
  console.log(`Updated ${provinces.length} provinces with real dish names`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
