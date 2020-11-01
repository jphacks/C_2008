<template>
  <div class="home">
    <div class="background"></div>
    <div class="background-black"></div>
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
    z-index: -1;
    background: linear-gradient(45deg, #409EFF, #783EFF);
    width: 100%;
    height: 400px;
  }
  .background-black {
    position: absolute;
    z-index: 0;
    background: #202020;
    width: 100%;
    height: 48px;
  }
  .container {
    width: 600px;
    text-align: center;
  }
  .logo {
    text-align: left;
    padding-top: 196px;
    font-family: 'Roboto', 'Noto Sans JP', sans-serif;
    padding-bottom: 128px;
    color: #ffffff;
  }
  .logo-title {
    font-size: 48px;
  }
  .logo-subtitle {
    font-size: 32px;
  }
  .copy {
    font-size: 24px;
    padding-bottom: 64px;
  }
</style>
