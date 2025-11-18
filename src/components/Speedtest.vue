<template>
  <div class="dashboard">

    <div class="card header-card">
      <h2>Speedtest Super Turbo 🚀</h2>
      <p class="sub">Powered by Vue + Highcharts</p>
    </div>

    <div class="card">
      <button @click="startTest" :disabled="testing" class="btn">
        <span v-if="!testing">Iniciar Teste</span>
        <span v-else class="loader"></span>
      </button>
    </div>

    <div class="charts-grid">
      <div class="card chart-box">
        <h3>Download</h3>
        <div id="download-chart"></div>
        <p class="value" v-if="download !== null">{{ download }} Mbps</p>
      </div>

      <div class="card chart-box">
        <h3>Upload</h3>
        <div id="upload-chart"></div>
        <p class="value" v-if="upload !== null">{{ upload }} Mbps</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import Highcharts from "highcharts"
import more from "highcharts/highcharts-more"
more(Highcharts)

import { ref } from "vue"

const download = ref(null)
const upload = ref(null)
const testing = ref(false)

function startTest() {
  testing.value = true
  download.value = null
  upload.value = null

  animateGauge("download-chart", 500)
  animateGauge("upload-chart", 100)

  setTimeout(() => {
    finishTest()
  }, 2200)
}

function animateGauge(element, max) {
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * (max / 50)
    if (progress >= max) progress = max

    Highcharts.chart(element, {
      chart: { type: "gauge", backgroundColor: "transparent" },
      title: { text: "" },
      yAxis: {
        min: 0,
        max: max,
        plotBands: [
          { from: 0, to: max * 0.4, color: "#ff4d4d" },
          { from: max * 0.4, to: max * 0.75, color: "#ffcc00" },
          { from: max * 0.75, to: max, color: "#00ff9d" },
        ]
      },
      series: [{ data: [progress] }],
    })

    if (progress >= max) clearInterval(interval)
  }, 50)
}

function finishTest() {
  download.value = (Math.random() * 500).toFixed(2)
  upload.value = (Math.random() * 100).toFixed(2)

  Highcharts.chart("download-chart", {
    chart: { type: "gauge", backgroundColor: "transparent" },
    title: { text: "" },
    yAxis: { min: 0, max: 500 },
    series: [{ data: [parseFloat(download.value)] }]
  })

  Highcharts.chart("upload-chart", {
    chart: { type: "gauge", backgroundColor: "transparent" },
    title: { text: "" },
    yAxis: { min: 0, max: 100 },
    series: [{ data: [parseFloat(upload.value)] }]
  })

  testing.value = false
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.card {
  background: #1e293b;
  padding: 25px;
  border-radius: 14px;
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.header-card {
  text-align: center;
}

.sub {
  margin-top: -8px;
  opacity: 0.6;
}

.charts-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.chart-box h3 {
  text-align: center;
  margin-bottom: 10px;
}

.value {
  text-align: center;
  margin-top: 15px;
  font-size: 26px;
  font-weight: bold;
  color: #00ff9d;
}

.btn {
  width: 100%;
  padding: 15px;
  font-size: 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: linear-gradient(90deg, #0061ff, #60efff);
  color: white;
  font-weight: bold;
  box-shadow: 0px 0px 15px rgba(0, 180, 255, 0.4);
  transition: transform .2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  transform: scale(1.03);
}

.loader {
  width: 22px;
  height: 22px;
  border: 3px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
