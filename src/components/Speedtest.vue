<template>
  <div class="page">
    <h1 class="title">My Speedtest</h1>
    <div class="gauges">
      <div class="card">
        <h3>Download</h3>
        <div ref="downloadGauge" class="gauge"></div>
        <div class="metric">{{ downloadDisplay }} Mbps</div>
      </div>
      <div class="card">
        <h3>Upload</h3>
        <div ref="uploadGauge" class="gauge"></div>
        <div class="metric">{{ uploadDisplay }} Mbps</div>
      </div>
    </div>
    <button @click="startTest" :disabled="running" class="btn">
      {{ running ? "Testando..." : "Iniciar Teste" }}
    </button>
  </div>
</template>

<script>
import Highcharts from "highcharts";
import SolidGauge from "highcharts/modules/solid-gauge";

SolidGauge(Highcharts);

export default {
  name: "Speedtest",
  data() {
    return {
      chartDownload: null,
      chartUpload: null,
      running: false,
      testFile: "https://speed.hetzner.de/100MB.bin",
      downloadDisplay: "0.0",
      uploadDisplay: "0.0",
    };
  },
  mounted() {
    this.createGauges();
  },
  methods: {
    createGauges() {
      const baseGauge = {
        chart: { type: "solidgauge", backgroundColor: "transparent" },
        title: null,
        pane: {
          center: ["50%", "60%"],
          size: "100%",
          startAngle: -90,
          endAngle: 90,
          background: {
            innerRadius: "70%",
            outerRadius: "100%",
            shape: "arc",
            backgroundColor: "#333",
          },
        },
        yAxis: {
          min: 0,
          max: 300,
          lineWidth: 0,
          tickWidth: 0,
          stops: [[1, "#00d4ff"]],
        },
        tooltip: { enabled: false },
        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: -20,
              borderWidth: 0,
              style: { fontSize: "28px", color: "#fff" },
            },
          },
        },
        credits: { enabled: false },
      };

      this.chartDownload = Highcharts.chart(
        this.$refs.downloadGauge,
        Highcharts.merge(baseGauge, {
          series: [{ data: [0] }],
        })
      );

      this.chartUpload = Highcharts.chart(
        this.$refs.uploadGauge,
        Highcharts.merge(baseGauge, {
          yAxis: { max: 300 },
          series: [{ data: [0] }],
        })
      );
    },

    async measureDownload() {
      const start = performance.now();
      const response = await fetch(this.testFile);
      const reader = response.body.getReader();
      let bytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        const elapsed = (performance.now() - start) / 1000;
        const mbps = (bytes * 8) / 1e6 / elapsed;
        this.chartDownload.series[0].points[0].update(mbps);
        this.downloadDisplay = mbps.toFixed(1);
      }

      const totalTime = (performance.now() - start) / 1000;
      const final = (bytes * 8) / 1e6 / totalTime;
      this.downloadDisplay = final.toFixed(1);
      return final;
    },

    async measureUpload() {
      const data = new Uint8Array(5 * 1024 * 1024); // 5 MB
      const start = performance.now();

      await fetch("https://httpbin.org/post", {
        method: "POST",
        body: data,
      }).catch((err) => {
        console.warn("Upload pode falhar por CORS:", err);
      });

      const elapsed = (performance.now() - start) / 1000;
      const mbits = (data.length * 8) / 1e6;
      const mbps = mbits / Math.max(elapsed, 0.01);
      this.chartUpload.series[0].points[0].update(mbps);
      this.uploadDisplay = mbps.toFixed(1);
      return mbps;
    },

    async startTest() {
      this.running = true;
      this.downloadDisplay = "0.0";
      this.uploadDisplay = "0.0";
      this.chartDownload.series[0].points[0].update(0);
      this.chartUpload.series[0].points[0].update(0);

      try {
        const d = await this.measureDownload();
        const u = await this.measureUpload();
        alert(`Resultado:\nDownload: ${d.toFixed(1)} Mbps\nUpload: ${u.toFixed(1)} Mbps`);
      } catch (err) {
        console.error("Erro no teste:", err);
        alert("Erro ao realizar o teste. Veja o console.");
      } finally {
        this.running = false;
      }
    },
  },
};
</script>

<style scoped>
.page {
  background: #111;
  color: #fff;
  padding: 30px;
  text-align: center;
  font-family: Arial, sans-serif;
}
.title {
  font-size: 32px;
  margin-bottom: 20px;
}
.gauges {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
}
.card {
  background: #222;
  padding: 20px;
  border-radius: 12px;
  width: 280px;
}
.card h3 {
  color: #00d4ff;
  margin-bottom: 10px;
}
.gauge {
  width: 260px;
  height: 180px;
  margin: auto;
}
.metric {
  margin-top: 8px;
  font-size: 18px;
}
.btn {
  padding: 12px 24px;
  font-size: 18px;
  background: #00d4ff;
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
