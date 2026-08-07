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
copy .env.example .env
# 在 .env 里填写 DEEPSEEK_API_KEY，不能写到 src/ 或任何前端文件里
npm run dev:full:py
```

前端会请求相对路径 `/api/writing-review`，本地 Vite 会把 `/api` 代理到 `http://localhost:8787`。API key 只由 `server/writing_review_api.py` 在服务端读取，不会进入浏览器打包产物。

## 构建

```bash
npm run build
npm run preview
```

## Python 作文批改 API

接口：`POST /api/writing-review`

请求体：

```json
{
  "taskType": "Task 2",
  "prompt": "作文题目",
  "essay": "学生作文原文"
}
```

服务端启动：

```bash
python server/writing_review_api.py
```

健康检查：

```bash
curl http://127.0.0.1:8787/healthz
```

## 阿里云 ECS 部署步骤

以下示例以 Ubuntu 22.04/24.04、站点域名 `your-domain.com`、项目目录 `/var/www/edutoro-ielts` 为例。

1. 安装基础环境

```bash
sudo apt update
sudo apt install -y git nginx python3 python3-venv nodejs npm
```

2. 上传或拉取项目

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <你的仓库地址> edutoro-ielts
cd /var/www/edutoro-ielts
npm install
npm run build
```

如果你不是部署在域名根路径，而是部署在 `https://your-domain.com/edutoro-ielts/` 这类子目录，构建前执行：

```bash
export VITE_BASE=/edutoro-ielts/
npm run build
```

3. 配置服务端密钥

```bash
cp .env.example .env
nano .env
```

生产环境至少填写：

```bash
DEEPSEEK_API_KEY=真实的key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_BASE=https://api.deepseek.com
HOST=127.0.0.1
PORT=8787
ALLOWED_ORIGINS=https://your-domain.com
USE_LOCAL_CALIBRATOR=true
```

权限收紧，避免其他用户读取：

```bash
chmod 600 /var/www/edutoro-ielts/.env
```

4. 创建 systemd 守护进程

```bash
sudo nano /etc/systemd/system/edutoro-writing-api.service
```

写入：

```ini
[Unit]
Description=Edutoro IELTS Writing Review API
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/edutoro-ielts
EnvironmentFile=/var/www/edutoro-ielts/.env
ExecStart=/usr/bin/python3 /var/www/edutoro-ielts/server/writing_review_api.py
Restart=always
RestartSec=3
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

启动并设置开机自启：

```bash
sudo chown -R www-data:www-data /var/www/edutoro-ielts
sudo systemctl daemon-reload
sudo systemctl enable --now edutoro-writing-api
sudo systemctl status edutoro-writing-api
```

查看日志：

```bash
sudo journalctl -u edutoro-writing-api -f
```

5. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/edutoro-ielts
```

写入：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/edutoro-ielts/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/edutoro-ielts /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

6. 配置 HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

7. 阿里云安全组

只开放公网 `80` 和 `443`。`8787` 不要对公网开放，Python API 只监听 `127.0.0.1`，只能被本机 Nginx 访问。

8. 上线检查

```bash
curl http://127.0.0.1:8787/healthz
curl https://your-domain.com/api/writing-review \
  -H 'Content-Type: application/json' \
  -d '{"taskType":"Task 2","prompt":"Some people think...","essay":"In recent years, this issue has become increasingly important. I believe there are several reasons for this trend. First, people now have more access to information. Second, schools and families play a role in shaping young people. Therefore, society should consider both benefits and drawbacks before making a decision."}'
```

## API key 安全原则

- 不要在 `src/`、`public/`、HTML、CSS、前端环境变量 `VITE_*` 中写 API key。
- `.env` 已在 `.gitignore` 中，不能提交；只提交 `.env.example`。
- 生产环境让 Nginx 暴露 `/api/writing-review`，不要暴露 `8787` 端口。
- 如怀疑 key 泄露，立刻在大模型平台重置 key，并替换服务器 `.env` 后执行 `sudo systemctl restart edutoro-writing-api`。

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
