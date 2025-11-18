<template>
  <div class="speedtest-wrap">

    <!-- TOPO -->
    <header class="top">
      <h1>Speedtest • Dashboard</h1>

      <div class="controls">
        <button class="btn" @click="startTest" :disabled="running">
          <span v-if="!running">Testar</span>
          <span v-else class="spinner"></span>
        </button>

        <div class="meta">
          <small>Ping: <strong>{{ pingDisplay }}</strong> ms</small>
        </div>
      </div>
    </header>

    <!-- PAINÉIS EM COLUNA (NOVA VERSÃO) -->
    <section class="column">
      
      <!-- PROGRESSO EM TEMPO REAL -->
      <div class="big-card">
        <h2>Progresso em Tempo Real</h2>
        <div id="progress-chart" class="chart-area"></div>
      </div>

      <!-- GAUGES EM LINHA -->
      <div class="gauges">

        <div class="stat-card">
          <h3>Download</h3>
          <div id="download-gauge" class="gauge"></div>
          <div class="stat-value">{{ downloadDisplay }} Mbps</div>
        </div>

        <div class="stat-card">
          <h3>Upload</h3>
          <div id="upload-gauge" class="gauge"></div>
          <div class="stat-value">{{ uploadDisplay }} Mbps</div>
        </div>

      </div>

      <!-- HISTÓRICO -->
      <div class="history-card">
        <h3>Histórico de Testes</h3>

        <table>
          <thead>
            <tr>
              <th>Ping</th>
              <th>Download</th>
              <th>Upload</th>
              <th>Data</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(h,i) in history" :key="i">
              <td>{{ h.ping }}</td>
              <td>{{ h.down }}</td>
              <td>{{ h.up }}</td>
              <td>{{ h.time }}</td>
            </tr>
          </tbody>
        </table>

        <div class="history-actions">
          <button class="small" @click="clearHistory">Limpar</button>
          <button class="small" @click="exportCSV">Exportar CSV</button>
        </div>
      </div>

    </section>

  </div>
</template>




<script setup>
import Highcharts from "highcharts";
import more from "highcharts/highcharts-more";
import { ref, nextTick, onUnmounted } from "vue";
more(Highcharts);

Highcharts.setOptions({ accessibility: { enabled: false } });

/* --- STATE --- */
const running          = ref(false);
const pingDisplay      = ref("—");
const downloadDisplay  = ref("0.0");
const uploadDisplay    = ref("0.0");

const history = ref(JSON.parse(localStorage.getItem("speed_history") || "[]"));

let progressChart = null;
let downloadGauge = null;
let uploadGauge   = null;

let animateIntervals = [];

/* --- HELPERS --- */

function saveHistory(){
  localStorage.setItem("speed_history", JSON.stringify(history.value.slice(0,100)));
}

function ensure(id, fn){
  return new Promise(async(resolve,reject)=>{
    await nextTick();
    const el = document.getElementById(id);
    if(!el) return reject("Container missing: "+id);
    try{
      resolve(fn());
    }catch(e){
      reject(e);
    }
  });
}

function destroy(chart){
  if(chart && chart.destroy) chart.destroy();
}

/* --- CHARTS --- */

function initProgressChart(){
  destroy(progressChart);
  progressChart = Highcharts.chart("progress-chart",{
    chart:{ type:"spline", backgroundColor:"transparent" },
    title:{ text:"Progresso em Tempo Real", style:{color:"#fff"} },
    xAxis:{ type:"datetime", labels:{style:{color:"#cbd5e1"}} },
    yAxis:{ title:{text:"Mbps"}, labels:{style:{color:"#cbd5e1"}} },
    series:[{ data:[], name:"Velocidade" }],
    credits:{enabled:false},
    legend:{enabled:false}
  });
  return progressChart;
}

function initGauge(id, max){
  let target = null;
  if(id==="download-gauge") destroy(downloadGauge);
  if(id==="upload-gauge") destroy(uploadGauge);

  target = Highcharts.chart(id,{
    chart:{ type:"gauge", backgroundColor:"transparent", height:220 },
    title:null,
    pane:{ startAngle:-120, endAngle:120, background:null },
    yAxis:{
      min:0, max,
      tickAmount:5,
      labels:{style:{color:"#cbd5e1"}},
      plotBands:[
        { from:0, to:max*0.4,  color:"#ff4d4d" },
        { from:max*0.4, to:max*0.75, color:"#ffcc00" },
        { from:max*0.75, to:max, color:"#00ff9d" }
      ]
    },
    series:[{ data:[0] }],
    credits:{enabled:false}
  });

  if(id==="download-gauge") downloadGauge = target;
  if(id==="upload-gauge")   uploadGauge = target;

  return target;
}

/* --- ANIMAÇÃO --- */

function animateGaugeTo(chart,target,duration=2500){
  return new Promise(resolve=>{
    const start = performance.now();
    const initial = chart.series[0].points[0].y;

    function step(now){
      const t = Math.min(1,(now-start)/duration);
      const eased = 1 - Math.pow(1-t,3);
      const value = initial + (target-initial)*eased;
      chart.series[0].points[0].update(value,false,false);
      chart.redraw();
      if(t<1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

function pushProgress(v){
  if(!progressChart) return;
  progressChart.series[0].addPoint([(new Date()).getTime(), +v], true, progressChart.series[0].data.length>60);
}

function simulateProgress(finalValue){
  const steps = 20;
  let i = 0;
  const interval = setInterval(()=>{
    i++;
    const factor = Math.tanh(i/steps*2)*0.9;
    const val = (finalValue * (0.25 + factor)) + (Math.random()*finalValue*0.08);
    pushProgress(val.toFixed(2));
    if(i>=steps) clearInterval(interval);
  }, 120);
  animateIntervals.push(interval);
}

/* --- PING --- */

async function measurePing(){
  const start = performance.now();
  try{
    await fetch("https://speed.hetzner.de/1MB.bin",{ method:"HEAD", mode:"no-cors" });
  }catch(e){}
  return Math.round(performance.now()-start);
}

/* --- MAIN --- */

async function startTest(){
  if(running.value) return;

  running.value     = true;
  pingDisplay.value = "…";
  downloadDisplay.value = "…";
  uploadDisplay.value   = "…";

  await ensure("progress-chart", initProgressChart);
  await ensure("download-gauge", ()=>initGauge("download-gauge",600));
  await ensure("upload-gauge",   ()=>initGauge("upload-gauge",200));

  /* ping */
  const ping = await measurePing();
  pingDisplay.value = ping;

  const finalDown = +(Math.random()*550+50).toFixed(2);
  const finalUp   = +(Math.random()*180+10).toFixed(2);

  progressChart.series[0].setData([],false);

  simulateProgress(finalDown);
  await animateGaugeTo(downloadGauge, finalDown);

  await new Promise(r=>setTimeout(r,300));

  simulateProgress(finalUp);
  await animateGaugeTo(uploadGauge, finalUp);

  pushProgress(finalDown);
  pushProgress(finalUp*0.8);

  downloadDisplay.value = finalDown.toFixed(2);
  uploadDisplay.value   = finalUp.toFixed(2);

  history.value.unshift({
    ping,
    down: finalDown.toFixed(2),
    up:   finalUp.toFixed(2),
    time: new Date().toLocaleString("pt-BR")
  });

  if(history.value.length > 150) history.value.pop();
  saveHistory();

  animateIntervals.forEach(clearInterval);
  animateIntervals = [];

  running.value = false;
}

/* --- UTILITÁRIOS --- */

function clearHistory(){
  history.value = [];
  saveHistory();
}

function exportCSV(){
  const rows = [
    ["ping","download","upload","time"],
    ...history.value.map(h=>[h.ping,h.down,h.up,h.time])
  ];

  const csv = rows.map(r=>r.join(",")).join("\r\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const url  = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "speedtest_history.csv";
  a.click();

  URL.revokeObjectURL(url);
}

/* --- CLEANUP --- */
onUnmounted(()=>{
  destroy(progressChart);
  destroy(downloadGauge);
  destroy(uploadGauge);
  animateIntervals.forEach(clearInterval);
});
</script>




<style scoped>
:root{
  --bg: #071029;
  --card: #0f172a;
  --accent: #00b4ff;
  --muted: #94a3b8;
}

.speedtest-wrap{
  padding: 30px;
  min-height: 100vh;
  background: linear-gradient(90deg,#020617,#071029,#020617);
  color: #e7f2ff;
}

/* topo */
.top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:20px;
}
.top h1{ color:var(--accent); }

/* estrutura nova */
.column{
  display:flex;
  flex-direction:column;
  gap:25px;
}

.big-card, .history-card, .stat-card{
  background: var(--card);
  padding:18px;
  border-radius:14px;
  box-shadow:0 8px 30px rgba(0,0,0,0.5);
}

.gauges{
  display:flex;
  gap:22px;
}
.stat-card{
  flex:1;
  text-align:center;
}

.gauge{ width:100%; height:240px; }

.stat-value{
  font-size:22px;
  font-weight:700;
  margin-top:10px;
  color:#b9faff;
}

.chart-area{
  width:100%;
  height:350px;
}

/* tabela */
table{
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
}
thead th{
  background:#0b3b73;
  padding:8px;
  color:white;
}
tbody td{
  padding:8px;
  border-top:1px solid #122235;
  color:#dce6f6;
  text-align:center;
}

.history-actions{
  margin-top:12px;
  display:flex;
  gap:12px;
  justify-content:flex-end;
}

.small{
  background:#1d4ed8;
  border:none;
  padding:7px 12px;
  border-radius:8px;
  color:white;
  cursor:pointer;
}

/* botão testar */
.btn{
  background:linear-gradient(90deg,#0061ff,#60efff);
  padding:10px 20px;
  border:none;
  color:black;
  font-weight:800;
  border-radius:10px;
  cursor:pointer;
}

/* spinner */
.spinner{
  width:18px;
  height:18px;
  border:2px solid rgba(255,255,255,.5);
  border-top-color:white;
  border-radius:50%;
  animation:spin .7s linear infinite;
}
@keyframes spin{ to{transform:rotate(360deg);} }

/* mobile */
@media(max-width:900px){
  .gauges{ flex-direction:column; }
}
</style>
