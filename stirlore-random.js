(() => {
  const stage = $('#random-stage'), camera = $('.random-camera'), card = $('.random-card');
  const startButton = $('#random-start'), drawButton = $('#random-draw'), replayButton = $('#random-replay');
  const resolveAsset = path => typeof previewAssets === 'undefined' ? path : previewAssets[path];
  const choices = [
    { id: 'negroni', name: '尼克罗尼', english: 'Negroni', note: '金酒 · 苦甜交织' },
    { id: 'margarita', name: '玛格丽特', english: 'Margarita', note: '龙舌兰 · 清爽酸香' },
    { id: 'mojito', name: '莫吉托', english: 'Mojito', note: '朗姆酒 · 薄荷清香' }
  ];
  let deck = [], current = null, busy = false, animations = [];
  drawButton.disabled = replayButton.disabled = $('#random-recipe').disabled = true;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function next() {
    if (!deck.length) {
      deck = [...choices];
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      if (deck.at(-1)?.id === current?.id) [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
    }
    return deck.pop();
  }
  function show(choice) {
    current = choice;
    $('#random-photo').src = resolveAsset(`site-assets/${choice.id}.webp`);
    $('#random-photo').alt = choice.name;
    $('#random-name').textContent = choice.name;
    $('#random-english').textContent = choice.english;
    $('#random-note').textContent = choice.note;
    card.dataset.cocktail = choice.id;
  }
  function lock(value) { busy = value; drawButton.disabled = replayButton.disabled = $('#random-recipe').disabled = value; }
  async function animate(element, frames, timing) {
    const animation = element.animate(frames, timing);
    animations.push(animation);
    try { await animation.finished; } catch { /* cancelled by a replay */ }
  }
  async function enter() {
    if (busy) return;
    lock(true);
    animations.forEach(a => a.cancel()); animations = [];
    stage.dataset.state = 'entering';
    show(next());
    if (reduced()) { stage.dataset.state = 'ready'; lock(false); return; }
    // Fully show the bar for 600 ms before moving the camera toward the menu.
    const cameraMove = animate(camera, [
      { transform: 'translateY(0) scale(1)', offset: 0 },
      { transform: 'translateY(0) scale(1)', offset: .30 },
      { transform: 'translateY(-8%) scale(1.3)', offset: .76 },
      { transform: 'translateY(-8%) scale(1.3)', offset: 1 }
    ], { duration: 2200, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    await animate(card, [
      { opacity: 1, transform: 'translate(-50%,45%) perspective(800px) rotateX(62deg) scale(.56)', offset: 0 },
      { opacity: 1, transform: 'translate(-50%,45%) perspective(800px) rotateX(62deg) scale(.56)', offset: .52 },
      { opacity: 1, transform: 'translate(-50%,-50%) perspective(800px) rotateX(0deg) scale(1)', offset: 1 }
    ], { duration: 2200, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
    await cameraMove;
    stage.dataset.state = 'ready'; lock(false);
  }
  drawButton.onclick = async () => {
    if (busy) return;
    lock(true);
    if (!reduced()) await animate(card, [
      { transform: 'translate(-50%,-50%) scaleX(1)', opacity: 1 },
      { transform: 'translate(-50%,-52%) scaleX(.015)', opacity: .55 }
    ], { duration: 250, easing: 'ease-in', fill: 'forwards' });
    show(next());
    if (!reduced()) await animate(card, [
      { transform: 'translate(-50%,-52%) scaleX(.015)', opacity: .55 },
      { transform: 'translate(-50%,-50%) scaleX(1)', opacity: 1 }
    ], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    lock(false);
  };
  startButton.onclick = replayButton.onclick = enter;
  $('#random-recipe').onclick = () => {
    $('[data-tab="detail"]').click();
    $('#experience').scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'start' });
  };
})();
