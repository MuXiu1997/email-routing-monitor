import type { EmailRoutingLog } from '../types'

export function renderFailureTable(failures: EmailRoutingLog[], totalFailed: number = 0) {
  if (failures.length === 0) {
    if (totalFailed > 0) {
      return `<p style="color: #f44336;">⚠️ 检测到 ${totalFailed} 封失败邮件，但无法获取详细日志（可能超出了查询限制）。</p>`
    }
    return '<p style="color: green;">✅ 所有邮件均转发成功。</p>'
  }

  const cards = failures.map((f) => {
    const isSpam = f.isSpam === 1
    const isSuccess = f.status === 'delivered'
    const statusColor = isSuccess ? '#2e7d32' : (isSpam ? '#ffa000' : '#d32f2f')
    const borderColor = isSuccess ? '#c8e6c9' : (isSpam ? '#ffecb3' : '#ffcdd2')
    const bgColor = isSuccess ? '#f1f8e9' : (isSpam ? '#fffdf7' : '#fff8f8')

    // 各种验证状态的标签
    const renderBadge = (label: string, value: string) => {
      const isPass = value.toLowerCase() === 'pass'
      const color = isPass ? '#2e7d32' : '#d32f2f'
      const bg = isPass ? '#e8f5e9' : '#ffebee'
      return `<span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:bold;margin-right:4px;background:${bg};color:${color};text-transform:uppercase;">${label}:${value}</span>`
    }

    const allFields = Object.entries(f)
      .map(([key, value]) => `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:6px 0;color:#888;font-size:12px;width:120px;vertical-align:top;">${key}</td>
          <td style="padding:6px 0;font-family:monospace;font-size:12px;word-break:break-all;">${value === '' ? '<span style="color:#ccc;">(empty)</span>' : value}</td>
        </tr>
      `)
      .join('')

    return `
    <div style="border:1px solid ${borderColor}; border-radius:12px; margin-bottom:20px; overflow:hidden; background:${bgColor}; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
      <div style="padding:16px;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <span style="background:${statusColor}; color:white; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:bold; text-transform:uppercase;">${f.status}</span>
            ${isSpam ? '<span style="margin-left:8px; color:#ffa000; font-size:12px; font-weight:bold;">⚠️ SPAM</span>' : ''}
          </div>
          <span style="color:#999; font-size:12px;">${f.datetime}</span>
        </div>

        <!-- Main Info -->
        <div style="margin-bottom:12px;">
          <div style="font-size:16px; font-weight:bold; color:#333; margin-bottom:4px;">${f.subject || '(无主题)'}</div>
          <div style="font-size:14px; color:#555;">
            <span style="color:#888;">From:</span> ${f.from.replace('<', '&lt;').replace('>', '&gt;')}
          </div>
          <div style="font-size:14px; color:#555;">
            <span style="color:#888;">To:</span> ${f.to}
          </div>
        </div>

        <!-- Security Badges -->
        <div style="margin-bottom:12px;">
          ${renderBadge('SPF', f.spf)}
          ${renderBadge('DKIM', f.dkim)}
          ${renderBadge('DMARC', f.dmarc)}
        </div>

        <!-- Error Detail -->
        ${f.errorDetail
          ? `
        <div style="margin-top:12px; padding:12px; background:#fff; border:1px solid ${borderColor}; border-left:4px solid ${statusColor}; border-radius:6px; font-size:13px; color:#444; line-height:1.4;">
          <strong>Error:</strong> ${f.errorDetail}
        </div>`
          : ''}
      </div>

      <!-- Raw Data Toggle -->
      <details style="border-top:1px solid ${borderColor};">
        <summary style="padding:10px 16px; cursor:pointer; color:${statusColor}; font-size:13px; font-weight:bold; outline:none; background:rgba(0,0,0,0.02);">
          展开原始诊断数据 (Session: ${f.sessionId})
        </summary>
        <div style="padding:0 16px 16px;">
          <table style="width:100%; border-collapse:collapse;">
            ${allFields}
          </table>
        </div>
      </details>
    </div>`
  }).join('')

  return `<div>${cards}</div>`
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
