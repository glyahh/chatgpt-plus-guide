# tools-hub

静态导航页，链接到店铺总览和五个已上线的 Surge 站点，并写明微信付款备注。首页 `index.html` 有一块「同站小工具 / 资料包」入口指向本页；直充教程正文、优惠码和 prodclub 链接不在这里改。

## 页面里有什么

`index.html` 为每个工具写了中文简介、英文简介和价格（摘自 2026-10-05 各站页面）：

中文资料包：微信扫码，金额按标价自填，备注写「关键词 + 邮箱」，约 12 小时内发货。催发货 / 售后：gyb1017123121@163.com。班主任和考研都是 ¥9.9，关键词分别写「班主任」「考研」。FlatNest 的 Pro 走英文站邮件意向，不走微信备注。

| 工具 | 链接 | 价格 |
|---|---|---|
| 店铺总览 | https://lenyue-tools.surge.sh/ | 五个商品的付款入口 |
| 公式搬运工 | https://gongshi-banyungong.surge.sh | 免费 ¥0（每天 3 次）；Pro 永久早鸟 ¥19.9，之后 ¥29.9 |
| 班主任期末救命包 | https://banzhuren-jimingbao.surge.sh | 早鸟 ¥9.9，之后 ¥19.9 |
| FlatNest | https://flatnest.surge.sh | 免费（约 8 万字符内）；Pro 早鸟一次性 $9 |
| 考研倒计时作战包 | https://kaoyan-zuozhanbao.surge.sh | 早鸟 ¥9.9，之后 ¥16.9 |
| 求职简历急救包 | https://jianli-jiujibao.surge.sh | 早鸟 ¥12.9，之后 ¥19.9 |

## GitHub Pages 如何提供本目录

仓库已经用 Actions 把**整个仓库根目录**发到 GitHub Pages，工作流是 `.github/workflows/deploy-site.yml`：

- 触发：push 到 `main`，或手动 `workflow_dispatch`
- 产物路径：`.`（仓库根目录，不是单独某个子目录）
- 自定义域名：根目录 `CNAME` 为 `glyahh.top`

因此合并到 `main` 之后：

- 直充教程首页仍是 https://glyahh.top/
- 本导航页是 https://glyahh.top/tools-hub/
- 对应文件是 https://glyahh.top/tools-hub/index.html

不要把工作流里的 `path` 改成 `tools-hub`。那样线上就只剩导航页，根目录教程会从 Pages 上消失。

### 若 Pages 还没打开

1. 打开仓库 **Settings → Pages**
2. **Build and deployment → Source** 选 **GitHub Actions**
3. 确认 `main` 上的 “Deploy Site” 工作流成功（本仓库已有该工作流，一般不用新建）

当前部署走 Actions 上传原始文件，不经过 Jekyll，所以 `tools-hub/index.html` 会按静态文件原样提供。

### 未绑定自定义域名时的地址

项目页默认是：

`https://glyahh.github.io/chatgpt-plus-guide/tools-hub/`

本仓库已经写了 `CNAME`，绑上 `glyahh.top` 之后，对外分享和收录请用 https://glyahh.top/tools-hub/ 。`raw.githubusercontent.com` 会把 HTML 当成纯文本，不适合当落地页。

### 合并前怎么看

在本机直接打开 `tools-hub/index.html`，或在仓库根目录执行：

```bash
python3 -m http.server 8765
```

然后访问 http://127.0.0.1:8765/tools-hub/ 。
