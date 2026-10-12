(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let listeners, typingTimer, typedCount = 0, typingDone = false;

  function typeWelcome() {
    const heading = $('.hero-copy h1');
    if (!heading) return;
    clearTimeout(typingTimer);
    const text = 'Welcome Portfolio.';
    heading.classList.add('typing-heading');
    heading.setAttribute('aria-label', text);
    heading.innerHTML = '<span class="typing-ghost" aria-hidden="true">Welcome <span class="portfolio-word">Portfolio.</span></span><span class="typing-live" aria-hidden="true"></span>';
    const live = heading.querySelector('.typing-live');
    if (reduced.matches || typingDone) typedCount = text.length;
    function paint() {
      const prefix = text.slice(0, Math.min(typedCount,8));
      live.textContent = prefix;
      if (typedCount > 8) {
        const portfolio = document.createElement('span');
        portfolio.className = 'portfolio-word';
        portfolio.textContent = text.slice(8, typedCount);
        live.appendChild(portfolio);
      }
      const done = typedCount === text.length;
      heading.classList.toggle('typing-complete',done);
      if (done) { typingDone = true; return; }
      typingTimer = setTimeout(() => { typedCount++; paint(); }, typedCount === 7 ? 280 : 95);
    }
    paint();
  }

  function elasticBadge(signal) {
    const badge = $('#badge'), lanyard = $('#lanyard');
    if (!badge || !lanyard) return;
    lanyard.classList.add('elastic-lanyard');
    badge.setAttribute('aria-label','ดึงป้ายห้อยคอ');
    badge.querySelector('img')?.setAttribute('draggable','false');
    let pointer = null, startY = 0, moved = false, maxPull = 95, dragScale = 1;
    function limit() {
      const scene = $('.badge-scene').getBoundingClientRect();
      const scale = Number.parseFloat(getComputedStyle(lanyard).scale) || 1;
      return Math.max(20,Math.min(95,(scene.height - 520 * scale - 12) / scale));
    }
    function pull(distance) {
      lanyard.style.setProperty('--badge-pull', `${Math.max(0,Math.min(maxPull,distance))}px`);
    }
    function release() {
      if (pointer === null) return;
      const oldPointer = pointer; pointer = null;
      lanyard.classList.remove('badge-dragging');
      pull(0); lanyard.style.setProperty('--badge-angle','0deg');
      if (badge.hasPointerCapture(oldPointer)) badge.releasePointerCapture(oldPointer);
    }
    badge.addEventListener('pointerenter',event => {
      if (pointer === null && event.pointerType === 'mouse') { maxPull=limit();pull(15); }
    },{signal});
    badge.addEventListener('pointerleave',() => { if (pointer === null) pull(0); },{signal});
    badge.addEventListener('pointerdown',event => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      event.preventDefault(); pointer = event.pointerId; startY = event.clientY; moved = false;
      maxPull=limit();dragScale=Number.parseFloat(getComputedStyle(lanyard).scale)||1;
      badge.setPointerCapture(pointer); lanyard.classList.add('badge-dragging'); pull(20);
    },{signal});
    badge.addEventListener('pointermove',event => {
      if (event.pointerId !== pointer) return;
      const delta = event.clientY - startY;
      if (Math.abs(delta) > 5) moved = true;
      pull(20 + Math.max(0,delta) / dragScale);
    },{signal});
    for (const name of ['pointerup','pointercancel','lostpointercapture']) badge.addEventListener(name,release,{signal});
    badge.addEventListener('click',event => {
      if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; }
      lanyard.classList.remove('swing-kick');
    },{signal,capture:true});
    badge.addEventListener('keydown',event => {
      if (!['Enter',' '].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation(); maxPull=limit();pull(40);
      setTimeout(() => { if (lanyard.isConnected && pointer === null) pull(0); },200);
    },{signal});
    window.addEventListener('blur',release,{signal});
  }

  function stablePanels() {
    const notes = $('.profile-notes');
    if (notes) {
      let tallest = 0;
      notes.querySelectorAll('.profile-note').forEach(panel => {
        const hidden = panel.hidden;
        panel.hidden = false;
        panel.style.cssText = 'position:absolute;visibility:hidden;inset:auto;width:100%;height:auto;min-height:0;overflow:visible;animation:none';
        tallest = Math.max(tallest,panel.scrollHeight);
        panel.style.cssText = ''; panel.hidden = hidden;
      });
      const height=`${Math.ceil(tallest)}px`;
      if(notes.style.getPropertyValue('--profile-panel-height')!==height)notes.style.setProperty('--profile-panel-height',height);
    }
    const school = $('.school-detail');
    if (school && !school.querySelector('.grade-stamp')) {
      const blank = document.createElement('div'); blank.className = 'grade-stamp grade-placeholder';
      blank.setAttribute('aria-hidden','true'); school.querySelector('.school-detail-bottom').before(blank);
    }
  }

  function init() {
    listeners?.abort(); listeners = new AbortController();
    typeWelcome(); elasticBadge(listeners.signal); stablePanels();
    const section = $('.chapter-page'), heading = section?.querySelector('.page-heading');
    if (heading) {
      if (!heading.querySelector('p')) {
        const spacer = document.createElement('p'); spacer.className='heading-spacer'; spacer.setAttribute('aria-hidden','true');
        heading.querySelector('div').appendChild(spacer);
      }
      const status = $('#status');
      if (status && !status.parentElement.classList.contains('status-slot')) {
        const slot=document.createElement('div');slot.className='status-slot'; heading.after(slot);slot.appendChild(status);
      }
    }
  }
  window.PORTFOLIO_MOTION = {init};
  let panelFrame=0;
  function schedulePanels() {
    if(panelFrame)return;
    panelFrame=requestAnimationFrame(()=>{panelFrame=0;stablePanels();});
  }
  const observer = new MutationObserver(records => {
    const relevant=records.some(record=>{
      const target=record.target;
      return target instanceof Element&&(target.matches('#main')||target.closest('.profile-notes,.school-detail'));
    });
    if(relevant)schedulePanels();
  });
  observer.observe($('#main'),{childList:true,subtree:true});
  window.addEventListener('resize',schedulePanels);
  document.fonts?.ready.then(schedulePanels);
  init();
})();
