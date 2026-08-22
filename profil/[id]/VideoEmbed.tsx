export function VideoEmbed({ url }: { url: string }) {
  let embedSrc: string | null = null;
  let isDirectVideo = false;

  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v");
      if (id) embedSrc = `https://www.youtube-nocookie.com/embed/${id}`;
    } else if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) embedSrc = `https://player.vimeo.com/video/${id}`;
    } else if (/\.(mp4|webm|ogg)$/i.test(u.pathname)) {
      isDirectVideo = true;
    }
  } catch {
    return null;
  }

  if (isDirectVideo) {
    return (
      <div className="video-embed">
        <video src={url} controls preload="metadata" style={{ width: "100%", height: "100%" }} />
      </div>
    );
  }

  if (embedSrc) {
    return (
      <div className="video-embed">
        <iframe src={embedSrc} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      </div>
    );
  }

  return (
    <div className="video-embed" style={{ display: "flex", alignItems: "center", padding: 16 }}>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", fontSize: 13 }}>
        ▶ Voir la vidéo : {url}
      </a>
    </div>
  );
}
