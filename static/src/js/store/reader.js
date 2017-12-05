import parseLinkHeader from 'parse-link-header';
import qs from 'query-string';
import parseURN from '../urn';


function rsplit(s, sep, maxsplit) {
  const split = s.split(sep);
  return maxsplit ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit)) : split;
}

module.exports = {
  state: {
    textSize: 'md',
    sidebarLeftOpened: true,
    sidebarRightOpened: true,
    passage: null,
    rightPassage: null,
    passageLoading: false,
    rightPassageLoading: false,
    passageError: null,
    rightPassageError: null,
    versions: null,
  },
  actions: {
    async loadPassage(context, urn) {
      const pagination = {};
      const url = `/library/passage/${urn}/json/`;
      const resp = await fetch(url);
      let passage;
      if (resp.status >= 200 && resp.status < 300) {
        if (resp.headers.has('link')) {
          const links = parseLinkHeader(resp.headers.get('link'));
          if (links.prev) {
            pagination.prev = {
              url: links.prev.url,
              urn: links.prev.urn,
              ref: rsplit(links.prev.urn, ':', 2).slice(-1)[0],
            };
          }
          if (links.next) {
            pagination.next = {
              url: links.next.url,
              urn: links.next.urn,
              ref: rsplit(links.next.urn, ':', 2).slice(-1)[0],
            };
          }
        }
        passage = await resp.json();
      } else {
        const error = new Error(resp.statusText || resp.status);
        error.response = resp;
        throw error;
      }
      return { ...passage, ...pagination };
    },
    async loadVersions({ commit }, urn) {
      const url = `/library/${urn}/json/`;
      let res = await fetch(url);
      const work = await res.json();
      const e = [];
      work.texts.forEach(({ urn: textUrn }) => {
        e.push(textUrn.replace(`${work.urn}.`, ''));
      });
      const params = qs.stringify({ e });
      const textVectorUrl = `/library/vector/${work.urn}/?${params}`;
      res = await fetch(textVectorUrl);
      const vector = await res.json();
      const texts = Object.values(vector.collections);
      commit('setVersions', texts);
    },
    async setPassage({ dispatch, commit }, urn) {
      commit('setPassageLoading', true);
      const p = parseURN(urn);
      await dispatch('loadVersions', `urn:${p.urnNamespace}:${p.ctsNamespace}:${p.textGroup}.${p.work}`);
      try {
        const passage = await dispatch('loadPassage', urn);
        commit('setPassage', passage);
      } catch (e) {
        commit('setPassageError', 'WHAT');
      } finally {
        commit('setPassageLoading', false);
      }
    },
    async setRightPassage({ dispatch, commit }, urn) {
      commit('setRightPassageLoading', true);
      try {
        if (urn) {
          commit('setRightPassage', await dispatch('loadPassage', urn));
        } else {
          commit('setRightPassage', null);
        }
      } catch (e) {
        commit('setRightPassageError', e.toString());
      } finally {
        commit('setRightPassageLoading', false);
      }
    },
    async setRef({ dispatch, state }, reference) {
      const pending = [];
      pending.push(dispatch('setPassage', `${state.passage.text.urn}:${reference}`));
      if (state.rightPassage) {
        pending.push(dispatch('setRightPassage', `${state.rightPassage.text.urn}:${reference}`));
      }
      return Promise.all(pending);
    },
  },
  mutations: {
    setPassage(state, passage) {
      state.passage = passage;
    },
    setRightPassage(state, passage) {
      state.rightPassage = passage;
    },
    setPassageLoading(state, loading) {
      state.passageLoading = loading;
    },
    setRightPassageLoading(state, loading) {
      state.rightPassageLoading = loading;
    },
    setPassageError(state, error) {
      state.passageError = error;
    },
    setRightPassageError(state, error) {
      state.rightPassageError = error;
    },
    setVersions(state, versions) {
      state.versions = versions;
    },
    setTextSize(state, size) {
      state.textSize = size;
    },
    toggleSidebarLeft(state) {
      state.sidebarLeftOpened = !state.sidebarLeftOpened;
    },
    toggleSidebarRight(state) {
      state.sidebarRightOpened = !state.sidebarRightOpened;
    },
  },
};