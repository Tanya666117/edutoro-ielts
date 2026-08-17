# 作文批改用户系统说明

## 当前落地

- 运行形态：单机 `2核4G` 阿里云 ECS
- 服务端：`Node.js` 单进程 API
- 用户库：`data/writing-users.json`
- 会话：同文件内轻量 session 记录
- 密码：服务端使用 `scrypt` 哈希后保存
- 批改次数：字段 `writingCredits`

这套实现适合当前阶段：

- 不需要额外数据库服务
- 部署简单，适合单机小流量
- 充值后可直接手动改额度
- 前端接口已经稳定，后续迁移 PostgreSQL 时不用改页面协议

## 已实现能力

- 注册即送 `2` 次作文批改
- 登录后提交作文时校验额度
- 每次成功批改后自动扣减 `1` 次
- 次数不足时弹出微信引导和收费方案

## 后台手动改额度

执行：

```bash
npm run credits:set -- <email> <credits>
```

示例：

```bash
npm run credits:set -- test@example.com 26
```

表示把该用户的作文批改剩余次数直接改成 `26`。

## 后续升级建议

如果用户量明显上来，建议下一步迁移为：

- 数据库：`PostgreSQL`
- ORM：`Drizzle`
- 鉴权：保留当前接口结构，底层替换为数据库表

优先迁移的表：

- `users`
- `sessions`
- `writing_credit_logs`
- `payment_orders`
