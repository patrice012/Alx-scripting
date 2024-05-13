async function getMediaUrls(page) {
  const videoUrl = await page.$$eval("video", (videos) => {
    let validHrefs = [];
    videos.forEach((video) => {
      if (video.src) validHrefs.push(video.src);
    });
    return validHrefs;
  });

  const audioUrl = await page.$$eval("audio", (audios) => {
    let validHrefs = [];
    audios.forEach((audio) => {
      if (audio.src) validHrefs.push(audio.src);
    });
    return validHrefs;
  });

  return {
    videoUrl,
    audioUrl,
  };
}
