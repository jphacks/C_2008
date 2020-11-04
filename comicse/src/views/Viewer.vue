<template>
  <div class="viewer">
    <canvas ref="viewerCanvas"></canvas>
    <FaceMesh ref="facemesh" @onready="onReadyPredict"/><br/>
    カメラに顔が収まったら画面をクリックしてください
    <div class="predict-marker"
         v-if="predictMarker.pos !== null"
         :style="{left: (predictMarker.pos[0] / 100 * window.width - 16) + 'px', top: (predictMarker.pos[1] / 100 * window.height - 16) + 'px' }"></div>
  </div>
</template>
<script>
  import FaceMesh from "../components/FaceMesh"
  import Regression from "../libraries/regression"
  import config from '../../app_config'

  export default {
    components: {
      FaceMesh
    },
    data () {
      return {
        viewerCanvas: null,
        viewerCanvasContext: null,
        window: {
          width: null,
          height: null
        },
        viewerPadding: {
          top: 0,
          left: 0,
          width: 0,
          height: 0
        },
        predictMarker: {
          pos: null,
          historyX: [],
          historyY: []
        },
        comicPages: [
          {
            imagePath: "/comic_pages/page0.jpg", // 漫画の画像のパス
            image: null, // 画像を扱う際に「画像オブジェクト」としてデータを保持する必要があるので変数を作っておく
            frames: [
              {
                soundPath: "/comic_sounds/katakata.wav", // 音声のデータ
                hellSoundPath: "/comic_sounds/hell/gakugaku.m4a", // 地獄モードの音声データパス
                sound: null, // 音声を扱う際に「音声オブジェクト」としてデータを保持する必要があるので変数を作っておく
                points: [
                  { x: 83.1, y: 4 },
                  { x: 98.9, y: 4 },
                  { x: 98.9, y: 25.2 },
                  { x: 83.1, y: 25.2 },
                ]
              },
              {
                soundPath: null,
                hellSoundPath: null,
                sound: null,
                points: [
                  { x: 52, y: 4 },
                  { x: 82.6, y: 4 },
                  { x: 82.6, y: 25.2 },
                  { x: 52, y: 25.2 },
                ]
              },
              {
                soundPath: "/comic_sounds/puchin.wav",
                hellSoundPath: "/comic_sounds/hell/putin.m4a",
                sound: null,
                points: [
                  { x: 52, y: 29.5 },
                  { x: 98.9, y: 29.5 },
                  { x: 98.9, y: 45 },
                  { x: 52, y: 45 },
                ]
              },
              {
                soundPath: "/comic_sounds/mowaaan.mp3",
                hellSoundPath: "/comic_sounds/hell/zowa.m4a",
                sound: null,
                points: [
                  { x: 77.5, y: 48.5 },
                  { x: 98.9, y: 48.5 },
                  { x: 98.9, y: 97.5 },
                  { x: 77.5, y: 97.5 },
                ]
              },
              {
                soundPath: null,
                hellSoundPath: "/comic_sounds/hell/ha.m4a",
                sound: null,
                points: [
                  { x: 52, y: 49 },
                  { x: 77, y: 49 },
                  { x: 77, y: 63.2 },
                  { x: 52, y: 63.2 },
                ]
              },
              {
                soundPath: null,
                hellSoundPath: "/comic_sounds/hell/n.m4a",
                sound: null,
                points: [
                  { x: 52, y: 67 },
                  { x: 77, y: 67 },
                  { x: 77, y: 97.5 },
                  { x: 52, y: 97.5 },
                ]
              },
              {
                soundPath: "/comic_sounds/zuun.mp3",
                hellSoundPath: "/comic_sounds/hell/zuuuun_shunshun.m4a",
                sound: null,
                points: [
                  { x: 1, y: 4 },
                  { x: 48, y: 4 },
                  { x: 48, y: 97.5 },
                  { x: 1, y: 97.5 },
                ]
              }
            ]
          }
        ]
      }
    },
    mounted: async function () {
      this.viewerCanvas = this.$refs.viewerCanvas;
      this.viewerCanvasContext = this.viewerCanvas.getContext('2d');

      // 画面の大きさを取得
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;

      // カンバスの大きさを設定
      this.viewerCanvas.width = this.window.width;
      this.viewerCanvas.height = this.window.height;


      // 画像と音のロード
      this.currentComicPageIndex = 0

      let comicPage = this.comicPages[this.currentComicPageIndex]

      await this.loadComicImage(comicPage.imagePath).then((image) => { comicPage.image = image })
      for (let frame of comicPage.frames) {
        if(frame.soundPath !== null)
          await this.loadComicSound(frame.soundPath).then((sound) => { frame.sound = sound })
      }

      // 画面を表示
      this.viewPage(comicPage)
      //

    },
    methods: {
      // ここに関数を書く
      // sample: function () {
      // }
      loadComicImage: function (comicImagePath) {
        return new Promise((resolve) => {
          console.log("漫画のイメージをロードしています...", comicImagePath)

          let comicImage = new Image()
          comicImage.src = comicImagePath

          comicImage.addEventListener("load", () => {
            console.log("漫画のイメージをロードしました", comicImagePath)
            resolve(comicImage)
          }, false);
        })
      },
      loadComicSound: function (comicSoundPath) {
        if (comicSoundPath === null) return Promise.resolve()
        return new Promise((resolve) => {
          console.log("漫画のサウンドをロードしています...", comicSoundPath)
          let comicSound = new Audio()
          comicSound.src = comicSoundPath
          comicSound.load()

          comicSound.addEventListener("canplaythrough", () => {
            console.log("漫画のサウンドをロードしました", comicSoundPath)
            resolve(comicSound)
          })
        })
      },
      onReadyPredict: function () {
        this.predict()
      },
      predict: async function () {
        while (true) {
          await this.$sleep(10)
          const input = await this.$refs.facemesh.getEyes()
          if (!input) continue
          const predicted_output = await Regression.predict(input)
          if (predicted_output !== null) {
            console.log(predicted_output)
            this.predictMarker.historyX.push(predicted_output[0])
            if (this.predictMarker.historyX.length > config.kalmanNumber) this.predictMarker.historyX.shift()

            this.predictMarker.historyY.push(predicted_output[1])
            if (this.predictMarker.historyY.length > config.kalmanNumber) this.predictMarker.historyY.shift()

            let x = this.predictMarker.historyX.slice(0, this.predictMarker.historyX.length).sort((a, b) => { return a - b })[Math.floor(this.predictMarker.historyX.length / 2)]
            let y = this.predictMarker.historyY.slice(0, this.predictMarker.historyY.length).sort((a, b) => { return a - b })[Math.floor(this.predictMarker.historyY.length / 2)]

            this.predictMarker.pos = [x, y]
          }
        }
      },
      viewPage: function (comicPage) {
        console.log("漫画ページを描写しています...")

        // 元画像の比率を計算して，比率を保持したまま画面中央に表示できるようにする．
        if (this.window.width / this.window.height > comicPage.image.width / comicPage.image.height) { // 画面が漫画よりさらに横長の場合
          console.log("画面が漫画より横長の場合")
          this.viewerPadding.top = 0
          this.viewerPadding.left = (this.window.width - comicPage.image.width / comicPage.image.height * this.window.height) / 2
          this.viewerPadding.width = comicPage.image.width / comicPage.image.height * this.window.height
          this.viewerPadding.height = this.window.height
        } else{
          console.log("画面が漫画より縦長の場合")
          this.viewerPadding.top = (this.window.height - comicPage.image.height / comicPage.image.width * this.window.width) / 2
          this.viewerPadding.left = 0
          this.viewerPadding.width = this.window.width
          this.viewerPadding.height = comicPage.image.height / comicPage.image.width * this.window.width
        }

        // 漫画画像を描写
        this.viewerCanvasContext.drawImage(comicPage.image,
          0, 0, comicPage.image.width, comicPage.image.height,
          this.viewerPadding.left, this.viewerPadding.top, this.viewerPadding.width, this.viewerPadding.height)

        // コマを薄く表示する
        this.viewerCanvasContext.fillStyle = '#0000cd10'
        for (let frame of comicPage.frames) {

          this.viewerCanvasContext.beginPath()
          this.viewerCanvasContext.moveTo(
            frame.points[0].x / 100 * this.viewerPadding.width + this.viewerPadding.left,
            frame.points[0].y / 100 * this.viewerPadding.height + this.viewerPadding.top)
          for (let j=1;j<frame.points.length;j++)
            this.viewerCanvasContext.lineTo(
              frame.points[j].x / 100 * this.viewerPadding.width + this.viewerPadding.left,
              frame.points[j].y / 100 * this.viewerPadding.height + this.viewerPadding.top)

          this.viewerCanvasContext.fill()
        }
      },
    }
  }
</script>
<style type="text/css" scoped>
  .viewer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
</style>
