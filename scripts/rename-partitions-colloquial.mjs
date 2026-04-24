import fs from "node:fs/promises";
import path from "node:path";

const partitionDir = path.join(process.cwd(), "data", "provincePartitions");
const provincesPath = path.join(process.cwd(), "data", "provinces.json");

const colloquialNamesBySlug = {
  beijing: ["中轴皇城", "东城胡同", "南城烟火", "京西山地", "北苑科创", "副中心运河", "燕山脚下", "永定河畔"],
  tianjin: ["海河老城", "滨海新区", "津南港区", "津西工贸带", "蓟州山前", "运河商埠", "津北居住圈", "海湾产业带"],
  hebei: ["京畿环廊", "冀中平原", "冀北坝上", "太行山前", "冀东沿海", "冀南运河", "燕赵古城带", "渤海湾岸"],
  shanxi: ["晋北煤都", "忻代高地", "晋中腹地", "汾河谷地", "晋东南盆地", "晋南盐运", "吕梁山地", "太行山麓"],
  "inner-mongolia": ["呼包鄂都市圈", "河套平原", "锡林郭勒草原", "赤峰通辽农牧带", "呼伦贝尔林海", "阿拉善荒漠", "兴安岭南麓", "鄂尔多斯高原"],
  liaoning: ["辽中城市带", "沈抚平原", "辽东山海", "锦阜走廊", "大连半岛", "沿海渔港", "辽西走廊", "鞍本工业带"],
  jilin: ["长吉平原", "松辽粮仓", "延边风味圈", "白山林海", "松花江畔", "西部草原带", "长白山麓", "吉南谷地"],
  heilongjiang: ["哈大走廊", "松嫩平原", "三江湿地", "小兴安岭", "大兴安岭", "牡丹江谷地", "边境林区", "漠河北极带"],
  shanghai: ["外滩老城厢", "浦东陆家嘴", "闵行吴淞", "松江青浦水乡", "崇明生态岛", "临港新片区", "虹桥枢纽圈", "沿江工业带"],
  jiangsu: ["苏南水乡", "南京都市圈", "扬泰淮扬", "徐海平原", "沿江工贸带", "沿海盐风带", "太湖环线", "里下河水网"],
  zhejiang: ["杭嘉湖平原", "宁绍沿海", "温台山海", "金衢盆地", "浙西山地", "舟山海岛", "运河古埠", "钱塘江谷"],
  anhui: ["皖北平原", "合六都市圈", "皖江沿线", "黄山徽州", "皖南山地", "江淮丘陵", "淮河两岸", "大别山麓"],
  fujian: ["闽东海岸", "福州府城", "闽南金三角", "厦漳泉港湾", "闽西客家", "武夷山地", "平潭海岛带", "侨乡古镇带"],
  jiangxi: ["南昌鄱阳湖", "赣中丘陵", "赣南客家", "景德镇瓷都", "赣东北山地", "九江沿江带", "赣西矿冶带", "抚河流域"],
  shandong: ["胶东半岛", "济青都市带", "鲁中山地", "鲁西平原", "运河古埠", "黄河入海口", "泰山腹地", "滨海渔盐带"],
  henan: ["豫北平原", "郑洛都市圈", "豫中腹地", "豫东粮仓", "豫西山地", "南阳盆地", "中原古都带", "黄河走廊"],
  hubei: ["武汉都市圈", "江汉平原", "鄂西山地", "三峡库区", "鄂东丘陵", "鄂北岗地", "汉水谷地", "荆楚古镇带"],
  hunan: ["长株潭都市圈", "洞庭湖区", "湘西苗岭", "湘南丘陵", "湘中盆地", "湘北水网", "雪峰山麓", "武陵山地"],
  guangdong: ["珠三角", "潮汕平原", "粤北山地", "粤西沿海", "客家围龙带", "雷州半岛", "广佛同城圈", "韩江流域"],
  guangxi: ["桂北山水", "桂中盆地", "桂南沿海", "桂西喀斯特", "左右江河谷", "北部湾", "桂东丘陵", "红水河流域"],
  hainan: ["海口琼北", "文昌琼东", "三亚琼南", "琼中山地", "万宁陵水带", "儋州临高带", "西海岸渔港", "中部雨林带"],
  chongqing: ["渝中两江", "渝东北三峡", "渝东南武陵", "渝西走廊", "渝南丘陵", "渝北山城", "巴渝古镇带", "乌江流域"],
  sichuan: ["成都平原", "川南江河", "川东北巴渠", "川中丘陵", "川西高原", "攀西山地", "川西北草地", "盆地边缘"],
  guizhou: ["黔中腹地", "黔北赤水", "黔南喀斯特", "黔东南苗侗", "黔西高原", "贵阳都市圈", "乌蒙山区", "铜仁梵净带"],
  yunnan: ["滇中高原", "滇西怒江带", "滇南雨林", "滇东北乌蒙", "滇西北雪山", "滇东红土", "大理洱海圈", "版纳茶山带"],
  tibet: ["拉萨河谷", "藏南山地", "藏东峡谷", "藏北羌塘", "阿里高原", "日喀则农牧", "林芝雨林带", "雅鲁藏布江谷"],
  shaanxi: ["关中平原", "陕北黄土", "陕南秦巴", "榆林能源带", "渭河走廊", "汉中盆地", "秦岭山麓", "古都城廓带"],
  gansu: ["河西走廊", "陇中高地", "陇南山地", "甘南草原", "兰白城市带", "祁连山麓", "丝路古驿带", "黄河上游带"],
  qinghai: ["西宁河湟", "青海湖北岸", "黄南河谷", "海南草地", "果洛高原", "玉树三江源", "海西柴达木", "藏南山地"],
  ningxia: ["银川平原", "贺兰山东麓", "宁南山区", "固原清水河", "中卫沙坡头", "吴忠河套带", "六盘山麓", "黄河灌区"],
  xinjiang: ["北疆伊犁", "天山山脉", "南疆绿洲", "东疆火洲", "阿勒泰山地", "塔城草原", "喀什和田", "吐哈盆地"],
  taiwan: ["台北都会", "桃竹苗丘陵", "台中盆地", "彰化云嘉", "台南平原", "高屏平原", "花东纵谷", "宜兰兰阳"],
  "hong-kong": ["港岛都会", "九龙市区", "新界西", "新界东", "离岛海湾", "口岸商圈", "维港两岸", "山海郊野带"],
  macau: ["澳门半岛", "氹仔城区", "路环海湾", "路氹综合区", "历史城区", "新口岸", "外港商圈", "内港旧埠"]
};

function extractDataObject(tsSource) {
  const match = tsSource.match(/const mapData:[\s\S]*?=\s*(\{[\s\S]*\});\s*export default mapData;/);
  if (!match) {
    throw new Error("Unable to parse partition map object");
  }
  return JSON.parse(match[1]);
}

async function main() {
  const files = (await fs.readdir(partitionDir))
    .filter((fileName) => fileName.endsWith(".ts") && fileName !== "loaders.ts")
    .sort();

  const provinceRegionsBySlug = {};

  for (const fileName of files) {
    const slug = fileName.replace(".ts", "");
    const source = await fs.readFile(path.join(partitionDir, fileName), "utf8");
    const mapData = extractDataObject(source);

    const pool = colloquialNamesBySlug[slug];
    if (!pool || pool.length === 0) {
      throw new Error(`Missing colloquial partition names for ${slug}`);
    }

    mapData.partitions = mapData.partitions.map((partition, index) => ({
      ...partition,
      name: pool[index] ?? `${pool[0]}片区${index + 1}`
    }));

    provinceRegionsBySlug[slug] = mapData.partitions.map((partition) => partition.name);

    const updatedSource = `import { ProvincePartitionMapData } from "@/types";\n\nconst mapData: ProvincePartitionMapData = ${JSON.stringify(
      mapData,
      null,
      2
    )};\n\nexport default mapData;\n`;
    await fs.writeFile(path.join(partitionDir, fileName), updatedSource, "utf8");
  }

  const provinces = JSON.parse(await fs.readFile(provincesPath, "utf8"));
  provinces.forEach((province) => {
    const targetNames = provinceRegionsBySlug[province.slug];
    if (!targetNames) {
      throw new Error(`No partition names found for ${province.slug}`);
    }
    province.regions = province.regions.map((region, index) => ({
      ...region,
      name: targetNames[index] ?? region.name
    }));
  });

  await fs.writeFile(provincesPath, `${JSON.stringify(provinces, null, 2)}\n`, "utf8");
  console.log(`Updated colloquial partition names for ${files.length} provinces`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
