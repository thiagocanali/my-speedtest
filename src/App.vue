<template>
  <div class="container">
    <h1>Speedtest com Vue + Highcharts</h1>
    <Speedtest />
  </div>
</template>

<script setup>
import Speedtest from "./components/Speedtest.vue";
</script>

<style>
body {
  margin: 0;
  background: #0f172a;
  color: white;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
}
</style>
