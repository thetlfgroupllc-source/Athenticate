// ── Autosave: persist form progress in localStorage ──
(function(){
  var KEY = 'ath_review_draft';
  var fields = [
    'agentName','agentAgency','experienceText','verifyEmail',
    'verifyInstagram','athleteFirstName','athleteLastName',
    'verifyTeamOther','dependsExplanation','platformFeedback',
    'yearsStart','yearsEnd','verifySeasonStart','verifySeasonEnd','verifyTeam'
  ];

  function save(){
    var data = {};
    fields.forEach(function(id){
      var el = document.getElementById(id);
      if(el) data[id] = el.value;
    });
    data._gender = document.getElementById('genderMen').classList.contains('active') ? 'men' : 'women';
    var visibleTabs = document.querySelectorAll('.sport-tabs');
    visibleTabs.forEach(function(group){
      if(group.style.display !== 'none'){
        var active = group.querySelector('.sport-tab.active');
        if(active) data._sport = active.textContent.trim();
      }
    });
    ['relStatus','otherAgents','contractType'].forEach(function(name){
      var checked = document.querySelector('input[name="'+name+'"]:checked');
      if(checked) data['_radio_'+name] = checked.value;
    });
    var rows = document.querySelectorAll('.ratings-grid .star-row');
    rows.forEach(function(r,i){ data['_rating_'+i] = r.dataset.selected; });
    var overallStars = document.querySelectorAll('#overallStars .overall-star');
    var ov = -1;
    overallStars.forEach(function(s,i){
      var c = s.style.color;
      if(c && (c==='var(--cyan)' || c.indexOf('0, 200, 255')!==-1)) ov = i;
    });
    data._overall = ov;
    document.querySelectorAll('.rec-btn').forEach(function(b){
      if(b.classList.contains('active-yes')) data._recommend='yes';
      else if(b.classList.contains('active-no')) data._recommend='no';
      else if(b.classList.contains('active-depends')) data._recommend='depends';
    });
    data._flags = Array.from(document.querySelectorAll('.flag-item.selected')).map(function(el){ return el.querySelector('.flag-label').textContent.trim(); });
    data._strengths = Array.from(document.querySelectorAll('.strength-item.selected')).map(function(el){ return el.querySelector('.strength-label').textContent.trim(); });
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){}
  }

  function restore(){
    var raw;
    try { raw = localStorage.getItem(KEY); } catch(e){ return; }
    if(!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch(e){ return; }

    fields.forEach(function(id){
      var el = document.getElementById(id);
      if(el && data[id]) el.value = data[id];
    });
    if(data._gender) switchGender(data._gender);
    if(data._sport){
      var visibleTabs = document.querySelectorAll('.sport-tabs');
      visibleTabs.forEach(function(group){
        if(group.style.display !== 'none'){
          group.querySelectorAll('.sport-tab').forEach(function(t){
            if(t.textContent.trim() === data._sport) t.click();
          });
        }
      });
    }
    ['relStatus','otherAgents','contractType'].forEach(function(name){
      if(data['_radio_'+name]){
        var r = document.querySelector('input[name="'+name+'"][value="'+data['_radio_'+name]+'"]');
        if(r) r.checked = true;
      }
    });
    var rows = document.querySelectorAll('.ratings-grid .star-row');
    rows.forEach(function(r,i){
      var val = parseInt(data['_rating_'+i]);
      if(val > 0){
        r.dataset.selected = val;
        r.querySelectorAll('.star-btn').forEach(function(s){
          s.style.color = parseInt(s.dataset.val) <= val ? 'var(--cyan)' : 'rgba(0,200,255,0.15)';
        });
      }
    });
    if(data._overall >= 0){
      var labels = ['Poor','Below Average','Average','Good','Excellent'];
      document.querySelectorAll('#overallStars .overall-star').forEach(function(s,j){
        s.style.color = j <= data._overall ? 'var(--cyan)' : 'rgba(0,200,255,0.15)';
      });
      var lbl = document.getElementById('overallScoreLabel');
      if(lbl && labels[data._overall]) lbl.textContent = labels[data._overall];
    }
    if(data._recommend){
      document.querySelectorAll('.rec-btn').forEach(function(b){
        if(b.textContent.trim().toLowerCase() === data._recommend){
          b.classList.add('active-'+data._recommend);
          if(data._recommend === 'depends') document.getElementById('dependsField').style.display = 'block';
        }
      });
    }
    if(data._flags && data._flags.length){
      document.querySelectorAll('.flag-item').forEach(function(el){
        if(data._flags.indexOf(el.querySelector('.flag-label').textContent.trim()) !== -1) el.classList.add('selected');
      });
    }
    if(data._strengths && data._strengths.length){
      document.querySelectorAll('.strength-item').forEach(function(el){
        if(data._strengths.indexOf(el.querySelector('.strength-label').textContent.trim()) !== -1) el.classList.add('selected');
      });
    }
    if(document.getElementById('verifyTeam') && document.getElementById('verifyTeam').value === '__other__'){
      document.getElementById('verifyTeamOther').style.display = 'block';
    }
  }

  document.addEventListener('DOMContentLoaded', function(){ setTimeout(restore, 150); });
  document.addEventListener('input', save);
  document.addEventListener('change', save);
  document.addEventListener('click', function(){ setTimeout(save, 50); });

  // Clear draft on successful submission
  var overlay = document.getElementById('successOverlay');
  if(overlay){
    new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        if(m.target.classList && m.target.classList.contains('show')){
          try { localStorage.removeItem(KEY); } catch(e){}
        }
      });
    }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }
})();
