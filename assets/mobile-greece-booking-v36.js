
(function(){
  'use strict';
  const bookingUrl='book-a-retreat.html#checkout';
  const isMobile=()=>window.matchMedia('(max-width:900px)').matches;
  function bind(){
    const g=document.querySelector('.retreats-greece-feature');
    if(!g) return;
    const b=g.querySelector('strong');
    if(!b) return;
    b.addEventListener('click',function(e){
      if(!isMobile()) return;
      e.preventDefault(); e.stopPropagation();
      window.location.href=bookingUrl;
    },true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
})();
