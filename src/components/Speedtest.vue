<template>
  <div class="speedtest-box">

    <h2>Teste de Velocidade</h2>

    <button @click="startTest" class="btn">
      Iniciar Teste
    </button>

    <!-- Cards com gauges -->
    <div class="gauges">
      <div class="gauge-card" v-if="showCharts">
        <div id="download-chart"></div>
        <h3>{{ download }} Mbps</h3>
        <p>Download</p>
      </div>

      <div class="gauge-card" v-if="showCharts">
        <div id="upload-chart"></div>
        <h3>{{ upload }} Mbps</h3>
        <p>Upload</p>
      </div>
    </div>

    <!-- Histórico -->
    <div v-if="history.length > 0" class="history-box">
      <h3>Histórico de Testes</h3>

      <table>
        <thead>
          <tr>
            <th>Download</th>
            <th>Upload</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, i) in history" :key="i">
            <td>{{ item.down }} Mbps</td>
            <td>{{ item.up }} Mbps</td>
            <td>{{ item.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import Highcharts from "highcharts";
import more from "highcharts/highcharts-more";
more(Highcharts);

import { ref, nextTick } from "vue";

const download = ref(null);
const upload = ref(null);
const showCharts = ref(false);

const history = ref([]);

async function startTest() {
  showCharts.value = false; // reseta a área
  download.value = "...";
  upload.value = "...";

  // força renderização do DOM antes de criar charts
  await nextTick();
  showCharts.value = true;

  // força outra atualização para garantir que os divs existam
  await nextTick();

  // valores finais reais
  const finalDown = (Math.random() * 500).toFixed(2);
  const finalUp = (Math.random() * 100).toFixed(2);

  // roda animação
  animateGauge("download-chart", 0, finalDown, 500);
  animateGauge("upload-chart", 0, finalUp, 100);

  // quando terminar, atualiza número na tela
  setTimeout(() => {
    download.value = finalDown;
    upload.value = finalUp;

    history.value.unshift({
      down: finalDown,
      up: finalUp,
      time: new Date().toLocaleString("pt-BR"),
    });
  }, 3500);
}

function animateGauge(id, start, end, max) {
  const chart = Highcharts.chart(id, {
    chart: {
      type: "gauge",
      height: 300,
      backgroundColor: "transparent",
    },
    title: { text: "", style: { color: "white" } },
    pane: { startAngle: -150, endAngle: 150, background: null },
    yAxis: {
      min: 0,
      max,
      tickWidth: 2,
      lineWidth: 2,
      labels: { style: { color: "white" } },
    },
    series: [{ data: [start] }],
  });

  // animação suave tipo speedtest real
  let current = start;
  const interval = setInterval(() => {
    const step = (end - current) * 0.15; // acelera no começo, desacelera no final
    current += step;

    if (Math.abs(end - current) < 0.5) {
      current = parseFloat(end);
      clearInterval(interval);
    }

    chart.series[0].points[0].update(current);
  }, 100);
}
</script>

<style scoped>
.speedtest-box {
  background: #1e293b;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 0 20px #0008;
}

h2 {
  text-align: center;
  margin-bottom: 25px;
}

.btn {
  background: #2563eb;
  border: none;
  padding: 14px 35px;
  color: white;
  font-size: 20px;
  border-radius: 10px;
  cursor: pointer;
  display: block;
  margin: 0 auto 30px;
  transition: 0.3s;
}
.btn:hover {
  background: #1d4ed8;
}

.gauges {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-bottom: 30px;
}

.gauge-card {
  background: #0f172a;
  padding: 20px;
  border-radius: 12px;
  width: 45%;
  text-align: center;
  box-shadow: inset 0 0 15px #0006;
}

.gauge-card h3 {
  font-size: 26px;
  margin: 10px 0 0;
  color: #38bdf8;
}

.history-box {
  margin-top: 30px;
  padding: 20px;
  border-radius: 12px;
  background: #0f172a;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

thead th {
  background: #1e40af;
  padding: 10px;
  color: white;
}

tbody td {
  padding: 10px;
  border-top: 1px solid #334155;
}

tbody tr:nth-child(odd) {
  background: #1e293b;
}
</style>
