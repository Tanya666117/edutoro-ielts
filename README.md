# Edutoro 雅思前端

单页展示站点：口语 Part 1 练习、考点回忆录、一对一独立老师、多对一督学、领资料/加群。

## 功能模块

| 区块 | ID | 说明 |
|------|-----|------|
| 首屏 | `#hero` | 品牌介绍与快捷入口 |
| 口语练习 | `#speaking` | 23 话题 · 118+ 题，列表 / 详情 / 随机模拟 |
| 考点回忆 | `#recalls` | 按科目、城市筛选 |
| 服务体系 | `#services` | 一对一 vs 多对一督学对比 |
| 独立老师 | `#teachers` | 5 位老师卡片 |
| 领资料 | `#contact` | 企微二维码占位 + 弹窗 |

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 更新口语题库

编辑 `data/ielts_speaking.html` 后运行：

```bash
npm run parse-speaking
# 或
python3 scripts/parse_speaking_html.py
```

会重新生成 `src/data/speaking-topics.json`。

## 待替换内容

- `src/sections/ContactSection.tsx` 与 `ContactModal.tsx` 中的企微二维码
- `src/data/teachers.json` 老师真实信息与照片
- `src/data/recalls.json` 考点回忆（建议月度更新）
