<template>
  <div class="home">
    <div class="background"></div>
    <div class="background-black"></div>
    <img src="@/assets/effects/baan.png" class="effects effects-0">
    <img src="@/assets/effects/dodon.png" class="effects effects-1">
    <img src="@/assets/effects/shaaa.png" class="effects effects-2">
    <img src="@/assets/effects/zuban.png" class="effects effects-3">
    <img src="@/assets/effects/zudoon.png" class="effects effects-4">
    <div class="container">
      <div class="logo">
        <div class="logo-title">
          COMIC SE
        </div>
        <div class="logo-subtitle">
          is the new style comic catching your gaze and sounding
        </div>
      </div>
      <div class="copy">
        COMIC SEはあなたの視線を学習して、<br/>場面に応じた効果音を鳴らす新しい電子漫画アプリです
      </div>
      <el-button @click="$router.push('/calibrate')" >キャリブレーションする</el-button>
      <el-button>漫画を読む</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
}
</script>
<style scoped>
  .home {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .background {
    position: absolute;
    z-index: -3;
    background: linear-gradient(45deg, #409EFF, #783EFF);
    width: 100%;
    height: 400px;
  }
  .background-black {
    position: absolute;
    z-index: -2;
    background: #202020;
    width: 100%;
    height: 48px;
  }
  .container {
    width: 600px;
    text-align: center;
  }
  .effects {
    position: absolute;
    z-index: -1;
  }
  .effects-0 {
    top: 150px;
    right: -50px;
    width: 480px;
    opacity: 0.8;
  }
  .effects-1 {
    top: 230px;
    left: 100px;
    width: 320px;
    opacity: 0.8;
  }
  .effects-2 {
    top: 20px;
    left: 200px;
    width: 400px;
    opacity: 0.3;
  }
  .effects-3 {
    top: 20px;
    right: 200px;
    width: 400px;
    opacity: 0.5;
  }
  .effects-4 {
    top: 400px;
    left: 50px;
    width: 400px;
    opacity: 0.9;
  }
  .logo {
    text-align: left;
    padding-top: 160px;
    font-family: 'Roboto', 'Noto Sans JP', sans-serif;
    padding-bottom: 128px;
    color: #ffffff;
  }
  .logo-title {
    text-align: center;
    font-size: 90px;
    font-weight: 900;
  }
  .logo-subtitle {
    font-size: 32px;
  }
  .copy {
    font-size: 24px;
    padding-bottom: 64px;
  }
</style>
