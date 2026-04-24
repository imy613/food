中国34省分区美食真实图片下载工具包

一、文件说明
1. foods_manifest_download.csv
   全量下载清单。每行一个美食，对应一张图片。
   字段：
   - province：省份
   - region：分区
   - food：美食
   - search_query：搜索词
   - output_relpath：本地保存路径

2. foods_manifest_download.json
   与 CSV 对应的 JSON 版本，适合前端或脚本处理。

3. download_images.py
   自动下载脚本。
   功能：
   - 读取 CSV
   - 通过 DuckDuckGo 图片搜索查找真实图片
   - 下载并转成 JPG
   - 按 output_relpath 保存
   - 已存在文件自动跳过
   - 生成 download_log.csv 日志

4. init_folders.py
   先创建完整目录树。

二、运行环境
Windows / macOS / Linux 均可
建议 Python 3.10+

三、安装依赖
在终端执行：
pip install pandas requests pillow tqdm duckduckgo-search

四、运行步骤
1）把这几个文件放到同一个文件夹中
2）先初始化目录：
   python init_folders.py
3）再下载图片：
   python download_images.py

五、输出结果
下载完成后，你会得到：
- 中国34省真实图库/...
- download_log.csv

六、注意事项
1）每个美食只下载 1 张图
2）如果某张图下载失败，可以修改 foods_manifest_download.csv 里的 search_query 后重跑
3）脚本会跳过已经存在的图片，不会重复下载
4）当前清单来源于你此前确认的“34个省级行政区 → 分区 → 美食”结构化结果

七、当前清单规模
共 302 条美食记录
来源文件：foods_manifest_C3.csv
