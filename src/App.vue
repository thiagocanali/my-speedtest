<template>
  <div class="container">
    <h1 class="title">🚀 Meu Speedtest</h1>
    <p class="subtitle">Feito com Vue + Highcharts</p>

    <Speedtest />

    <footer class="footer">
      <p>Desenvolvido por Thiago — {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup>
import Speedtest from "./components/Speedtest.vue";
</script>

<style>
body {
  margin: 0;
  background: linear-gradient(135deg, #020617, #0f172a);
  color: white;
  font-family: "Inter", Arial, sans-serif;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.title {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 18px;
  opacity: 0.8;
  margin-bottom: 30px;
}

.footer {
  margin-top: 50px;
  opacity: 0.5;
}
</style>
