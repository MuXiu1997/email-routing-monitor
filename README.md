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
- `TIMEZONE`: 时区（例如 `Asia/Shanghai`），用于计算“昨日”的时间范围
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

3. 邮件模板预览：

   ```bash
   pnpm dev:email
   ```

4. 部署：
   ```bash
   pnpm deploy
   ```

## Cloudflare Email Routing 字段说明

以下是 Cloudflare GraphQL API 中 `ZoneEmailRoutingAdaptive` 的可用字段：

| 字段名           | 类型     | 描述                                                                 |
| :--------------- | :------- | :------------------------------------------------------------------- |
| `action`         | `string` | 应用于源邮件的操作路由规则                                           |
| `arc`            | `string` | 源邮件的 ARC 检查状态                                                |
| `datetime`       | `Time`   | 收到源邮件的日期和时间                                               |
| `dkim`           | `string` | 源邮件的 DKIM 检查状态                                               |
| `dmarc`          | `string` | 源邮件的 DMARC 检查状态                                              |
| `errorDetail`    | `string` | 详细的错误消息（如果有）                                             |
| `eventType`      | `string` | 邮件来源 (incoming\|forward\|reply\|newEmail)                        |
| `from`           | `string` | 源邮件的发件人地址                                                   |
| `isNDR`          | `uint8`  | 该事件是否与 NDR (退信) 邮件相关                                     |
| `isSpam`         | `uint8`  | 源邮件是否为垃圾邮件                                                 |
| `messageId`      | `string` | 源邮件的 Message-ID 标头 (如果存在)                                  |
| `ruleMatched`    | `string` | 源邮件匹配的路由规则 UUID                                            |
| `sampleInterval` | `uint32` | ABR 采样间隔                                                         |
| `sessionId`      | `string` | 邮件日志条目的唯一标识符（注：同一邮件的重试可能会产生多个日志条目） |
| `spamScore`      | `uint32` | 垃圾邮件评分值                                                       |
| `spamThreshold`  | `uint32` | 垃圾邮件阈值值                                                       |
| `spf`            | `string` | 源邮件的 SPF 检查状态                                                |
| `status`         | `string` | 邮件的最终结果（操作）                                               |
| `subject`        | `string` | 源邮件的主题                                                         |
| `to`             | `string` | 源邮件的收件人地址                                                   |

## 许可证

[MIT](LICENSE)
