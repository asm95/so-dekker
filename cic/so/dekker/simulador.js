$(document).ready(function(){

  // UI of code editor
  var cedit = {

    c_line_el: [null, null],
    root_el: [$('#editor-1'), $('#editor-2')],

    set_current_line: function(root_id, line_no){
      var c_line_el = this.c_line_el[root_id];
      if (c_line_el != null){
        $(c_line_el).removeClass('line-cur');

      }
      cur_lo = $(cedit.root_el[root_id]).find('span:nth-child(' + (line_no + 1) + ')');
      cur_lo.addClass('line-cur');
      this.c_line_el[root_id] = cur_lo;
    },
    init: function(){
      // for each code wrapper, call highlight.js
      $('pre code.c').each(function(){
        hljs.highlightBlock(this);
      });
    }
  }

  var alg = {
    "proc_vars": [
      {"i": 0, "j": 1},
      {"i": 1, "j": 0}
    ],
    "flag": [false, false],
    "turn": 0,
    engine: null,

    set_turn: function(val){
      alg.turn = val;
      $('#var-turn').text(
        'Processo ' + (val + 1)
      );
    },
    set_flag: function(id, val){
      alg.flag[id] = val;
      $('#var-flag-' + id).html(
        val ? '<span class="kw kw-true">true</span>' : 
          '<span class="kw kw-false">false</span>'
      );
    },
    get_var: function(var_name){
      var mem = alg.proc_vars[alg.engine.cur_proc];
      return mem[var_name];
    },
    2: function(){alg.set_flag(alg.engine.cur_proc, true);},
    3: function(){
      var j = alg.get_var('j');
      // the default behavior is go to the next line
      if (alg.flag[j] != false){} else {
        // else it will jump
        alg.engine.jump(11);
      }
    },
    5: function(){
      if (alg.turn == alg.get_var('j')){
        // continue
      } else {
        alg.engine.jump(3);
      }
    },
    6: function(){
      alg.set_flag(alg.get_var('i'), false);
    },
    7: function(){
      if (alg.turn == alg.get_var('j')){
        alg.engine.jump(7);
      }
    },
    8: function(){
      alg.set_flag(alg.get_var('i'), true);
    },
    11: function(){
    },
    12: function(){
      alg.set_turn(alg.get_var('j'));
    },
    13: function(){
      alg.set_flag(alg.get_var('i'), false);
    },
    init: function(){
      // init all memory variables
      alg.set_flag(0, alg.flag[0]);
      alg.set_flag(1, alg.flag[1]);
      alg.set_turn(alg.turn);
    }
  }

  var smac = {
    "proc_mem": [
      {cur_lno: -1},
      {cur_lno: -1}
    ],
    pre_step_jobs: [],
    last_proc: null,
    "cur_proc": 0,
    line_count: 15,
    stepped: false,
    exec_speed: 500,

    step_round_robin: function(){
      /*
        will simulate round robin behaviour where
        at each line of the algorithm the quantumm time
        can expire and cause the process to context switch,
        therefore sleep one process and bringing another one
        to live
      */
      if (Math.random() > 0.5){
          smac.cur_proc = 1 - smac.cur_proc;
          smac.pre_step_jobs.push(function(){
            smac.set_current_proc(smac.cur_proc);
          });
      }
    },
    step: function(){

      var cur_lno = (smac.proc_mem[smac.cur_proc].cur_lno + 1) % smac.line_count;

      for (job_idx in smac.pre_step_jobs){
        smac.pre_step_jobs[job_idx]();
      }
      smac.pre_step_jobs = [];

      cedit.set_current_line(smac.cur_proc, cur_lno);
      smac.proc_mem[smac.cur_proc].cur_lno = cur_lno;

      if (alg[cur_lno] == undefined){
          setTimeout(smac.step, 0);
      } else {
        alg[cur_lno]();
        smac.step_round_robin();
        if (! smac.stepped){
          setTimeout(smac.step, smac.exec_speed);
        }
      }            
    },
    jump: function(line){
      smac.proc_mem[smac.cur_proc].cur_lno = line - 1;
    },
    set_current_proc: function(id){
      if (smac.last_proc != null){
        $('#title-proc-' + (smac.last_proc+1)).removeClass('active');
      }
      $('#title-proc-' + (id+1)).addClass('active');
      smac.last_proc = id;

      $('div.editor.editor-wrap pre').each(function(){
        if ($(this).attr('id').indexOf('-' + (id+1)) >= 0){
          $(this).removeClass('paused');
        } else {
          $(this).addClass('paused');
        } 
      });
    },
    init: function(){
      smac.set_current_proc(smac.cur_proc);
      alg.engine = smac;
      alg.init();
    }
  }

  // UI outside editor
  var ui = {
    is_expanded: false,

    on_expand_click: function(){
    if (ui.is_expanded){
      $('div.editor.editor-wrap').each(function(){
        $(this).removeClass('col-md-6');
        $(this).addClass('col-md-12');
      });
      $('#content-main-window').attr('class', 'col-md-6 col-md-offset-3');
    } else {
      $('div.editor.editor-wrap').each(function(){
        $(this).removeClass('col-md-12');
        $(this).addClass('col-md-6');
      });
      $('#content-main-window').attr('class', 'col-md-12');  
    }
    ui.is_expanded = ! ui.is_expanded;
    },

    on_step_change: function(){
        // @ui.auto.exclude
        if (smac.stepped){
          $('#btn-auto-wrap button').attr('disabled', '');
        } else {
          $('#btn-auto-wrap button').removeAttr('disabled');
        }

        smac.stepped = ! smac.stepped;

    },
    init: function(){
      // bind btn click
      $('#btn-ui-expand').on('click', ui.on_expand_click);

      $('#btn-step-wrap').on('click', function(){
        if (! smac.stepped){
          ui.on_step_change();
          return; // avoid double stepping
        }
        smac.step();
      });
      $('#btn-auto-wrap').on('click', function(){
        ui.on_step_change();
        smac.step();
      });

      if (! smac.stepped){
        ui.on_step_change();
      }
    }
  }

  // machine's memory card
  var memc = {
      schemes: {
        alg: {
          _keys:['proc_vars','flag','turn'],
          _target:alg
        },
        smac: {
          _keys:['proc_mem','cur_proc'],
          _target:smac
        }
      },
      collect_data: function(key_scheme){
        for (idx in key_scheme._keys){
          var key = key_scheme._keys[idx];
          key_scheme[key] = key_scheme._target[key];
        }
        delete key_scheme['_keys'];
        delete key_scheme['_target'];

        return key_scheme;
      },
      peform_dump: function(){
        $('#ui-mem-err-msg').text('');

        // will save all variables, including lines
        var app_dump = {};
        var conf = {};
        var alg_data = $.extend({}, memc.schemes.alg);
        var smac_data = $.extend({}, memc.schemes.smac);

        var dump_str = JSON.stringify({
          conf: conf,
          alg: memc.collect_data(alg_data),
          smac: memc.collect_data(smac_data)
        }, null, 2);
        $('#ta-dump').val(dump_str);              
      },
      peform_restore: function(){
        $('#ui-mem-err-msg').text('');

        try{
          var app_dump = JSON.parse($('#ta-dump').val());
        } catch (syntax_err) {
          $('#ui-mem-err-msg').text('Erro ao realizar a restauração: JSON inválido.');
          return;
        }
        
        $.extend(alg, memc.schemes.alg, {_target: app_dump.alg});
        $.extend(smac, memc.schemes.smac, {_target: app_dump.smac});
        memc.collect_data(alg);
        memc.collect_data(smac);

        // restore editor lines
        cedit.set_current_line(0, smac.proc_mem[0].cur_lno);
        cedit.set_current_line(1, smac.proc_mem[1].cur_lno);
        // restore active editor and variables
        smac.init();

      },
      init: function(){
        $('#sec-mem').removeClass('hidden');
        $('#btn-dump').on('click', memc.peform_dump);
        $('#btn-restore').on('click', memc.peform_restore);
      }
  }


  var breakpoint = {

    init: function(){
      var bp_class = 'editor editor-breakpoint';
      $('pre code.c span.line').each(function(){
        bp_el = $('<span class="' +bp_class+ '">&nbsp;</span>');
        $(this)
          .prepend(bp_el);
        bp_el.on('click', function(){
          $(bp_el).addClass('enabled');
        });
      });

    }
  }

  // provides config. UI
  var conf = {
    set_exec_speed: function(){
      spd = parseInt($(this).val());
      if ( isNaN(spd) || spd < 100){
        return;
      }

      console.log('set ' + spd);
      smac.exec_speed = spd;
    },
    init: function(){
      $('#ip-exec-vel')
        .on('keyup', conf.set_exec_speed)
        .val(smac.exec_speed);
    }
  }

  var enabled_mods = [cedit,smac,ui,memc, conf, breakpoint];
  for (mod_id in enabled_mods){
    enabled_mods[mod_id].init();
  }

});