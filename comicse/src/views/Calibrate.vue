<template>
  <div class="container">
    <div class="calibrate">
      <transition>
        <div v-show="calibrating_step === 2">
          <FaceMesh ref="facemesh" @onready="onReadyCalibrate"/><br/>
          <div style="padding: 0.5em;background: rgba(255,255,255,0.95);border-radius: 10px;font-size: 1.5em;">
            カメラに顔が収まったら画面をクリックしてください
          </div>
        </div>
      </transition>
      <div v-show="calibrating_step >= 2" class="calibrate-screen" @click="calibrate">
        <div class="calibrate-marker"
             v-if="calibrateMarker.pos !== null"
             :style="{left: (calibrateMarker.pos[0] / 100 * screenSize[0] - 16) + 'px', top: (calibrateMarker.pos[1] / 100 * screenSize[1] - 16) + 'px' }"></div>
        <div class="predict-marker"
             v-if="predictMarker.pos !== null"
             :style="{left: (predictMarker.pos[0] / 100 * screenSize[0] - 16) + 'px', top: (predictMarker.pos[1] / 100 * screenSize[1] - 16) + 'px' }"></div>
      </div>
      <transition>
        <div v-show="calibrating_step === 0 || calibrating_step === 5">
          <el-card class="description">
            データ数: {{ calibrateInputs.length }}<br/>
            <!--<el-button type="danger" @click="reset()" round size="mini" plain>データをリセットする</el-button>//-->
            <el-button type="primary" @click="calibrating_step = 1" v-if="calibrating_step === 0">キャリブレーションを行う</el-button>
            <el-button type="primary" @click="calibrating_step = 1" v-else>キャリブレーションをもう一度行う</el-button><br/>
            <!--<el-button type="primary" @click="no_calibrate()">キャリブレーションせずに学習する</el-button>//-->
            <el-button type="primary" @click="$router.push('/viewer')" v-if="calibrating_step === 5">漫画を読む</el-button>
          </el-card>
        </div>
      </transition>
    </div>
    <transition>
      <div class="loading" v-if="!ready">
        <div style="display: flex;flex-direction: row;justify-content: center">
          <el-card style="width: 640px;padding: 32px 0;">
            <img src="@/assets/icons/loading.gif"/><br/>
            学習のための準備をしています<br/>
            しばらくお待ちください
          </el-card>
        </div>
      </div>
    </transition>
    <transition>
      <div class="loading" v-if="calibrating_step === 4">
        <div style="display: flex;flex-direction: row;justify-content: center">
          <el-card style="width: 640px;padding: 32px 0;">
            <img src="@/assets/icons/loading.gif"/><br/>
            学習しています<br/>
            しばらくお待ちください
          </el-card>
        </div>
      </div>
    </transition>
    <el-dialog
      title="キャリブレーション"
      :visible.sync="instruction"
      width="40%">
      <div style="text-align: center;font-size: 2em;color: #0D83FC;padding-bottom: 32px;">青いマーカーを目で追いかけてください</div>
      <ol>
        <li><span style="color: #0D83FC">明るい部屋</span>で，画面中央のカメラに<span style="color: #0D83FC">顔全体が映るように</span>してください</li>
        <li>準備ができたら画面をクリックすると，<span style="color: #0D83FC">青いマーカーが画面中央に現れます</span></li>
        <li>青いマーカーが画面を動き回るので，<span style="color: #0D83FC">マーカーを見続けてください</span></li>
      </ol>
      <p>
        なお，<span style="color: #0D83FC">取得した顔の映像や学習データは，一切サーバー等に送信いたしません</span>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="calibrating_step = 2">OK</el-button>
      </span>
    </el-dialog>
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
        ready: false,
        calibrating_step: 0,
        screenSize: null,
        calibrateMarker: {
          pos: null,
        },
        predictMarker: {
          pos: null,
          historyX: [],
          historyY: []
        },
        calibrateEvents: []
      }
    },
    computed: {
      instruction: {
        get: function () { return this.calibrating_step === 1 },
        set: function () { this.calibrating_step = 0 }
      },
      calibrateInputs: function () { return this.$store.state.calibrateInputs },
      calibrateOutputs: function () { return this.$store.state.calibrateOutputs }
    },
    mounted () {
      this.screenSize = [ window.innerWidth, window.innerHeight ]
      this.createCalibrateEvents()
    },
    methods: {
      onReadyCalibrate: function () {
        this.$store.commit("resetCalibrateData")
        Regression.reset()
        this.ready = true
        this.calibrating_step = 1
      },
      createCalibrateEvents: function () {
        // キャリブレーションの範囲倍率
        let scaleX = 0.5
        let scaleY = 0.5
        // 左上から右下に横に走査する手法
        // for (let y = 5 / scaleY; y <= 90 - 5 / scaleY; y+= 20) {
        //   for (let x = 5 / scaleX; x <= 100 - 5 / scaleX; x += 10)
        //     this.calibrateEvents.push([x, y])
        //   for (let x = 100 - 5 / scaleX; x >= 5 / scaleX; x -= 10)
        //     this.calibrateEvents.push([x, y + 10])
        // }

        // 左上から右下に縦に走査する手法
        // for (let x = 5 / scaleX; x <= 100 - 5 / scaleX; x += 20) {
        //   for (let y = 5 / scaleY; y <= 90 - 5 / scaleY; y += 10)
        //     this.calibrateEvents.push([x, y])
        //   for (let y = 90 - 5 / scaleY; y >= 5 / scaleY; y -= 10)
        //     this.calibrateEvents.push([x + 10, y])
        // }

        // 右上から左下に縦に走査する手法
        // for (let x = 100 - 5 / scaleX; x >= 5 / scaleX; x -= 20) {
        //   for (let y = 5 / scaleY; y <= 90 - 5 / scaleY; y += 10)
        //     this.calibrateEvents.push([x, y])
        //   for (let y = 90 - 5 / scaleY; y >= 5 / scaleY; y -= 10)
        //     this.calibrateEvents.push([x + 10, y])
        // }

        // 左上、右下、右上、左下、中上、中下、中左、中右の順で操作(上下の動きを意識)
        for(let i=0; i < 5; i++){
          let scaledX = 5 / scaleX// + i * 5
          let scaledY = 5 / scaleY// + i * 5
          let left = scaledX
          let right = 100 - scaledX
          let up = scaledY
          let down = 100 - scaledY
          let center = 50
          this.calibrateEvents.push([left, up])
          this.calibrateEvents.push([right, down])
          this.calibrateEvents.push([right, up])
          this.calibrateEvents.push([left, down])
          this.calibrateEvents.push([center, up])
          this.calibrateEvents.push([center, down])
          this.calibrateEvents.push([left, center])
          this.calibrateEvents.push([right, center])
        }

        // ランダムな点を見る手法
        // for (let i=0; i<40; i++) {
        //   let x = Math.round(Math.random() * 100)
        //   let y = Math.round(Math.random() * 100)
        //   console.log([x, y])
        //   this.calibrateEvents.push([x, y])
        // }
      },
      calibrate: async function () {
        if (this.calibrating_step !== 2) return
        this.calibrating_step = 3

        this.calibrateMarker.pos = [50, 50]
        await this.$sleep(1000)
        for (let event of this.calibrateEvents) {
            await this.moveCalibrateMarker(event[0], event[1])
            await this.fetchCalibrateData(5)
        }
        this.calibrateMarker.pos = null

        this.calibrating_step = 4
        await this.train()
        this.predict()
      },
      no_calibrate: async function () {
        this.calibrating_step = 4
        await this.train()
        this.predict()
      },
      moveCalibrateMarker: async function (toX, toY) {
        const fromX = this.calibrateMarker.pos[0]
        const fromY = this.calibrateMarker.pos[1]
        const step = Math.ceil(Math.sqrt((toX - fromX) * (toX - fromX) + (toY - fromY) * (toY - fromY)))
        for (let t=0;t<=step;t++) {
          this.calibrateMarker.pos = [(toX - fromX) * t / step + fromX, (toY - fromY) * t / step + fromY]
          await this.$sleep(10)
        }
      },
      fetchCalibrateData: async function (time) {
        await this.$sleep(100)
        console.log([this.calibrateMarker.pos[0], this.calibrateMarker.pos[1]])
        for (let i=0;i<time;i++) {
          const input = await this.$refs.facemesh.getEyes()
          const output = [this.calibrateMarker.pos[0], this.calibrateMarker.pos[1]]
          this.$store.commit("pushCalibrateData", { input: input, output: output })
        }
        await this.$sleep(100)
      },
      train: function () {
        return new Promise(async (resolve) => {
          console.log("学習中です")
          if (this.calibrateInputs.length > 0)
            await Regression.train(this.calibrateInputs, this.calibrateOutputs)
          console.log("学習が終わりました")
          resolve()
        })
      },
      predict: async function () {
        this.calibrating_step = 5
        while (this.calibrating_step === 5) {
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
      reset: function () {
        this.$store.commit("resetCalibrateData")
        Regression.reset()
      }
    }
  }
</script>
<style>
  .container {
    width: 100%;
    height: 100%;
  }
  .calibrate {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
    background-image: url(/comic_pages/empty_comic.png);
    background-position: center;
    background-size: 90% 95%;
    background-repeat: no-repeat;
  }
  .calibrate-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .calibrate-marker {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background-color: #0D83FC;
  }
  .predict-marker {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background-color: orange;
  }
  .description {
    position: absolute;
    top: 16px;
    left: 16px;
    text-align: left;
  }
  .loading {
    position: fixed;
    top: 0;
    left: 0;
    background-color: #ffffff;
    z-index: 5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
  }

  .v-enter-active, .v-leave-active {
    transition: opacity .5s;
  }
  .v-enter, .v-leave-to {
    opacity: 0;
  }
</style>
