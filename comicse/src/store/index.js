import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    calibrateInputs: [],
    calibrateOutputs: [],
    weight: null,
  },
  mutations: {
    resetCalibrateData: function ( state ) {
      state.calibrateInputs = []
      state.calibrateOutputs = []
    },
    pushCalibrateData: function ( state, payload ) {
      if (payload && payload.input && payload.output) {
        state.calibrateInputs.push(payload.input)
        state.calibrateOutputs.push(payload.output)
      }
    },
    setWeight: function ( state, payload ) {
      state.weight = payload.weight
    }
  },
  actions: {
  },
  modules: {
  }
})
