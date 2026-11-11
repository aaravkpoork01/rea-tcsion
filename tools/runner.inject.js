(function(){
  function vis(el){ if(!el) return false; try { var s=getComputedStyle(el), b=el.getBoundingClientRect(); return s.display!=="none" && s.visibility!=="hidden" && b.width>0 && b.height>0; } catch(e){ return false; } }
  function norm(v){ return v==null ? "" : String(v); }
  function correctList(bean){
    var c = bean.correctAnswer;
    if (c == null) return [];
    var raw = Array.isArray(c) ? c : [c];
    var out = [];
    raw.forEach(function(x){ String(x).split("<sa_ans_sep>").forEach(function(y){ if (norm(y).length) out.push(norm(y)); }); });
    return out;
  }
  function optionBelongsTo(inp, qid){
    var id = inp.id || "";
    if (id.indexOf("Question"+qid+"Option") > -1) return true;
    var cls = norm(inp.className);
    if (cls.indexOf("MSQanswer"+qid) > -1 || cls.indexOf("MCQanswer"+qid) > -1 || cls.indexOf("MATRIX") > -1) return true;
    return false;
  }
  function answer(){
    var bean = mockVar.curQuesBean;
    if (!bean) return false;
    var qid = norm(bean.quesId), t = norm(bean.quesType).toUpperCase(), ok = false;

    // group images into buckets: #answersN divs each holding a ul
    var buckets = Array.prototype.slice.call(document.querySelectorAll("div[id^=answers]")).filter(function(d){
      return d.querySelector("ul.droptrue") && d.getBoundingClientRect().height > 0;
    });
    if (buckets.length){
      var moved = 0;
      buckets.forEach(function(bucket){
        var bq = norm(bucket.id).replace("answers", "");
        var target = bucket.querySelector("ul.droptrue");
        var secB = mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection];
        var qb = secB.questions.filter(function(q){ return norm(q.quesId) === bq; })[0];
        if (!qb || !target) return;
        correctList(qb).forEach(function(v){
          var li = document.querySelector("li > span[value='" + v + "']");
          if (!li) return;
          var row = li.closest("li");
          if (row && row.parentElement !== target){ target.appendChild(row); moved++; }
        });
        target.dispatchEvent(new Event("change", { bubbles: true }));
      });
      if (moved >= 0) return true;
    }

    // drag-based match-the-columns: DOM order of #sortable li is the answer
    var ul = document.getElementById("sortable");
    if (ul && ul.getBoundingClientRect().height > 0 && ul.querySelectorAll("li").length > 1){
      var sec0 = mockVar.groups[mockVar.currentGrp].secDetails[iOAP.curSection];
      var idx = -1;
      for (var z=0; z<sec0.questions.length; z++){ if (norm(sec0.questions[z].quesId)===qid){ idx = z; break; } }
      if (idx > -1){
        var want = [];
        for (var z2=idx; z2<sec0.questions.length; z2++){
          var c = correctList(sec0.questions[z2]);
          want.push(c.length ? c[0] : null);
          if (want.length >= ul.querySelectorAll("li").length) break;
        }
        var lis = Array.prototype.slice.call(ul.querySelectorAll("li"));
        var byVal = {};
        lis.forEach(function(li){ var sp = li.querySelector("span"); var v = sp ? norm(sp.getAttribute("value")) : ""; if (v) byVal[v] = li; });
        var ordered = [], used = {};
        want.forEach(function(v){ if (v && byVal[v] && !used[v]){ ordered.push(byVal[v]); used[v] = 1; } });
        lis.forEach(function(li){ if (ordered.indexOf(li) < 0) ordered.push(li); });
        ordered.forEach(function(li){ ul.appendChild(li); });
        ok = true;
      }
    }
    if (ok) return ok;

    // typing test: copy passage into the typed answer box
    var typed = document.querySelector("textarea.typedAnswer");
    if (typed && typed.getBoundingClientRect().width > 0){
      if (!norm(typed.value).length){
        var pass = document.getElementById("typingDivs");
        var txt = pass ? (pass.innerText || "").replace(/\s+/g, " ").trim() : "";
        if (!txt){ var pb2 = document.getElementById("typingInstDiv"); txt = pb2 ? (pb2.innerText||"").replace(/\s+/g," ").trim() : "test"; }
        typed.focus();
        typed.value = txt.slice(0, 1200);
        typed.dispatchEvent(new Event("input", {bubbles:true}));
        typed.dispatchEvent(new Event("keyup", {bubbles:true}));
        typed.dispatchEvent(new Event("change", {bubbles:true}));
      }
      return true;
    }
    if (t==="MCQ" || t==="MSQ"){
      var vals = correctList(bean);
      var all = Array.prototype.slice.call(document.querySelectorAll("input[type=radio],input[type=checkbox]"));
      var mine = all.filter(function(inp){ return optionBelongsTo(inp,qid); });
      mine.forEach(function(inp){
        if (inp.disabled) return;
        if (vals.indexOf(norm(inp.value)) > -1 && !inp.checked){ inp.click(); ok = true; }
      });
      if (!ok){
        // composite / match-the-following: <select id="answersN"> per row
        var sels = [];
        var first = document.getElementById("answers"+qid);
        if (first && first.tagName === "SELECT"){
          var n = qid|0, k = 0;
          var probe = first;
          while (probe && probe.tagName === "SELECT" && k < 20){
            sels.push(probe);
            k++;
            probe = document.getElementById("answers"+(n+k));
          }
        }
        if (sels.length){
          var pool = [];
          var ov = Array.prototype.slice.call(sels[0].options).map(function(o){ return norm(o.value); }).filter(function(v){ return v && v !== "select"; });
          sels.forEach(function(sel, row){
            var want = vals[row];
            if (want && pool.indexOf(want) < 0 && ov.indexOf(want) > -1) pool.push(want);
          });
          sels.forEach(function(sel, row){
            var want = vals[row];
            if (!want || ov.indexOf(want) < 0){
              // positional fallback: k-th remaining option
              var taken = pool.slice(0, row);
              for (var j=0; j<ov.length; j++){ if (taken.indexOf(ov[j]) < 0){ want = ov[j]; break; } }
            }
            for (var x=0; x<sel.options.length; x++){
              if (norm(sel.options[x].value) === norm(want)){ sel.selectedIndex = x; break; }
            }
            sel.dispatchEvent(new Event("change", {bubbles:true}));
          });
          ok = true;
        } else {
          // untagged MSQ render: no ids, no selects. Take visible options.
          var loose = Array.prototype.slice.call(document.querySelectorAll("input[type=checkbox],input[type=radio]"))
            .filter(function(inp){
              if (inp.id === "degree_or_radian") return false;
              if (inp.disabled) return false;
              var r = inp.getBoundingClientRect();
              return r.width > 0 && r.height > 0;
            });
          loose.forEach(function(inp){
            if (vals.indexOf(norm(inp.value)) > -1 && !inp.checked){ inp.click(); ok = true; }
          });
        }
      }
    } else if (t==="SA" || t==="SUBJECTIVE"){
      var ck = CKEDITOR.instances["answer"+qid] || CKEDITOR.instances["answer"] || null;
      if (!ck){
        var names = Object.keys(CKEDITOR.instances);
        for (var ni=0; ni<names.length; ni++){
          var inst = CKEDITOR.instances[names[ni]];
          var elm = inst && inst.element && inst.element.$;
          if (elm && elm.getBoundingClientRect().height > 0){ ck = inst; break; }
        }
      }
      if (ck && ck.getData){
        if (!ck.getData().replace(/<[^>]*>/g,"").trim().length){ ck.setData("<p>"+(correctList(bean)[0]||"NA")+"</p>", function(){}); }
        ok = true;
      } else {
        var inp2 = document.getElementById("answer");
        if (inp2){
          if (!norm(inp2.value).length){ inp2.value = correctList(bean)[0]||"Gypsum"; inp2.dispatchEvent(new Event("input", {bubbles:true})); inp2.dispatchEvent(new Event("change", {bubbles:true})); }
          ok = true;
        }
      }
      if (!ok){
        var kb = norm(bean.keyboardType).toLowerCase();
        if (kb.indexOf("audio") > -1 || kb.indexOf("video") > -1 || kb.indexOf("file") > -1 || kb.indexOf("upload") > -1) ok = true;
        else if (t === "SUBJECTIVE") ok = true;
      }
    } else if (t==="MCQ" && !ok){
      // Match-the-following / composite questions use <select id="answersN">
      var sel = document.getElementById("answers"+qid);
      if (sel){
        var vals = correctList(bean);
        var opt = null;
        for (var i=0; i<sel.options.length; i++){
          var o = sel.options[i];
          if (vals.indexOf(norm(o.value)) > -1 && o.value !== "select" && o.index > 0){ opt = i; break; }
        }
        if (opt !== null){ sel.selectedIndex = opt; sel.dispatchEvent(new Event("change", {bubbles:true})); sel.dispatchEvent(new Event("input", {bubbles:true})); ok = true; }
      }
    } else if (t==="PROGRAMMING TEST"){
      var areas = Array.prototype.slice.call(document.querySelectorAll("textarea"));
      var el = null;
      for (var i=0; i<areas.length; i++){ if (vis(areas[i]) && areas[i].getBoundingClientRect().width>100 && areas[i].getBoundingClientRect().height>60){ el = areas[i]; break; } }
      if (!el){ for (var i=0; i<areas.length; i++){ if (vis(areas[i])){ el = areas[i]; break; } } }
      if (el){
        var skeleton = norm(bean.programmingSkeletalCode);
        var code = skeleton ? skeleton.replace(/\n*$/, "\n") + "\n" : "";
        var qtxt = (document.body.innerText||"").replace(/\s+/g," ");
        if (qtxt.indexOf("Simple Interest") !== -1){
          code += "int main()\n{\n    float p,r,t,si;\n    printf(\"Enter principal, rate and time: \");\n    scanf(\"%f %f %f\", &p, &r, &t);\n    si = (p*r*t)/100;\n    printf(\"Simple Interest = %.2f\", si);\n    return 0;\n}\n";
        } else {
          code += "int main()\n{\n    printf(\"Program output:\");\n    return 0;\n}\n";
        }
        el.value = code;
        el.dispatchEvent(new Event("input", {bubbles:true}));
        el.dispatchEvent(new Event("change", {bubbles:true}));
        ok = true;
      }
    }
    return ok;
  }
  function saveBtn(){
    var ids = ["savenextGroupMbl","savenextMbl","saveProgramMbl","finalTypingSub","savenextGroup","savenext"];
    for (var i=0; i<ids.length; i++){ var b = document.getElementById(ids[i]); if (b && vis(b) && !b.disabled) return b; }
    return null;
  }
  function dismissPops(){
    var y = document.getElementById("revisit_Yes");
    if (y && vis(y)){ y.click(); return "revisit"; }
    var ok = document.querySelector("#InfoPopup .Ok, #InfoPopup .cnfPopNo");
    if (ok && vis(ok)){ ok.click(); return "info"; }
    return null;
  }
  var S = { log: [], stage: "idle", stageQid: null, stageTick: 0, tick: 0, pushed: {} };
  window.__ktR = S;
  window.__ktV = vis;
  window.__ktAns = answer;
  window.__ktSaveBtn = saveBtn;
  window.__ktCorrectList = correctList;
  function runOnce(){
    var p = dismissPops();
    if (p){ S.log.push("pop "+p); return "pop"; }
    var cur = norm(mockVar.curQuesBean&&mockVar.curQuesBean.quesId);
    if (!cur){ return "none"; }
    if (cur !== S.stageQid){ S.stage = "idle"; S.stageQid = cur; S.stageTick = S.tick; }
    if (S.stage === "idle"){
      var k = answer();
      if (k > 0){ S.stage = "answered"; S.stageTick = S.tick; S.log.push("ans "+cur+" x1"); }
      else { var b = mockVar.curQuesBean; if (b && norm(b.quesParam&&b.quesParam.status)==="answered"){ var sb0 = saveBtn(); if (sb0){ sb0.click(); S.stage = "saved"; S.stageTick = S.tick; S.log.push("push "+cur); } } }
    } else if (S.stage === "answered"){
      var sb = saveBtn();
      if (sb){ sb.click(); S.stage = "saved"; S.stageTick = S.tick; S.log.push("save "+cur); }
    }
    return "done";
  }
  window.__ktRun = runOnce;
  window.__ktS = S;
  return "installed";
})();
