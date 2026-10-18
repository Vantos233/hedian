(() => {
  // One table owns the visible name, picture and actual preview audio.
  const scenes = {
    lounge: { name: '雨夜酒馆', image: 'site-assets/lounge.webp', audio: 'site-assets/sound-lounge.mp3', description: '窗边雨声 · 壁炉' },
    coast: { name: '海岸夜色', image: 'site-assets/coast.webp', audio: 'site-assets/sound-coast.mp3', description: '海浪 · 夏夜虫鸣' },
    forest: { name: '林间微风', image: 'site-assets/forest.webp', audio: 'site-assets/sound-forest.mp3', description: '森林鸟鸣 · 溪流 · 风铃' }
  };
  const resolveAsset = path => typeof previewAssets === 'undefined' ? path : previewAssets[path];
  const section = $('#sound'), button = $('#sound-play'), picture = $('#sound-image');
  let selected = 'lounge', sceneEpoch = 0, playEpoch = 0, player = null;
  function showPlayback(playing, loading = false) {
    section.dataset.playing = String(playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-busy', String(loading));
    button.setAttribute('aria-label', (playing ? '停止试听' : '播放试听') + scenes[selected].name);
    $('#sound-play-label').textContent = loading ? '正在加载…' : playing ? '停止试听' : '播放试听';
  }
  function stop() {
    ++playEpoch;
    if (player) { player.pause(); player.currentTime = 0; player = null; }
    showPlayback(false);
  }
  all('button[data-scene]').forEach(option => {
    option.setAttribute('aria-pressed', String(option.dataset.scene === selected));
    option.onclick = async () => {
      const next = option.dataset.scene, epoch = ++sceneEpoch;
      stop();
      button.disabled = true;
      picture.style.opacity = '.2';
      try {
        const image = new Image();
        image.src = resolveAsset(scenes[next].image);
        await image.decode();
        if (epoch !== sceneEpoch) return;
        // Commit together after loading, so the active label never identifies an old picture.
        selected = next;
        picture.src = image.src;
        picture.alt = scenes[next].name;
        picture.dataset.scene = next;
        $('#sound-current-name').textContent = scenes[next].name;
        $('#sound-current-description').textContent = scenes[next].description;
        all('button[data-scene]').forEach(item => {
          const active = item.dataset.scene === next;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        showPlayback(false);
      } catch {
        if (epoch === sceneEpoch) toast('场景图片未能加载，请重试');
      } finally {
        if (epoch === sceneEpoch) { picture.style.opacity = '1'; button.disabled = false; }
      }
    };
  });
  button.onclick = () => {
    if (player) { stop(); return; }
    const epoch = ++playEpoch;
    const audio = new Audio(resolveAsset(scenes[selected].audio));
    player = audio;
    audio.preload = 'none';
    audio.volume = .75;
    audio.loop = false;
    audio.addEventListener('ended', () => { if (epoch === playEpoch) stop(); });
    showPlayback(false, true);
    audio.play().then(() => {
      if (epoch !== playEpoch || player !== audio) { audio.pause(); return; }
      showPlayback(true);
    }).catch(() => {
      if (epoch !== playEpoch) return;
      stop();
      toast('浏览器未能播放，请用系统浏览器重试');
    });
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  showPlayback(false);
})();
