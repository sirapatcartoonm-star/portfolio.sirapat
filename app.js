(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const escape = (v = '') => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const page = document.body.dataset.page;
  const pages = [
    ['profile','profile.html','ประวัติส่วนตัว','user-round'],
    ['education','education.html','การศึกษา','graduation-cap'],
    ['competition','competitions.html','การแข่งขัน','trophy'],
    ['activity','activities.html','กิจกรรม','sparkles']
  ];
  const competitionLevels=[['school','สถานศึกษา','school','pink'],['province','จังหวัด','map-pin','blue'],['region','ภาค','map','purple'],['national','ชาติ','flag','yellow']];
  const competitionAwards=['ชนะเลิศ','รองชนะเลิศอันดับ 1','รองชนะเลิศอันดับ 2','รองชนะเลิศอันดับ 3','รองชนะเลิศอันดับ 4','ชมเชย','เข้าร่วม'];
  const levelLabel=value=>competitionLevels.find(x=>x[0]===value)?.[1]||'ยังไม่ระบุระดับ';
  const defaultProfile = {
    name:'สิรภัทร ศรีมณีกาญจน์', nickname:'การ์ตูน', birth:'17 มิถุนายน พ.ศ. 2549',
    age:'20 ปี', nationality:'ไทย', religion:'พุทธ',
    location:'บ้านเลขที่ 54 หมู่ 5 ตำบลบางคนที อำเภอบางคนที จังหวัดสมุทรสงคราม 75120',
    email:'sirapat.cartoonm@gmail.com', phone:'099-178-1826',
    facebook:'Sirapat Srimaneekarn', instagram:'_.cartoonsri',
    hobbies:'ฟังเพลง,ดูหนัง,อ่านหนังสือ,ออกแบบ,วาดรูป',
    skills:'การเป็นพิธีกร,ความเป็นผู้นำ,การออกแบบ',
    software:'Photoshop,Illustrator,Procreate,Canva,Figma,Access,PowerPoint,Excel,Word,CapCut'
  };
  const defaultEducation = [
    {id:'5136d8c0-0001-4000-8000-000000000001',kind:'education',title:'โรงเรียนอนุบาลวัดเกาะใหญ่ (เลี้ยงล้อมอนุกูล)',subtitle:'ระดับประถมศึกษา',period:'2561',description:'สำเร็จการศึกษา ปี 2561',logoY:0},
    {id:'5136d8c0-0002-4000-8000-000000000002',kind:'education',title:'โรงเรียนถาวรานุกูล',subtitle:'ระดับมัธยมศึกษาตอนต้น',period:'2564',description:'สำเร็จการศึกษา ปี 2564\nGPAX : 3.12',logoY:128},
    {id:'5136d8c0-0003-4000-8000-000000000003',kind:'education',title:'วิทยาลัยเทคนิคสมุทรสงคราม',subtitle:'ระดับประกาศนียบัตรวิชาชีพ',period:'2567',description:'สาขาวิชาคอมพิวเตอร์ธุรกิจ\nสำเร็จการศึกษา ปี 2567\nGPAX : 3.86',logoY:260},
    {id:'5136d8c0-0004-4000-8000-000000000004',kind:'education',title:'วิทยาลัยเทคนิคสมุทรสงคราม',subtitle:'ระดับประกาศนียบัตรวิชาชีพชั้นสูง',period:'กำลังศึกษา',description:'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล\nGPAX : 3.88 (3 เทอม)',logoY:392}
  ];
  const defaultProject = {id:'5136d8c0-0005-4000-8000-000000000005',kind:'project',title:'Willow',subtitle:'ไดอารี่,บันทึกอารมณ์,ความทรงจำ',period:'',description:'เว็บไซต์บันทึกไดอารี่และอารมณ์ในแต่ละวัน พร้อมสรุปอารมณ์และคลังความทรงจำ',website_url:'https://willowlove.kesug.com/'};
  let selectedSchool = 3, selectedProfileTab = 'facts';
  let db, user, admin = false, profile = {...defaultProfile}, entries = [], ready = false, audio, timer;
  let sound = true;
  try { sound = localStorage.getItem('pastel-sound') !== 'off'; } catch {}
  function icons() { window.lucide?.createIcons(); }
  function toast(message) {
    clearTimeout(timer); $('#toast').textContent = message; $('#toast').hidden = false;
    timer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
  }
  function clickSound() {
    if (!sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      const oscillator = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime;
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(950, now);
      oscillator.frequency.exponentialRampToValueAtTime(470, now + .075);
      gain.gain.setValueAtTime(.055, now); gain.gain.exponentialRampToValueAtTime(.0001, now + .09);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(now + .1);
    } catch {}
  }
  function mediaUrl(path) { return path && db ? db.storage.from(PORTFOLIO_CONFIG.bucket).getPublicUrl(path).data.publicUrl : ''; }
  function portraitUrl() { return profile.media_path ? mediaUrl(profile.media_path) : 'assets/cartoon-portrait.png'; }
  function websiteUrl(value) {
    try { const url=new URL(value); return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password ? url.href : ''; }
    catch { return ''; }
  }
  function status(message = '') {
    if (page === 'welcome' || page === 'contents') return;
    $('#status').textContent = message; $('#status').classList.toggle('visible', !!message);
  }
  function videoMarkup(value, title) {
    const safe=websiteUrl(value);if(!safe)return '';
    const url=new URL(safe),host=url.hostname.toLowerCase(),parts=url.pathname.split('/').filter(Boolean);
    let embed='';
    if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com','youtu.be','www.youtu.be'].includes(host)) {
      const id=host.endsWith('youtu.be')?parts[0]:parts[0]==='watch'?url.searchParams.get('v'):['shorts','embed','live'].includes(parts[0])?parts[1]:null;
      if(/^[A-Za-z0-9_-]{11}$/.test(id||''))embed=`https://www.youtube-nocookie.com/embed/${id}`;
    } else if(['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(host)) {
      const id=host==='player.vimeo.com'&&parts[0]==='video'?parts[1]:parts[0];
      if(/^\d+$/.test(id||'')) {
        const hash=url.searchParams.get('h')||(host!=='player.vimeo.com'?parts[1]:'');
        embed=`https://player.vimeo.com/video/${id}${/^[a-f0-9]+$/i.test(hash||'')?'?h='+hash:''}`;
      }
    }
    const player=embed?`<iframe class="entry-video" src="${escape(embed)}" title="วิดีโอ ${escape(title)}" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`:/\.(mp4|webm|ogv)$/i.test(url.pathname)?`<video class="entry-video" src="${escape(safe)}" controls playsinline preload="metadata" aria-label="วิดีโอ ${escape(title)}"></video>`:'';
    return `<div class="video-detail">${player}<a class="button secondary video-source" href="${escape(safe)}" target="_blank" rel="noopener noreferrer">${icon('external-link')} เปิดวิดีโอต้นฉบับ</a></div>`;
  }
  const footer = `<footer><span>My Portfolio · a little collection of me.</span><div class="color-line" aria-hidden="true"><i></i><i></i><i></i><i></i></div><span>${String(pages.findIndex(x => x[0] === page) + 1).padStart(2,'0')} / 04</span></footer>`;
  $('#app').innerHTML = `<header><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>My Portfolio<span style="color:#b092c6">.</span></a><nav aria-label="หน้าพอร์ตโฟลิโอ">${pages.map((p,i) => `<a href="${p[1]}" ${p[0] === page ? 'aria-current="page"' : ''}><span>0${i+1}</span>${p[2]}</a>`).join('')}</nav><div class="header-tools"><button class="icon-button" id="sound" title="เปิด/ปิดเสียงคลิก" aria-label="เปิด/ปิดเสียงคลิก" aria-pressed="${sound}">${icon(sound ? 'volume-2' : 'volume-x')}</button><button class="icon-button" id="admin" title="ผู้ดูแล" aria-label="ผู้ดูแล">${icon('user-round-cog')}</button></div></header><main id="main"></main>${footer}<dialog id="modal"><div class="dialog-head"><h2 id="modal-title"></h2><button class="icon-button" id="close-modal" aria-label="ปิด" title="ปิด">${icon('x')}</button></div><div class="dialog-body" id="modal-content"></div></dialog><div id="toast" class="toast" role="status" hidden></div>`;
  function empty(kind) {
    const map = {education:['graduation-cap','ยังไม่มีข้อมูลการศึกษา'],competition:['trophy','รางวัลบทต่อไปกำลังรออยู่'],activity:['images','พื้นที่สำหรับเรื่องราวดี ๆ'],certificate:['award','เก็บความภูมิใจไว้ตรงนี้']};
    return `<div class="empty">${icon(map[kind][0])}<h3>${map[kind][1]}</h3><p>${admin ? 'เพิ่มรายการแรกของคุณได้เลย' : 'ยังไม่มีรายการที่เผยแพร่'}</p></div>`;
  }
  const add = (kind, label = 'เพิ่มรายการ') => admin && ready ? `<button class="button secondary" data-add="${kind}">${icon('plus')} ${label}</button>` : '';
  const controls = id => admin ? `<div class="entry-actions"><button class="icon-button" data-edit="${id}" aria-label="แก้ไข" title="แก้ไข">${icon('pencil')}</button><button class="icon-button" data-delete="${id}" aria-label="ลบ" title="ลบ">${icon('trash-2')}</button></div>` : '';
  function cards(kind) {
    const list = entries.filter(x => x.kind === kind);
    if (!list.length) return empty(kind);
    return list.map(x => {
      const url = mediaUrl(x.media_path), pdf = x.media_type === 'application/pdf';
      return `<article data-entry-id="${escape(x.id)}" class="entry ${kind === 'certificate' ? 'certificate' : ''}"><div class="entry-media">${url && !pdf ? `<img src="${escape(url)}" alt="${escape(x.title)}" loading="lazy">` : icon(pdf ? 'file-text' : kind === 'competition' ? 'trophy' : 'images')}</div><div class="entry-body"><div class="entry-meta"><span class="entry-label">${escape(x.subtitle || (kind === 'certificate' ? 'เกียรติบัตร' : kind === 'competition' ? 'การแข่งขัน' : 'กิจกรรม'))}</span><span>${escape(x.period)}</span></div><h3>${escape(x.title)}</h3>${x.description ? `<p>${escape(x.description)}</p>` : ''}${url ? `<a class="open-media" href="${escape(url)}" target="_blank" rel="noopener">${icon('external-link')} ${pdf ? 'เปิดเกียรติบัตร PDF' : 'ดูภาพเต็ม'}</a>` : ''}${controls(x.id)}</div></article>`;
    }).join('');
  }
  function render() {
    const mainScroll=$('#main').scrollTop;
    const name = profile.name || 'Your Portfolio', nickname = profile.nickname || 'ยินดีที่ได้รู้จัก';
    if (page === 'contents') {
      $('#main').innerHTML = `<section class="contents-screen"><a class="contents-back" href="index.html">${icon('arrow-left')} Welcome</a><div class="contents-heading"><span class="eyebrow">MY PORTFOLIO / CONTENTS</span><h1>ทุกเรื่องราวของเรา</h1></div><div class="folder-stage"><div class="folder-paper paper-one"></div><div class="folder-paper paper-two"></div><button class="portfolio-folder" id="folder-toggle" aria-expanded="true" aria-controls="folder-links" title="เปิด/ปิดสารบัญ"><span class="folder-tab"></span><span class="folder-cover"><span class="folder-label">MY PORTFOLIO</span><span class="folder-name">${escape(profile.nickname || 'การ์ตูน')}</span><span class="folder-subtitle">stories, memories & little wins</span><span class="folder-sticker">${icon('heart')}</span></span></button><div class="folder-links" id="folder-links">${pages.map((p,i)=>`<a class="chapter chapter-${i}" href="${p[1]}" style="--chapter-color:var(--${['pink','blue','yellow','purple'][i]});--delay:${i*90}ms"><span class="chapter-icon">${icon(p[3])}</span><span><small>CHAPTER 0${i+1}</small><b>${p[2]}</b></span>${icon('arrow-up-right')}</a>`).join('')}</div></div><div class="contents-colors color-line" aria-hidden="true"><i></i><i></i><i></i><i></i></div></section>`;
    } else if (page === 'profile' || page === 'welcome') {
      $('#main').innerHTML = `<section class="hero"><div class="hero-copy"><div class="eyebrow">A little introduction</div><h1><span class="welcome-word">Welcome</span><span class="portfolio-word">Portfolio.</span></h1><h2>${profile.nickname ? `สวัสดี เราชื่อ${escape(nickname)}` : 'สวัสดี ยินดีที่ได้รู้จัก'}</h2><p>${escape(profile.about || 'ทุกความตั้งใจ ทุกประสบการณ์ และเรื่องราวระหว่างทาง รวบรวมไว้ในพื้นที่เล็ก ๆ แห่งนี้')}</p><a class="button" href="activities.html">เรื่องราวของเรา ${icon('arrow-up-right')}</a>${admin ? '<button class="button secondary" id="edit-profile" style="margin-left:8px">'+icon('pencil')+' แก้ไขประวัติ</button>' : ''}</div><div class="badge-scene"><div class="badge-backdrop"></div><span class="spark" aria-hidden="true">✦</span><div class="flower" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="lanyard" id="lanyard"><div class="strap left"></div><div class="strap right"></div><div class="clip"></div><div class="badge" id="badge" role="button" tabindex="0" aria-label="ขยับป้ายห้อยคอ"><div class="badge-insert"><div class="badge-top"><span>HELLO, THAT’S ME</span>${icon('heart')}</div><div class="badge-photo">${profile.media_path ? `<img src="${escape(mediaUrl(profile.media_path))}" alt="รูปของ${escape(name)}">` : '<span class="photo-monogram">me.</span>'}</div><p class="badge-name">${escape(name)}</p><p class="badge-role">${escape(profile.role || 'MY PERSONAL PORTFOLIO')}</p><div class="barcode" aria-hidden="true"></div><div class="badge-bottom"></div></div></div></div><div class="note-sticker">nice to meet you ♡</div></div><span class="hero-number">01 — PERSONAL PROFILE</span></section><section class="profile-section"><div><div class="section-heading"><span>01 /</span> ABOUT ME</div><h3>พื้นที่เล็ก ๆ ของเรา</h3><p>${escape(profile.role || 'เรื่องราว ความสนใจ และสิ่งที่เราอยากเติบโตไปเป็น')}</p><div class="hobbies">${(profile.hobbies || '').split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span>${escape(s)}</span>`).join('')}</div></div><div><div class="section-heading"><span>02 /</span> PERSONAL DETAILS</div><dl class="facts">${[['ชื่อ–นามสกุล',profile.name],['ชื่อเล่น',profile.nickname],['วันเกิด',profile.birth],['จังหวัด',profile.location],['อีเมล',profile.email],['สถานะ',profile.role]].map(([k,v])=>`<div><dt>${k}</dt><dd>${escape(v || '—')}</dd></div>`).join('')}</dl></div></section><div class="page-main" style="padding-top:0;padding-bottom:0;min-height:0"><div id="status" class="status" role="status"></div></div>`;
    } else {
      const text = {education:['Learning & growing','เส้นทางการเรียนรู้และการเติบโตของเรา'],competition:['Little achievements','ความตั้งใจที่ได้ลอง และความภูมิใจระหว่างทาง'],activity:['Moments & memories','ประสบการณ์นอกห้องเรียนและสิ่งที่ได้ลงมือทำ']}[page];
      $('#main').innerHTML = `<section class="page-main" data-kind="${page}"><div class="page-heading"><div><div class="page-label"><b>0${pages.findIndex(x=>x[0]===page)+1}</b>${text[0]}</div><h1>${pages.find(x=>x[0]===page)[2]}</h1><p>${text[1]}</p></div>${add(page)}</div><div id="status" class="status" role="status"></div>${page === 'education' ? `<div class="timeline">${entries.filter(x=>x.kind==='education').map(x=>`<article class="school"><div class="school-year">${escape(x.period)}</div><div><span class="entry-label">${escape(x.subtitle)}</span><h3>${escape(x.title)}</h3><p>${escape(x.description)}</p>${controls(x.id)}</div></article>`).join('') || empty('education')}</div>` : `<div class="content-grid">${cards(page)}</div>`}${page === 'activity' ? `<div class="cert-heading"><h2>เกียรติบัตร</h2>${add('certificate','เพิ่มเกียรติบัตร')}</div><div class="content-grid">${cards('certificate')}</div>` : ''}</section>`;
    }
    if (page === 'welcome') {
      $('.profile-section').remove();
      $('.badge-photo').innerHTML = `<img src="${escape(portraitUrl())}" alt="รูปของ${escape(name)}">`;
      $('.hero-number').textContent = 'WELCOME TO MY PORTFOLIO';
      const cta = $('.hero-copy a.button');
      cta.href = 'contents.html'; cta.innerHTML = `ชมผลงาน ${icon('arrow-up-right')}`;
      $('.hero').appendChild(cta);
      cta.classList.add('welcome-cta');
      $('#edit-profile')?.remove();
      $('footer > span:last-child').textContent = 'WELCOME';
    }
    if (page === 'profile') {
      const facts = [['ชื่อ–นามสกุล',profile.name],['ชื่อเล่น',profile.nickname],['วันเกิด',profile.birth],['อายุ',profile.age],['เชื้อชาติ–สัญชาติ',profile.nationality],['ศาสนา',profile.religion],['ที่อยู่ปัจจุบัน',profile.location]];
      $('#main').innerHTML = `<section class="page-main personal-page"><div class="page-heading"><div><div class="page-label"><b>01</b> A little about me</div><h1>ประวัติส่วนตัว</h1><p>สวัสดี เราชื่อ${escape(profile.nickname || '')}</p></div>${admin && ready ? `<button class="button secondary" id="edit-profile">${icon('pencil')} แก้ไขประวัติ</button>`:''}</div><div class="personal-layout"><div><h2>ข้อมูลส่วนตัว</h2><dl class="personal-facts">${facts.map(([label,value])=>`<div><dt>${label}</dt><dd>${escape(value || '—')}</dd></div>`).join('')}</dl><h2>งานอดิเรก</h2><div class="hobbies">${(profile.hobbies||'').split(',').filter(Boolean).map(x=>`<span>${escape(x.trim())}</span>`).join('')}</div></div><div class="personal-side"><h2>ช่องทางการติดต่อ</h2><ul class="contact-list"><li>${icon('facebook')}<span>${escape(profile.facebook || '—')}</span></li><li>${icon('mail')}<a href="mailto:${escape(profile.email)}">${escape(profile.email || '—')}</a></li><li>${icon('instagram')}<span>${escape(profile.instagram || '—')}</span></li><li>${icon('phone')}<a href="tel:${escape((profile.phone||'').replace(/[^+0-9]/g,''))}">${escape(profile.phone || '—')}</a></li></ul><h2>ความสามารถ</h2><ul class="skill-list">${(profile.skills||'').split(',').filter(Boolean).map(x=>`<li>${escape(x.trim())}</li>`).join('')}</ul><div class="software-list">${(profile.software||'').split(',').filter(Boolean).map((x,i)=>`<span class="software-item software-${i%4}">${escape(x.trim())}</span>`).join('')}</div></div></div><div id="status" class="status" role="status"></div></section>`;
    }
    if (page === 'profile') {
      $('.personal-layout > div').insertAdjacentHTML('afterbegin', `<div class="personal-portrait"><img src="${escape(portraitUrl())}" alt="รูปของ${escape(name)}"><span>${escape(profile.nickname || '')}</span></div>`);
    }
    $('.hero-copy h2')?.remove();
    if (page === 'profile') {
      $('.page-heading p')?.remove();
      enhanceProfile();
      addProfileProjects();
    }
    if (page === 'education') {
      const timeline = $('.timeline');
      timeline.outerHTML = `<div class="education-journey" id="education-journey"></div>`;
      renderEducation();
    }
    if (page === 'activity' || page === 'competition') enhanceCollection();
    document.querySelectorAll('.page-main').forEach(x => x.classList.add('chapter-page'));
    updateNavigation();
    icons();
    $('#admin').title = admin ? 'บัญชีผู้ดูแล' : 'เข้าสู่ระบบผู้ดูแล';
    window.PORTFOLIO_MOTION?.init();
    $('#main').scrollTop=mainScroll;
  }
  function schools() {
    const stored = entries.filter(x => x.kind === 'education');
    if (!stored.length) return defaultEducation;
    return [...stored].sort((a,b) => {
      const year = x => /กำลัง|ปัจจุบัน/.test(x.period) ? 9999 : Number(x.period.match(/\d{4}/)?.[0] || 0);
      return year(a) - year(b);
    });
  }
  function schoolLogo(school) {
    const uploaded=mediaUrl(school.media_path);
    if(uploaded&&school.media_type?.startsWith('image/'))return `<img class="school-logo-image" src="${escape(uploaded)}" alt="โลโก้${escape(school.title)}" width="100" height="100">`;
    const reference = defaultEducation.find(x => x.id === school.id) || defaultEducation.find(x => x.title === school.title);
    return reference ? `<span class="school-logo" role="img" aria-label="โลโก้${escape(school.title)}" style="--logo-y:-${reference.logoY}px"></span>` : `<span class="school-logo-placeholder">${icon('graduation-cap')}</span>`;
  }
  function renderEducation() {
    const list = schools(); selectedSchool = Math.min(selectedSchool,list.length-1);
    const school = list[selectedSchool];
    const grade = school.description?.match(/GPAX\s*:\s*([^\n]+)/)?.[1];
    const detail = (school.description || '').split('\n').filter(x => !x.includes('GPAX')).join('\n');
    $('#education-journey').innerHTML = `<div class="school-stops" role="tablist" aria-label="ระดับการศึกษา">${list.map((s,i)=>`<button class="school-stop" id="school-tab-${i}" role="tab" aria-selected="${i===selectedSchool}" aria-controls="school-panel" tabindex="${i===selectedSchool?0:-1}" data-school="${i}" style="--stop-color:var(--${['pink','blue','yellow','purple'][i%4]})"><span class="stop-number">0${i+1}</span><span><small>${escape(s.period)}</small><b>${escape(s.subtitle)}</b></span>${icon('chevron-right')}</button>`).join('')}</div><article class="school-detail" id="school-panel" role="tabpanel" aria-labelledby="school-tab-${selectedSchool}" style="--school-color:var(--${['pink','blue','yellow','purple'][selectedSchool%4]})"><div class="school-detail-top"><span class="school-detail-label">${escape(school.subtitle)}</span><span class="school-year-tag">${icon(school.period==='กำลังศึกษา'?'book-open':'check')} ${escape(school.period)}</span></div><div class="school-identity">${schoolLogo(school)}<h2>${escape(school.title)}</h2></div><p>${escape(detail)}</p>${grade?`<div class="grade-stamp"><small>GPAX</small><strong>${escape(grade.split(' ')[0])}</strong><span>${escape(grade.replace(/^\S+\s*/,''))}</span></div>`:''}<div class="school-detail-bottom"><span>0${selectedSchool+1} / 0${list.length}</span><div>${entries.some(x=>x.id===school.id)?controls(school.id):''}<button class="icon-button" data-school="${(selectedSchool+list.length-1)%list.length}" title="ระดับก่อนหน้า" aria-label="ระดับก่อนหน้า">${icon('arrow-left')}</button><button class="icon-button" data-school="${(selectedSchool+1)%list.length}" title="ระดับถัดไป" aria-label="ระดับถัดไป">${icon('arrow-right')}</button></div></div></article>${admin&&ready&&!entries.some(x=>x.kind==='education')?`<button class="button secondary save-education" id="save-education">${icon('cloud-upload')} บันทึกประวัติการศึกษา</button>`:''}`;
    icons();
  }
  function enhanceProfile() {
    const facts = $('.personal-facts').outerHTML, hobbies = $('.personal-layout .hobbies').outerHTML;
    const contact = $('.contact-list').outerHTML, skills = $('.skill-list').outerHTML, software = $('.software-list').outerHTML;
    $('.personal-layout').outerHTML = `<div class="profile-experience"><div class="profile-photo-column"><button class="portrait-flip" id="portrait-flip" aria-pressed="false" title="พลิกรูป" aria-label="พลิกรูป"><span class="portrait-flip-inner"><span class="portrait-front personal-portrait"><img src="${escape(portraitUrl())}" alt="รูปของ${escape(profile.name)}"><span>${escape(profile.nickname)}</span><i class="portrait-turn">${icon('rotate-cw')}</i></span><span class="portrait-back"><small>PERSONAL PORTFOLIO</small><strong>${escape(profile.nickname)}</strong><span>${escape(profile.name)}</span><span>${escape(profile.birth)}</span>${icon('heart')}</span></span></button><a class="button secondary profile-next" href="education.html">การศึกษา ${icon('arrow-right')}</a></div><div class="profile-notes"><div class="profile-tabs" role="tablist" aria-label="ข้อมูลประวัติ">${[['facts','ข้อมูลส่วนตัว','user-round'],['contact','ติดต่อ','mail'],['skills','ความสามารถ','sparkles']].map(([id,label,ico])=>`<button role="tab" id="profile-tab-${id}" aria-controls="profile-panel-${id}" aria-selected="${id===selectedProfileTab}" tabindex="${id===selectedProfileTab?0:-1}" data-profile-tab="${id}">${icon(ico)} ${label}</button>`).join('')}</div><section class="profile-note" role="tabpanel" id="profile-panel-facts" aria-labelledby="profile-tab-facts" ${selectedProfileTab!=='facts'?'hidden':''}><h2>ข้อมูลส่วนตัว</h2>${facts}<h2>งานอดิเรก</h2>${hobbies}</section><section class="profile-note" role="tabpanel" id="profile-panel-contact" aria-labelledby="profile-tab-contact" ${selectedProfileTab!=='contact'?'hidden':''}><h2>ช่องทางการติดต่อ</h2>${contact}</section><section class="profile-note" role="tabpanel" id="profile-panel-skills" aria-labelledby="profile-tab-skills" ${selectedProfileTab!=='skills'?'hidden':''}><h2>ความสามารถ</h2>${skills}<h2>โปรแกรมที่ใช้</h2>${software}</section></div></div>`;
  }
  function selectProfileTab(id) {
    selectedProfileTab = id;
    document.querySelectorAll('[data-profile-tab]').forEach(x=>{const selected=x.dataset.profileTab===id;x.setAttribute('aria-selected',String(selected));x.tabIndex=selected?0:-1;});
    document.querySelectorAll('.profile-note').forEach(x=>{x.hidden=x.id!==`profile-panel-${id}`;});
  }
  function addProfileProjects() {
    $('.profile-tabs').insertAdjacentHTML('beforeend', `<button role="tab" id="profile-tab-projects" aria-controls="profile-panel-projects" aria-selected="${selectedProfileTab==='projects'}" tabindex="${selectedProfileTab==='projects'?0:-1}" data-profile-tab="projects">${icon('folder-heart')} โปรเจกต์</button>`);
    const list=ready?entries.filter(x=>x.kind==='project'):[defaultProject];
    const projects=list.map(x=>{
      const url=websiteUrl(x.website_url);
      const preview=mediaUrl(x.media_path)||(x.id===defaultProject.id&&url===defaultProject.website_url?'assets/willow-preview.png':'');
      const image=preview?`<img src="${escape(preview)}" alt="ภาพตัวอย่างโปรเจกต์ ${escape(x.title)}" width="1280" height="800">`:icon('folder-heart');
      return `<article class="profile-project" data-entry-id="${escape(x.id)}">${url?`<a class="project-preview" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="เปิดเว็บไซต์ ${escape(x.title)} ในแท็บใหม่">${image}</a>`:`<div class="project-preview">${image}</div>`}<div class="project-heading"><h3>${escape(x.title)}</h3><span>${escape(x.period||'WEBSITE')}</span></div>${x.description?`<p>${escape(x.description)}</p>`:''}<div class="project-tags">${(x.subtitle||'').split(',').map(tag=>tag.trim()).filter(Boolean).map(tag=>`<span>${escape(tag)}</span>`).join('')}</div><div class="project-actions">${url?`<a class="button secondary project-open" href="${escape(url)}" target="_blank" rel="noopener noreferrer">เปิดเว็บไซต์ ${icon('external-link')}</a>`:''}${ready?controls(x.id):''}</div></article>`;
    }).join('');
    $('.profile-notes').insertAdjacentHTML('beforeend', `<section class="profile-note" role="tabpanel" id="profile-panel-projects" aria-labelledby="profile-tab-projects" ${selectedProfileTab!=='projects'?'hidden':''}><div class="profile-project-heading"><h2>โปรเจกต์</h2>${add('project','เพิ่มโปรเจกต์')}</div>${projects||'<p class="project-empty">ยังไม่มีโปรเจกต์ที่เผยแพร่</p>'}</section>`);
    list.filter(x=>websiteUrl(x.video_url)).forEach(x=>{
      const card=[...document.querySelectorAll('.profile-project')].find(card=>card.dataset.entryId===x.id);
      card?.querySelector('.project-actions').insertAdjacentHTML('beforeend',`<button class="entry-view" data-view="${escape(x.id)}">${icon('play')} ดูวิดีโอ</button>`);
    });
  }
  function enhanceCollection() {
    const section = $('.page-main');
    const kinds = page==='activity'?['activity','certificate']:['competition'];
    const filters = [...new Set(entries.filter(x=>kinds.includes(x.kind)).map(x=>x.subtitle).filter(Boolean))];
    section.querySelector('.page-heading').insertAdjacentHTML('afterend',`<div class="collection-tools"><div class="collection-tabs" role="group" aria-label="ประเภทผลงาน"><button aria-pressed="true" data-filter="">ทั้งหมด</button>${filters.map(x=>`<button aria-pressed="false" data-filter="${escape(x)}">${escape(x)}</button>`).join('')}</div><label class="collection-search">${icon('search')}<input id="collection-search" type="search" aria-label="ค้นหาผลงาน" placeholder="ค้นหาผลงาน"></label></div>`);
    section.querySelectorAll('.entry').forEach((element,i)=>{
      element.classList.add('interactive-entry');element.style.setProperty('--entry-order',String(i%6));
      const entry = entries.find(x=>x.id===element.dataset.entryId);
      if(!entry) return;
      if(websiteUrl(entry.video_url)&&!entry.media_path)element.querySelector('.entry-media').innerHTML=icon('video');
      element.dataset.subtitle = entry.subtitle; element.dataset.search = `${entry.title} ${entry.description} ${entry.subtitle}`.toLocaleLowerCase();
      element.querySelector('.entry-body').insertAdjacentHTML('beforeend',`<button class="entry-view" data-view="${escape(entry.id)}">${websiteUrl(entry.video_url)?'ดูวิดีโอและรายละเอียด':'ดูรายละเอียด'} ${icon('arrow-up-right')}</button>`);
    });
    section.insertAdjacentHTML('beforeend','<p id="no-search-results" class="search-empty" hidden>ไม่พบผลงานที่ค้นหา</p>');
    if(page==='competition') {
      const list=entries.filter(x=>x.kind==='competition');
      section.querySelector('.collection-tools').insertAdjacentHTML('beforebegin',`<section class="competition-summary" aria-label="สรุปการแข่งขัน"><div class="competition-summary-title"><h2>เส้นทางการแข่งขัน</h2><button class="competition-total" data-level="" aria-pressed="true">ทั้งหมด <strong>${list.length}</strong> รายการ</button></div><div class="competition-levels" role="group" aria-label="กรองตามระดับการแข่งขัน">${competitionLevels.map(([key,label,ico,color])=>`<button class="competition-level" data-level="${key}" aria-pressed="false" style="--level-color:var(--${color})">${icon(ico)}<span>ระดับ${label}</span><strong>${list.filter(x=>x.competition_level===key).length}</strong></button>`).join('')}</div>${list.some(x=>!competitionLevels.some(level=>level[0]===x.competition_level))?`<button class="competition-unclassified" data-level="unclassified" aria-pressed="false">ยังไม่ระบุระดับ · ${list.filter(x=>!competitionLevels.some(level=>level[0]===x.competition_level)).length} รายการ</button>`:''}</section>`);
      section.querySelectorAll('.interactive-entry').forEach(element=>{
        const entry=list.find(x=>x.id===element.dataset.entryId);
        element.dataset.competitionLevel=competitionLevels.some(x=>x[0]===entry?.competition_level)?entry.competition_level:'unclassified';
        element.dataset.search+=` ${levelLabel(entry?.competition_level)}`;
        element.querySelector('.entry-body h3').insertAdjacentHTML('beforebegin',`<span class="competition-level-label">${escape(levelLabel(entry?.competition_level))}</span>`);
      });
    }
  }
  function filterCollection() {
    const filter = $('.collection-tabs [aria-pressed=true]')?.dataset.filter || '';
    const search = ($('#collection-search')?.value || '').trim().toLocaleLowerCase();let visible=0;
    const level=$('[data-level][aria-pressed=true]')?.dataset.level||'';
    document.querySelectorAll('.interactive-entry').forEach(x=>{x.hidden=!!((filter&&x.dataset.subtitle!==filter)||(search&&!x.dataset.search.includes(search))||(level&&x.dataset.competitionLevel!==level));if(!x.hidden)visible++;});
    $('#no-search-results').hidden=visible>0||(!filter&&!search&&!level);
  }
  function viewEntry(id) {
    const entry=entries.find(x=>x.id===id);if(!entry)return;
    const url=mediaUrl(entry.media_path),pdf=entry.media_type==='application/pdf';
    showModal(entry.title,`${url&&!pdf?`<img class="detail-image" src="${escape(url)}" alt="${escape(entry.title)}">`:''}<p class="detail-meta">${escape(entry.subtitle)} · ${escape(entry.period)}</p><p class="detail-description">${escape(entry.description)}</p>${url?`<a class="button secondary" href="${escape(url)}" target="_blank" rel="noopener">${icon(pdf?'file-text':'external-link')} ${pdf?'เปิดเกียรติบัตร PDF':'ดูภาพเต็ม'}</a>`:''}`);
    $('#modal-content').insertAdjacentHTML('afterbegin',videoMarkup(entry.video_url,entry.title));icons();
    if(entry.kind==='competition')$('#modal-content').insertAdjacentHTML('afterbegin',`<p class="competition-level-label">${escape(levelLabel(entry.competition_level))}</p>`);
  }
  function updateNavigation() {
    document.body.classList.toggle('entrance-page', page === 'welcome' || page === 'contents');
    if (page === 'welcome' || page === 'contents') return;
    const current = pages.find(p => p[0] === page);
    $('nav').className = 'dropdown-nav';
    $('nav').innerHTML = `<a class="contents-link" href="contents.html" title="สารบัญ" aria-label="สารบัญ">${icon('folder-open')}</a><div class="page-dropdown"><button class="page-select" id="page-select" aria-expanded="false" aria-controls="page-options">${icon(current[3])}<span>${current[2]}</span>${icon('chevron-down')}</button><div class="page-options" id="page-options" hidden>${pages.map((p,i)=>`<a href="${p[1]}" ${p[0] === page ? 'aria-current="page"' : ''}>${icon(p[3])}<span>${p[2]}</span><small>0${i+1}</small></a>`).join('')}<a href="contents.html">${icon('folder-open')}<span>สารบัญ</span></a><a href="index.html">${icon('house')}<span>Welcome</span></a></div></div>`;
  }
  function closeDropdown(returnFocus = false) {
    const toggle = $('#page-select');
    if (!toggle) return;
    $('#page-options').hidden = true; toggle.setAttribute('aria-expanded','false');
    if (returnFocus) toggle.focus();
  }
  function showModal(title, html) {
    $('#modal-title').textContent = title; $('#modal-content').innerHTML = html;
    if (!$('#modal').open) $('#modal').showModal(); icons();
  }
  const field = (label,name,value='',type='text',required=false) => `<label>${label}<input name="${name}" type="${type}" value="${escape(value)}" ${required ? 'required' : ''} maxlength="500"></label>`;
  const errorMarkup = '<p class="form-error" id="form-error" role="alert"></p>';
  const actions = '<div class="dialog-actions"><button type="button" class="button secondary" data-close>ยกเลิก</button><button class="button" type="submit">บันทึก '+icon('check')+'</button></div>';
  function errorText(error) {
    if(error?.code==='PGRST204'&&error.message?.includes('competition_level'))return 'กรุณารันไฟล์ supabase-competition-levels.sql ใน SQL Editor ก่อนบันทึกระดับการแข่งขัน';
    if(error?.code==='PGRST204'&&error.message?.includes('video_url'))return 'กรุณารันไฟล์ supabase-video-links.sql ใน SQL Editor ก่อนบันทึกลิงก์วิดีโอ';
    if (error?.code === 'PGRST205' || error?.code === '42P01') return 'ยังไม่ได้ตั้งค่าตารางข้อมูล กรุณารันไฟล์ supabase-setup.sql ใน SQL Editor';
    return error?.message || 'ไม่สามารถเชื่อมต่อได้ กรุณาลองอีกครั้ง';
  }
  async function load() {
    status('กำลังโหลดข้อมูล…');
    try {
      const results = await Promise.all([db.from('pastel_portfolio_profile').select('*').eq('id',1).maybeSingle(),db.from('pastel_portfolio_entries').select('*').order('created_at',{ascending:false})]);
      for (const result of results) if(result.error) throw result.error;
      const stored = results[0].data;
      profile = stored?.name ? {...defaultProfile,...stored} : {...defaultProfile,...Object.fromEntries(Object.entries(stored || {}).filter(([,value])=>value !== '' && value !== null))};
      entries = results[1].data || []; ready = true; render();
    } catch (error) { ready = false; render(); status(errorText(error)); }
  }
  async function membership() {
    const {data,error} = await db.auth.getUser();
    user = error ? null : data.user; admin = false;
    if (user) {
      const result = await db.from('pastel_portfolio_admins').select('user_id').eq('user_id',user.id).maybeSingle();
      admin = !result.error && !!result.data;
    }
  }
  function login() {
    if (!db) { toast('ยังโหลด Supabase ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วเปิดหน้าใหม่'); return; }
    if (user) {
      showModal('บัญชีผู้ดูแล', `<p>${escape(user.email)}</p><p>${admin ? 'เข้าสู่ระบบผู้ดูแลแล้ว' : 'บัญชีนี้ยังไม่มีสิทธิ์ผู้ดูแล'}</p><p class="file-help">${admin ? '' : 'เพิ่ม UUID ของบัญชีนี้ในตาราง pastel_portfolio_admins ผ่าน SQL Editor'}</p><div class="dialog-actions"><button class="button secondary" id="logout">ออกจากระบบ</button></div>`);
      $('#logout').onclick = async () => { const {error} = await db.auth.signOut(); if(error) {toast(errorText(error));return;} user = null;admin = false;$('#modal').close();await load(); };
      return;
    }
    showModal('เข้าสู่ระบบผู้ดูแล', `<form class="form-grid" id="login-form">${field('อีเมล','email','','email',true)}<label>รหัสผ่าน<input name="password" type="password" required autocomplete="current-password"></label>${errorMarkup}<div class="dialog-actions"><button class="button" type="submit">เข้าสู่ระบบ ${icon('log-in')}</button></div></form>`);
    $('#login-form').onsubmit = async e => {
      e.preventDefault(); const button=e.target.querySelector('[type=submit]');button.disabled=true;
      try {
        const values = new FormData(e.target);
        const {error} = await db.auth.signInWithPassword({email:values.get('email'),password:values.get('password')});
        if(error) throw error;
        await membership();
        if(!admin) throw new Error('บัญชีนี้ยังไม่มีสิทธิ์ผู้ดูแล กรุณาเพิ่ม UUID ใน pastel_portfolio_admins');
        $('#modal').close(); await load(); toast('เข้าสู่ระบบแล้ว');
      } catch(error) { $('#form-error').textContent=errorText(error); } finally {button.disabled=false;}
    };
  }
  async function upload(file, photosOnly) {
    if (!file?.size) return null;
    const types=['image/jpeg','image/png','image/webp',...(photosOnly?[]:['application/pdf'])];
    if(!types.includes(file.type)) throw new Error('รองรับ JPG, PNG, WebP'+(photosOnly?'':' และ PDF')+' เท่านั้น');
    if(file.size>10*1024*1024) throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 10 MB');
    const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'}[file.type];
    const path=`${user.id}/${crypto.randomUUID()}.${extension}`;
    const {error} = await db.storage.from(PORTFOLIO_CONFIG.bucket).upload(path,file,{contentType:file.type,upsert:false});
    if(error) throw error; return {media_path:path,media_type:file.type};
  }
  async function removeMedia(path) {
    if (!path) return true;
    try { const {error}=await db.storage.from(PORTFOLIO_CONFIG.bucket).remove([path]); if(error) throw error; return true; }
    catch { toast('ข้อมูลบันทึกแล้ว แต่ลบไฟล์เก่าไม่สำเร็จ ไฟล์ยังอยู่ใน Storage'); return false; }
  }
  function editor(kind, id) {
    if(!admin || !ready) return;
    const isProfile=kind==='profile', existing=isProfile?profile:entries.find(x=>x.id===id)||{};
    const label={profile:'ประวัติส่วนตัว',education:'การศึกษา',competition:'การแข่งขัน',activity:'กิจกรรม',certificate:'เกียรติบัตร',project:'โปรเจกต์'}[kind];
    const inputs=isProfile ? `${field('ชื่อ–นามสกุล','name',existing.name)}${field('ชื่อเล่น','nickname',existing.nickname)}${field('สถานะ / ระดับชั้น','role',existing.role)}${field('วันเกิด','birth',existing.birth)}${field('จังหวัด','location',existing.location)}${field('อีเมลติดต่อ','email',existing.email,'email')}<label>แนะนำตัว<textarea name="about" maxlength="3000">${escape(existing.about)}</textarea></label>${field('ความสนใจ (คั่นด้วยเครื่องหมายจุลภาค)','hobbies',existing.hobbies)}` : `${field(kind==='education'?'ชื่อโรงเรียน':'ชื่อรายการ','title',existing.title,'text',true)}${field(kind==='education'?'ระดับชั้น / แผนการเรียน':kind==='competition'?'รางวัล / ระดับการแข่งขัน':'ประเภท / หน่วยงาน','subtitle',existing.subtitle)}${field('ปี / ช่วงเวลา','period',existing.period)}<label>รายละเอียด<textarea name="description" maxlength="5000">${escape(existing.description)}</textarea></label>`;
    showModal(`${id || isProfile?'แก้ไข':'เพิ่ม'}${label}`,`<form id="entry-form" class="form-grid">${inputs}<label>${isProfile?'รูปบนป้ายห้อยคอ':kind==='certificate'?'รูปเกียรติบัตร / PDF':kind==='education'?'โลโก้โรงเรียน':'รูปภาพ'}<input name="file" type="file" accept="image/jpeg,image/png,image/webp${kind==='certificate'?',application/pdf':''}"></label><span class="file-help">สูงสุด 10 MB${existing.media_path?' · ไม่เลือกไฟล์เพื่อใช้ไฟล์เดิม':''}</span>${existing.media_path?`<label style="display:flex;align-items:center"><input style="width:auto" type="checkbox" name="remove-file">${kind==='education'?'ลบโลโก้ที่อัปโหลด':'ลบไฟล์เดิม'}</label>`:''}${errorMarkup}${actions}</form>`);
    if(kind==='education') {
      $('#entry-form [name=file]').parentElement.insertAdjacentHTML('afterend',`<div class="school-logo-upload-preview" aria-live="polite">${schoolLogo(existing)}</div>`);
      $('#entry-form [name=file]').onchange=e=>{
        const file=e.target.files[0];
        if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)) {
          $('.school-logo-upload-preview').innerHTML=schoolLogo(existing);return;
        }
        const preview=URL.createObjectURL(file);
        $('.school-logo-upload-preview').innerHTML=`<img class="school-logo-image" src="${escape(preview)}" alt="ตัวอย่างโลโก้ที่เลือก" width="100" height="100">`;
        $('#modal').addEventListener('close',()=>URL.revokeObjectURL(preview),{once:true});
      };
    }
    if (kind==='project') {
      $('#entry-form [name=title]').parentElement.firstChild.textContent='ชื่อโปรเจกต์';
      $('#entry-form [name=subtitle]').parentElement.firstChild.textContent='แท็ก (คั่นด้วยจุลภาค)';
      $('#entry-form [name=file]').parentElement.firstChild.textContent='ภาพตัวอย่างเว็บไซต์';
      $('#entry-form [name=period]').parentElement.insertAdjacentHTML('beforebegin',field('ลิงก์เว็บไซต์','website_url',existing.website_url,'url',true));
    }
    if(['project','competition','activity','certificate'].includes(kind)) {
      $('#entry-form .dialog-actions').insertAdjacentHTML('beforebegin',field('ลิงก์วิดีโอ','video_url',existing.video_url,'url'));
    }
    if(kind==='competition') {
      const awards=existing.subtitle&&!competitionAwards.includes(existing.subtitle)?[...competitionAwards,existing.subtitle]:competitionAwards;
      $('#entry-form [name=subtitle]').parentElement.innerHTML=`รางวัล<select name="subtitle"><option value="">ยังไม่ระบุรางวัล</option>${awards.map(award=>`<option value="${escape(award)}" ${existing.subtitle===award?'selected':''}>${escape(award)}</option>`).join('')}</select>`;
      $('#entry-form [name=period]').parentElement.insertAdjacentHTML('beforebegin',`<label>ระดับการแข่งขัน<select name="competition_level"><option value="">ยังไม่ระบุระดับ</option>${competitionLevels.map(([key,label])=>`<option value="${key}" ${existing.competition_level===key?'selected':''}>ระดับ${label}</option>`).join('')}</select></label>`);
    }
    if (isProfile) {
      const extraFields = [['อายุ','age'],['เชื้อชาติ–สัญชาติ','nationality'],['ศาสนา','religion'],['โทรศัพท์','phone'],['Facebook','facebook'],['Instagram','instagram'],['ความสามารถ (คั่นด้วยจุลภาค)','skills'],['โปรแกรมที่ใช้ (คั่นด้วยจุลภาค)','software']];
      $('#entry-form .dialog-actions').insertAdjacentHTML('beforebegin',extraFields.map(([label,key])=>field(label,key,existing[key])).join(''));
    }
    $('#entry-form').onsubmit=async e=>{
      e.preventDefault();const button=e.target.querySelector('[type=submit]');button.disabled=true;let uploaded=null, saved=false;
      try {
        const data=new FormData(e.target), fields=isProfile?['name','nickname','role','birth','location','email','about','hobbies','age','nationality','religion','phone','facebook','instagram','skills','software']:['title','subtitle','period','description'];
        const payload=Object.fromEntries(fields.map(key=>[key,String(data.get(key)||'').trim()]));
        if(!isProfile && !payload.title) throw new Error('กรุณาใส่ชื่อรายการ');
        if(kind==='competition') {
          if(payload.subtitle&&!competitionAwards.includes(payload.subtitle)&&payload.subtitle!==existing.subtitle)throw new Error('กรุณาเลือกรางวัลจากรายการ');
          const value=String(data.get('competition_level')||'');
          if(value&&!competitionLevels.some(x=>x[0]===value))throw new Error('กรุณาเลือกระดับการแข่งขันที่ถูกต้อง');
          if(value||existing.competition_level)payload.competition_level=value;
        }
        if(['project','competition','activity','certificate'].includes(kind)) {
          const value=String(data.get('video_url')||'').trim();
          if(value&&!websiteUrl(value))throw new Error('กรุณาใส่ลิงก์วิดีโอ http:// หรือ https:// ที่ถูกต้อง');
          if(value||existing.video_url)payload.video_url=value?websiteUrl(value):'';
        }
        if(kind==='project') {
          payload.website_url=websiteUrl(String(data.get('website_url')||'').trim());
          if(!payload.website_url) throw new Error('กรุณาใส่ลิงก์เว็บไซต์ http:// หรือ https:// ที่ถูกต้อง');
        }
        uploaded=await upload(data.get('file'),kind!=='certificate');
        if(uploaded) Object.assign(payload,uploaded);
        else if(data.get('remove-file')) Object.assign(payload,{media_path:null,media_type:null});
        if(isProfile) payload.id=1;else payload.kind=kind;
        const table=isProfile?'pastel_portfolio_profile':'pastel_portfolio_entries';
        const query=isProfile?db.from(table).upsert(payload):id?db.from(table).update(payload).eq('id',id):db.from(table).insert(payload);
        const {error,data:rows}=await query.select();if(error) throw error;
        if(!rows?.length) throw new Error('ไม่สามารถบันทึกได้ กรุณาตรวจสอบสิทธิ์ผู้ดูแล');
        saved=true;
        $('#modal').close();await load();toast('บันทึกเรียบร้อย');
        if(existing.media_path&&(uploaded||data.get('remove-file'))) await removeMedia(existing.media_path);
      } catch(error) {
        if(uploaded&&!saved) await removeMedia(uploaded.media_path);
        const target=$('#form-error');if(target) target.textContent=errorText(error);else toast(errorText(error));
      } finally {button.disabled=false;}
    };
  }
  function deleteEntry(id) {
    const entry=entries.find(x=>x.id===id);if(!entry||!admin) return;
    showModal('ลบรายการ',`<p>ต้องการลบ “${escape(entry.title)}” ใช่ไหม?</p>${errorMarkup}<div class="dialog-actions"><button class="button secondary" data-close>ยกเลิก</button><button class="button" id="confirm-delete">${icon('trash-2')} ลบรายการ</button></div>`);
    $('#confirm-delete').onclick=async e=>{
      const button=e.currentTarget;button.disabled=true;
      try {
        const {error,data}=await db.from('pastel_portfolio_entries').delete().eq('id',id).select('id');if(error) throw error;
        if(!data?.length) throw new Error('ลบไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ผู้ดูแล');
        $('#modal').close();await load();toast('ลบรายการแล้ว');await removeMedia(entry.media_path);
      } catch(error){$('#form-error').textContent=errorText(error);}finally{button.disabled=false;}
    };
  }
  function kick() {
    const lanyard=$('#lanyard');if(!lanyard)return;
    lanyard.classList.remove('swing-kick');void lanyard.offsetWidth;lanyard.classList.add('swing-kick');
  }
  document.addEventListener('click',e=>{
    if (!e.target.closest('.page-dropdown')) closeDropdown();
    const target=e.target.closest('button,a,[role=button]');if(!target)return;
    if(target.id==='sound'){
      sound=!sound;try{localStorage.setItem('pastel-sound',sound?'on':'off');}catch{}
      target.setAttribute('aria-pressed',String(sound));target.innerHTML=icon(sound?'volume-2':'volume-x');icons();
    }
    clickSound();
    if(target.hasAttribute('data-school')) {selectedSchool=Number(target.dataset.school);renderEducation();}
    if(target.dataset.profileTab) selectProfileTab(target.dataset.profileTab);
    if(target.id==='portrait-flip') target.setAttribute('aria-pressed',String(target.getAttribute('aria-pressed')!=='true'));
    if(target.hasAttribute('data-filter')) {
      document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===target)));filterCollection();
    }
    if(target.hasAttribute('data-level')) {
      document.querySelectorAll('[data-level]').forEach(x=>x.setAttribute('aria-pressed',String(x===target)));filterCollection();
    }
    if(target.dataset.view) viewEntry(target.dataset.view);
    if(target.id==='save-education' && admin && ready) {
      target.disabled=true;
      (async()=>{
        try {
          const rows=defaultEducation.map(({logoY,...row})=>row);
          const {error}=await db.from('pastel_portfolio_entries').insert(rows);if(error)throw error;
          await load();toast('บันทึกประวัติการศึกษาแล้ว');
        } catch(error) {toast(errorText(error));target.disabled=false;}
      })();
    }
    if (target.id === 'page-select') {
      const open = target.getAttribute('aria-expanded') !== 'true';
      target.setAttribute('aria-expanded',String(open)); $('#page-options').hidden = !open;
    }
    if (target.id === 'folder-toggle') {
      const open = target.getAttribute('aria-expanded') !== 'true';
      target.setAttribute('aria-expanded',String(open)); $('#folder-links').hidden = !open;
    }
    if(target.id==='admin')login();
    if(target.id==='close-modal'||target.hasAttribute('data-close'))$('#modal').close();
    if(target.id==='edit-profile')editor('profile');
    if(target.dataset.add)editor(target.dataset.add);
    if(target.dataset.edit){const item=entries.find(x=>x.id===target.dataset.edit);if(item)editor(item.kind,item.id);}
    if(target.dataset.delete)deleteEntry(target.dataset.delete);
    if(target.id==='badge')kick();
  });
  document.addEventListener('keydown',e=>{
    if(e.target.matches('[data-school][role=tab]')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
      e.preventDefault();const count=schools().length;
      selectedSchool=e.key==='Home'?0:e.key==='End'?count-1:(selectedSchool+(['ArrowUp','ArrowLeft'].includes(e.key)?-1:1)+count)%count;
      renderEducation();$(`#school-tab-${selectedSchool}`).focus();
    }
    if(e.target.hasAttribute('data-profile-tab')&&['ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault();const tabs=[...document.querySelectorAll('[data-profile-tab]')];
      const index=(tabs.indexOf(e.target)+(e.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length;
      selectProfileTab(tabs[index].dataset.profileTab);tabs[index].focus();
    }
    if (e.key === 'Escape' && $('#page-select')?.getAttribute('aria-expanded') === 'true') closeDropdown(true);
    if (e.target.id === 'page-select' && e.key === 'ArrowDown') {
      e.preventDefault(); $('#page-options').hidden = false; e.target.setAttribute('aria-expanded','true'); $('#page-options a').focus();
    }
    if (e.target.closest('#page-options') && ['ArrowDown','ArrowUp'].includes(e.key)) {
      e.preventDefault(); const links = [...document.querySelectorAll('#page-options a')];
      const next = (links.indexOf(e.target) + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length; links[next].focus();
    }
    if(e.target.id==='badge'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();clickSound();kick();}
  });
  document.addEventListener('input',e=>{if(e.target.id==='collection-search')filterCollection();});
  document.addEventListener('animationend',e=>{if(e.animationName==='kick')e.target.classList.remove('swing-kick');});
  $('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#modal').addEventListener('close',()=>{
    $('#modal-content').querySelectorAll('video').forEach(video=>video.pause());
    $('#modal-content').querySelectorAll('.video-detail').forEach(element=>element.remove());
  });
  render();
  (async()=>{
    try {
      if(!window.supabase) throw new Error('โหลด Supabase ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วเปิดหน้าใหม่');
      db=window.supabase.createClient(PORTFOLIO_CONFIG.supabaseUrl,PORTFOLIO_CONFIG.publishableKey);
      await membership();await load();
      db.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){user=null;admin=false;render();if(!ready)status('ยังไม่ได้ตั้งค่าฐานข้อมูล');}else if(event==='TOKEN_REFRESHED'){user=session?.user;}});
    }catch(error){status(errorText(error));}
  })();
})();
