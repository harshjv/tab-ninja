/* global chrome */

const url = require('url')
const parallel = require('async/parallel')

function * iterate (s, e) {
  let index = s

  while (index < e) {
    yield index++
  }
}

function * iterateExcept (s, e, except) {
  let index = s

  while (index < e) {
    if (index === except) {
      index++
      continue
    }

    yield index++
  }
}

const withCurrentWindow = (obj) => Object.assign({ currentWindow: true }, obj)

const getTabIdsFromIndexes = (indexes, cb) => {
  const tasks = indexes.map((index) => (cb) => {
    chrome.tabs.query(withCurrentWindow({ index: index }), (tabs) => {
      cb(null, tabs[0].id)
    })
  })

  parallel(tasks, (err, ids) => {
    if (err) throw err

    cb(ids)
  })
}

const getActiveTabInCurrentWindow = (cb) => {
  chrome.tabs.query(withCurrentWindow({ active: true }), (tabs) => cb(tabs[0]))
}

const getAllTabsInCurrentWindow = (cb) => {
  chrome.tabs.query(withCurrentWindow({
    pinned: false
  }), cb)
}

const getAllTabsInCurrentWindowIncludingPinnedTabs = (cb) => {
  chrome.tabs.query(withCurrentWindow({
    pinned: true
  }), cb)
}

const getTabsWithSameHost = (tab, cb) => {
  const urlObj = url.parse(tab.url)

  chrome.tabs.query(withCurrentWindow({
    url: `${urlObj.protocol}//${urlObj.host}/*`
  }), cb)
}

const getTabsWithSameDomain = (tab, cb) => {
  const urlObj = url.parse(tab.url)

  chrome.tabs.query(withCurrentWindow({
    url: `${urlObj.protocol}//${urlObj.hostname}/*`
  }), cb)
}

const getTabsWithSameURL = (tab, cb) => {
  chrome.tabs.query(withCurrentWindow({ url: tab.url }), cb)
}

const options = [
  {
    title: 'Pinned Tabs',
    query: {
      pinned: true
    }
  },
  {
    title: 'Audible Tabs',
    query: {
      audible: true
    }
  },
  {
    title: 'Muted Tabs',
    query: {
      muted: true
    }
  },
  {
    separator: true
  },
  {
    title: 'Tabs to the Left',
    getIds (cb) {
      getAllTabsInCurrentWindow((tabs) => {
        const totalTabs = tabs.length

        if (totalTabs > 1) {
          getActiveTabInCurrentWindow((tab) => {
            getTabIdsFromIndexes([ ...iterate(0, tab.index) ], cb)
          })
        }
      })
    }
  },
  {
    title: 'Tabs to the Right',
    getIds (cb) {
      getAllTabsInCurrentWindow((tabs) => {
        const totalTabs = tabs.length

        if (totalTabs > 1) {
          getActiveTabInCurrentWindow((tab) => {
            getTabIdsFromIndexes([ ...iterate(tab.index + 1, totalTabs) ], cb)
          })
        }
      })
    }
  },
  {
    title: 'Other Tabs',
    getIds (cb) {
      getAllTabsInCurrentWindow((tabs) => {
        const totalTabs = tabs.length

        if (totalTabs > 1) {
          getActiveTabInCurrentWindow((tab) => {
            getTabIdsFromIndexes([ ...iterateExcept(0, totalTabs, tab.index) ], cb)
          })
        }
      })
    }
  },
  {
    separator: true
  },
  {
    title: 'Tabs to the Left (including pinned tabs)',
    getIds (cb) {
      getAllTabsInCurrentWindowIncludingPinnedTabs((tabs) => {
        const totalTabs = tabs.length

        if (totalTabs > 1) {
          getActiveTabInCurrentWindow((tab) => {
            getTabIdsFromIndexes([ ...iterate(0, tab.index) ], cb)
          })
        }
      })
    }
  },
  {
    title: 'Tabs to the Right (including pinned tabs)',
    getIds (cb) {
      getAllTabsInCurrentWindowIncludingPinnedTabs((tabs) => {
        const totalTabs = tabs.length

        if (totalTabs > 1) {
          getActiveTabInCurrentWindow((tab) => {
            getTabIdsFromIndexes([ ...iterate(tab.index + 1, totalTabs) ], cb)
          })
        }
      })
    }
  },
  {
    title: 'Other Tabs (including pinned tabs)',
    getIds (cb) {
      getAllTabsInCurrentWindowIncludingPinnedTabs((tabs) => {
        const totalTabs = tabs.length

        if (totalTabs > 1) {
          getActiveTabInCurrentWindow((tab) => {
            getTabIdsFromIndexes([ ...iterateExcept(0, totalTabs, tab.index) ], cb)
          })
        }
      })
    }
  },
  {
    separator: true
  },
  {
    title: 'Same Host',
    getIds (cb) {
      getActiveTabInCurrentWindow((tab) => {
        getTabsWithSameHost(tab, (tabs) => {
          if (tabs) {
            const allIds = tabs.map((tab) => tab.id)
            const ids = allIds.filter((id) => id !== tab.id)

            cb(ids)
          }
        })
      })
    }
  },
  {
    title: 'Same Domain',
    getIds (cb) {
      getActiveTabInCurrentWindow((tab) => {
        getTabsWithSameDomain(tab, (tabs) => {
          if (tabs) {
            const allIds = tabs.map((tab) => tab.id)
            const ids = allIds.filter((id) => id !== tab.id)

            cb(ids)
          }
        })
      })
    }
  },
  {
    title: 'Same URL',
    getIds (cb) {
      getActiveTabInCurrentWindow((tab) => {
        getTabsWithSameURL(tab, (tabs) => {
          if (tabs) {
            const allIds = tabs.map((tab) => tab.id)
            const ids = allIds.filter((id) => id !== tab.id)

            cb(ids)
          }
        })
      })
    }
  },
  {
    separator: true
  },
  {
    title: 'Same Host (including this tab)',
    getIds (cb) {
      getActiveTabInCurrentWindow((tab) => {
        getTabsWithSameHost(tab, (tabs) => {
          if (tabs) {
            cb(tabs.map((tab) => tab.id))
          }
        })
      })
    }
  },
  {
    title: 'Same Domain (including this tab)',
    getIds (cb) {
      getActiveTabInCurrentWindow((tab) => {
        getTabsWithSameDomain(tab, (tabs) => {
          if (tabs) {
            cb(tabs.map((tab) => tab.id))
          }
        })
      })
    }
  },
  {
    title: 'Same URL (including this tab)',
    getIds (cb) {
      getActiveTabInCurrentWindow((tab) => {
        getTabsWithSameURL(tab, (tabs) => {
          if (tabs) {
            cb(tabs.map((tab) => tab.id))
          }
        })
      })
    }
  },
  {
    separator: true
  },
  {
    title: 'Highlighted Tabs',
    query: {
      highlighted: true
    }
  },
  {
    separator: true
  },
  {
    title: 'Currently Loading Tabs',
    query: {
      status: 'loading'
    }
  },
  {
    title: 'Already Loaded Tabs',
    query: {
      status: 'complete'
    }
  },
  {
    separator: true
  },
  {
    title: 'Discarded Tabs',
    query: {
      discarded: true
    }
  },
  {
    title: 'Discardable Tabs',
    query: {
      autoDiscardable: true
    }
  }
]

options.map((option) => {
  if (option.separator) {
    chrome.contextMenus.create({
      type: 'separator',
      contexts: [ 'page' ]
    })

    return
  }

  if (option.query) {
    option.getIds = (cb) => {
      chrome.tabs.query(withCurrentWindow(option.query), (tabs) => {
        cb(tabs.map((tab) => tab.id))
      })
    }
  }

  chrome.contextMenus.create({
    title: option.title,
    contexts: [ 'page' ],
    onclick () {
      option.getIds((ids) => chrome.tabs.remove(ids, () => {}))
    }
  })
})
