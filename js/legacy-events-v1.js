/* Immutable official pre-mainline event snapshots for ownership checks. */
(function(r,f){const v=f();if(typeof module==='object'&&module.exports)module.exports=v;else r.CityLegacyEvents=v;})(globalThis,()=>({
  "ruoqing": [
    {
      "id": "life1",
      "title": "雨後的花材",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": true,
      "previous": null,
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "這批花淋了雨，我想留給社區花藝課，但得趕回家準備晚餐。",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "temporary_failure"
            }
          ]
        },
        {
          "text": "謝謝你陪我整理，下次請來看孩子們的花籃。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "temporary_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "life2",
      "title": "親子花籃",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": true,
      "previous": "life1",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "孩子想親手完成花籃，你願意讓他慢慢試嗎？",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "temporary_failure"
            }
          ]
        },
        {
          "text": "你沒有替他完成，這份耐心很珍貴。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "temporary_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "key",
      "title": "花店門口的界線",
      "key": true,
      "minimum": 100,
      "trust": 50,
      "willing": false,
      "retry": true,
      "previous": "life2",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "我珍惜婚姻，只願保持友情。深厚的朋友也能一起走很久。",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "temporary_failure"
            }
          ]
        },
        {
          "text": "我的答案仍然是友情，謝謝你尊重。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "permanent_failure"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "temporary_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "v03-intimacy",
      "title": "晚一點的熱茶",
      "key": false,
      "minimum": 50,
      "trust": 40,
      "willing": true,
      "retry": false,
      "previous": "life2",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "今晚孩子由家人照顧，我留了一點時間給自己。你願意先聽我說嗎？",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "permanent_failure"
            }
          ]
        },
        {
          "text": "謝謝你願意聽我說。靠近之前，我還需要確認自己的心意，也把生活安排想清楚。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "permanent_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "v03-choice",
      "title": "花店關門後的選擇",
      "key": true,
      "minimum": 65,
      "trust": 55,
      "willing": true,
      "retry": false,
      "previous": "v03-intimacy",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "我已自己釐清婚姻與家庭的下一步，這件事不能由你替我決定。我願意認真走近你，但孩子與工作仍在生活裡。",
          "choices": [
            {
              "label": "我也願意，先談清楚各自的生活與界線",
              "result": "success"
            },
            {
              "label": "我珍惜你，選擇維持友情",
              "result": "not_occurred"
            },
            {
              "label": "要求她現在放棄原有生活",
              "result": "permanent_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "v03-together",
      "title": "為自己留下的一束花",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": false,
      "previous": "v03-choice",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "今天這束花是留給自己的，也想讓你看看。我們把下一次見面的時間說好，不勉強彼此。",
          "choices": [
            {
              "label": "一起安排，也為彼此保留空間",
              "result": "success"
            }
          ]
        }
      ]
    }
  ],
  "yian": [
    {
      "id": "life1",
      "title": "招牌草稿",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": true,
      "previous": null,
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "我正在整理城市招牌畫冊。你能指出看不懂的地方嗎？",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "temporary_failure"
            }
          ]
        },
        {
          "text": "具體的意見比稱讚有用，下一版想再請你看。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "temporary_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "life2",
      "title": "小誌試印",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": true,
      "previous": "life1",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "上次的建議我試過了，這次打算署名發行自己的小誌。",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "temporary_failure"
            }
          ]
        },
        {
          "text": "你尊重我的創作決定，讓我願意分享未完成的作品。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "temporary_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "key",
      "title": "創作與我們",
      "key": true,
      "minimum": 65,
      "trust": 50,
      "willing": true,
      "retry": true,
      "previous": "life2",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "共同改稿讓我更了解你。我願意認真討論關係，也需要保留創作空間。",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "temporary_failure"
            }
          ]
        },
        {
          "text": "我願意和你一起向前，也保留自己的生活。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "temporary_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "v03-intimacy",
      "title": "窗邊留下的座位",
      "key": false,
      "minimum": 50,
      "trust": 40,
      "willing": true,
      "retry": false,
      "previous": "life2",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "今天沒有要你幫忙改稿。我把旁邊的位置留著，想試著和你談談工作以外的我。",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "permanent_failure"
            }
          ]
        },
        {
          "text": "謝謝你願意聽我說。靠近之前，我還需要確認自己的心意，也把生活安排想清楚。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "permanent_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "v03-choice",
      "title": "把需要說出口",
      "key": true,
      "minimum": 65,
      "trust": 55,
      "willing": true,
      "retry": false,
      "previous": "v03-intimacy",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "我想清楚了，願意和你認真交往。獨處不是疏遠；我也會練習主動說我需要你。",
          "choices": [
            {
              "label": "我也願意，先談清楚各自的生活與界線",
              "result": "success"
            },
            {
              "label": "我珍惜你，選擇維持友情",
              "result": "not_occurred"
            },
            {
              "label": "要求她現在放棄原有生活",
              "result": "permanent_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "v03-together",
      "title": "兩個人的留白",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": false,
      "previous": "v03-choice",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "這次交稿後，我沒有把整個週末排滿。要不要一起看展，再各自留半天安靜？",
          "choices": [
            {
              "label": "一起安排，也為彼此保留空間",
              "result": "success"
            }
          ]
        }
      ]
    }
  ],
  "zhiyan": [
    {
      "id": "life1",
      "title": "失敗的麵團",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": true,
      "previous": null,
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "重建烘焙事業後，我還是害怕失敗。這批麵團沒發起來。",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "temporary_failure"
            }
          ]
        },
        {
          "text": "謝謝你陪我記錄原因，沒有急著叫我振作。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "temporary_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "life2",
      "title": "重新開爐",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": true,
      "previous": "life1",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "照上次紀錄調整，今天第一盤成功了。我想先小量預訂。",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "temporary_failure"
            }
          ]
        },
        {
          "text": "你沒有催我擴店。我想邀你一起試新口味。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "temporary_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "key",
      "title": "烤箱熄火以後",
      "key": true,
      "minimum": 100,
      "trust": 50,
      "willing": true,
      "retry": false,
      "previous": "life2",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "過去的經驗讓我在意自己的步調。願意前進，不代表放棄事業與家人。",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "permanent_failure"
            }
          ]
        },
        {
          "text": "我願意和你一起向前，也保留自己的生活。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "permanent_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "v03-intimacy",
      "title": "只留一份的試吃",
      "key": false,
      "minimum": 50,
      "trust": 40,
      "willing": true,
      "retry": false,
      "previous": "life2",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "最後一盤剛出爐。今天可以不講笑話嗎？我想讓你知道我也有害怕的時候。",
          "choices": [
            {
              "label": "先聽你的想法，尊重你的決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "今天先不推進",
              "result": "not_occurred"
            },
            {
              "label": "要求對方照我的安排",
              "result": "permanent_failure"
            }
          ]
        },
        {
          "text": "謝謝你願意聽我說。靠近之前，我還需要確認自己的心意，也把生活安排想清楚。",
          "choices": [
            {
              "label": "我願意記住並尊重這個約定",
              "result": "success"
            },
            {
              "label": "先保持現在的距離",
              "result": "not_occurred"
            },
            {
              "label": "要求對方放棄原有生活",
              "result": "permanent_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "v03-choice",
      "title": "烤箱熄火以後",
      "key": true,
      "minimum": 65,
      "trust": 55,
      "willing": true,
      "retry": false,
      "previous": "v03-intimacy",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "我願意重新相信愛情，和你認真交往。但請陪我嘗試，不要替我經營人生。",
          "choices": [
            {
              "label": "我也願意，先談清楚各自的生活與界線",
              "result": "success"
            },
            {
              "label": "我珍惜你，選擇維持友情",
              "result": "not_occurred"
            },
            {
              "label": "要求她現在放棄原有生活",
              "result": "permanent_failure"
            }
          ]
        }
      ]
    },
    {
      "id": "v03-together",
      "title": "明天也一起試味道",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": false,
      "previous": "v03-choice",
      "location": null,
      "slot": null,
      "deadline": null,
      "nodes": [
        {
          "text": "這份新口味還沒取名字。這次想和你一起試，不是因為我做不到，是因為我想分享。",
          "choices": [
            {
              "label": "一起安排，也為彼此保留空間",
              "result": "success"
            }
          ]
        }
      ]
    }
  ]
}));
