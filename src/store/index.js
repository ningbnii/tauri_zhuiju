import { createStore } from 'vuex'
import state from './state'
import * as getters from './getters'
import * as actions from './actions'
import mutations from './mutations'
import persistedState from 'vuex-persistedstate'

const debug = process.env.NODE_ENV !== 'production'

export default createStore({
  state,
  getters,
  actions,
  mutations,
  modules: {},
  plugins: [
    persistedState({
      storage: window.localStorage,
    }),
  ],
  strict: debug,
})
