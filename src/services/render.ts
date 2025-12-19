import type { EmailRoutingLog } from '../types'

export function renderFailureTable(failures: EmailRoutingLog[], totalFailed: number = 0) {
  if (failures.length === 0) {
    if (totalFailed > 0) {
      return `<p style="color: #f44336;">⚠️ 检测到 ${totalFailed} 封失败邮件，但无法获取详细日志（可能超出了查询限制）。</p>`
    }
    return '<p style="color: green;">✅ 所有邮件均转发成功。</p>'
  }

  const rows = failures.map(
    f => `
    <tr>
      <td style="padding:8px;border:1px solid #ddd;">${f.datetime}</td>
      <td style="padding:8px;border:1px solid #ddd;">${f.from}</td>
      <td style="padding:8px;border:1px solid #ddd;">${f.to}</td>
      <td style="padding:8px;border:1px solid #ddd;">${f.subject || '(无主题)'}</td>
      <td style="padding:8px;border:1px solid #ddd;color:red;">${f.status}</td>
      <td style="padding:8px;border:1px solid #ddd;">${f.errorDetail || '-'}</td>
    </tr>`,
  ).join('')

  return `
  <table style="border-collapse:collapse;width:100%;">
    <thead>
      <tr style="background:#f44336;color:white;">
        <th style="padding:12px 8px;text-align:left;">时间</th>
        <th style="padding:12px 8px;text-align:left;">发件人</th>
        <th style="padding:12px 8px;text-align:left;">收件人</th>
        <th style="padding:12px 8px;text-align:left;">主题</th>
        <th style="padding:12px 8px;text-align:left;">状态</th>
        <th style="padding:12px 8px;text-align:left;">错误详情</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

export function renderFullHtml(content: string, dateStr: string, totalFailed: number) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cloudflare Email Routing 监控 - ${dateStr}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
    h1 { color: #f44336; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    .meta { background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; gap: 2rem; }
    .meta b { color: #f44336; }
    .footer { margin-top: 3rem; color: #888; font-size: 0.9rem; text-align: center; border-top: 1px solid #eee; padding-top: 1rem; }
    .btn-group { margin-bottom: 1rem; }
    .btn { display: inline-block; background: #eee; padding: 0.4rem 0.8rem; border-radius: 4px; text-decoration: none; color: #333; font-size: 0.9rem; }
    .btn:hover { background: #ddd; }
  </style>
</head>
<body>
  <h1>⚠️ Email Routing 转发失败通知</h1>
  <div class="meta">
    <span>检测日期: <strong>${dateStr}</strong></span>
    <span>失败总数: <b>${totalFailed}</b></span>
  </div>
  ${content}
  <div class="footer">
    —— Cloudflare Worker 邮件监控
  </div>
</body>
</html>`
}
