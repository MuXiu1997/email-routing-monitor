# Email Routing Monitor

Cloudflare Worker 用于监控 Cloudflare Email Routing 的转发失败情况。如果检测到失败，将通过 Resend 发送邮件通知。

## 功能

- 每日定时检查（通过 Cron Trigger）
- 获取昨日所有转发失败的邮件详情（发件人、收件人、主题、错误详情等）
- 通过 Resend API 发送漂亮的 HTML 通知邮件

## 配置

在部署前，请确保在 Cloudflare Worker 中配置了以下环境变量：

### 环境变量 (Variables)

- `ZONE_ID`: Cloudflare 域名 Zone ID
- `RESEND_FROM`: 发件人地址（需在 Resend 验证）
- `RESEND_TO`: 接收通知的邮箱地址

### 机密信息 (Secrets)

- `CF_API_TOKEN`: 具有 `Zone.Email Routing:Read` 和 `Zone.Analytics:Read` 权限的 Cloudflare API 令牌
- `RESEND_API_KEY`: Resend API Key

## 开发

1. 安装依赖：

   ```bash
   pnpm install
   ```

2. 本地测试：

   ```bash
   pnpm dev
   ```

3. 部署：
   ```bash
   pnpm deploy
   ```

## 许可证

[MIT](LICENSE)
