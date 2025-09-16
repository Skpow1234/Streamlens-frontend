export default function extractYouTubeInfo(url) {
  if (!url) return { videoId: null, time: 0 }
  // Video ID patterns: youtu.be/<id> | v=<id>
  let videoId = null
  const vParam = url.match(/[?&#]v=([^&#]+)/)
  const short = url.match(/youtu\.be\/([\w-]{6,})/)
  if (vParam) videoId = vParam[1]
  else if (short) videoId = short[1]

  // Time formats: t=123 | t=1h2m3s | ?start=123
  let time = 0
  const tParam = url.match(/[?&#]t=([^&#]+)/)
  const startParam = url.match(/[?&#]start=(\d+)/)
  if (startParam) time = parseInt(startParam[1], 10) || 0
  else if (tParam) {
    const t = tParam[1]
    if (/^\d+$/.test(t)) time = parseInt(t, 10)
    else {
      const h = (t.match(/(\d+)h/) || [])[1]
      const m = (t.match(/(\d+)m/) || [])[1]
      const s = (t.match(/(\d+)s/) || [])[1]
      time = (parseInt(h || 0, 10) * 3600) + (parseInt(m || 0, 10) * 60) + parseInt(s || 0, 10)
    }
  }

  return { videoId, time }
}