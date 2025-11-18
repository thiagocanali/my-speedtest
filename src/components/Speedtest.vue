<template>
  <div>
    <button @click="startTest" class="btn">Iniciar Teste</button>

    <div v-if="download" class="chart-box">
      <div id="download-chart"></div>
    </div>

    <div v-if="upload" class="chart-box">
      <div id="upload-chart"></div>
    </div>
  </div>
</template>

<script setup>
import Highcharts from "highcharts";
import more from "highcharts/highcharts-more";
more(Highcharts);

import { ref } from "vue";

const download = ref(null);
const upload = ref(null);

function startTest() {
  runFakeDownload();
  runFakeUpload();
}

function runFakeDownload() {
  download.value = (Math.random() * 500).toFixed(2);

  Highcharts.chart("download-chart", {
    chart: { type: "gauge", height: 300 },
    title: { text: "Download (Mbps)" },
    yAxis: { min: 0, max: 500 },
    series: [{ data: [parseFloat(download.value)] }],
  });
}

function runFakeUpload() {
  upload.value = (Math.random() * 100).toFixed(2);

  Highcharts.chart("upload-chart", {
    chart: { type: "gauge", height: 300 },
    title: { text: "Upload (Mbps)" },
    yAxis: { min: 0, max: 100 },
    series: [{ data: [parseFloat(upload.value)] }],
  });
}
</script>

<style>
.btn {
  background: #2563eb;
  border: none;
  padding: 12px 25px;
  color: white;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
}

.chart-box {
  margin-top: 30px;
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
}
</style>
