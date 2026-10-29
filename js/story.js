/* Official revision 2. Empty choices mean UI continuation or settlement, never player speech. */
(function(root,factory){const v=factory();if(typeof module==='object'&&module.exports)module.exports=v;else root.CityStory=v;})(globalThis,function(){'use strict';return {
  "ruoqing": [
    {
      "id": "story1",
      "title": "被取消的花束",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": true,
      "previous": null,
      "location": "market",
      "slot": 0,
      "deadline": null,
      "nodes": [
        {
          "text": "花商把取消的花束推回來。若晴捏著卡片一角，忽然笑了：「花倒是很準時，說不要的人比較慢。」她把一枝歪掉的桔梗扶正。",
          "choices": [
            {
              "label": "把歪掉的花枝扶好，問她還能賣給誰",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "說這束花看起來像臨時被放鴿子的自己",
              "next": 2,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "「你比花商還會算。」她笑出聲，把花束分成兩份。「這份留給社區。另一份……我想自己帶回去。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她抬眼看你，嘴角動了一下。「原來今天不只它一個。那就別站在這裡一起垂頭喪氣了，陪我挑個花瓶？」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story2",
      "title": "空白的卡片",
      "key": false,
      "minimum": 12,
      "trust": 5,
      "willing": true,
      "retry": true,
      "previous": "story1",
      "location": "cafe",
      "slot": 1,
      "deadline": null,
      "nodes": [
        {
          "text": "若晴攤開一張空白卡片。「給自己的花，寫祝早日康復會不會太嚴重？」她畫了一小朵花，又把筆遞給你。「你只能寫一行。」",
          "choices": [
            {
              "label": "寫：今天也有一件做得不錯的事",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "寫：本花束不接受退貨",
              "next": 3,
              "effect": "respectful"
            },
            {
              "label": "說你想寫的話，一行不太夠",
              "next": 4,
              "effect": "romance"
            }
          ]
        },
        {
          "text": "她讀了兩遍。「今天我沒有把剩下的花全送人。這算嗎？」說完又把卡片拉近，認真寫下日期。",
          "choices": [],
          "next": 2
        },
        {
          "text": "離開前，她把剛才挑的那枝花遞給你。「這枝沒有算在課程材料裡。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她差點把咖啡灑出來。「你連安慰人都附售後條款。」卡片卻沒有被她丟掉，反而放進了透明套裡。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她握著杯子，等了一會。「那先別寫。」聲音輕下來。「等你想好，我再拿一張給你。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 3
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story3",
      "title": "退回的花材",
      "key": false,
      "minimum": 22,
      "trust": 12,
      "willing": true,
      "retry": true,
      "previous": "story2",
      "location": "community",
      "slot": 2,
      "deadline": null,
      "nodes": [
        {
          "text": "退回的花材堆在社區桌上，孩子跑去找膠帶。若晴把剪刀推給你：「別剪太短，我今天已經弄壞兩枝了。」她看著你的手，補了一句：「不然我會很沒面子。」",
          "choices": [
            {
              "label": "請她示範一次，再照她的方法剪",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "覺得短枝也好看，試著做一束小花",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "自作主張把花材全剪短，催她快點",
              "next": 3,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "「這樣就對了。」她扶了一下你的手腕，隨即鬆開。「剛才那兩枝不准記進你的學習筆記。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她原先想阻止，看到成形後卻停住了。「我好像一直只想把它救回原來的樣子。」她把小花放到窗邊。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她把剩下的花收到自己面前。「先停一下。我要的是幫手，不是另一個催我的人。」",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story4",
      "title": "沒有到貨的花",
      "key": false,
      "minimum": 30,
      "trust": 18,
      "willing": true,
      "retry": true,
      "previous": "story3",
      "location": "market",
      "slot": 0,
      "deadline": null,
      "nodes": [
        {
          "text": "預訂的花沒有到。若晴對著電話說「我來想辦法」，掛斷後卻靠著攤位半天沒動。「如果我把花藝課改成看葉子，大家會退費嗎？」",
          "choices": [
            {
              "label": "陪她挑葉材，試做一份讓她判斷",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "直說課程應該延期，不必每次硬撐",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "她挑掉你放進去的一片葉子。「太擠了。」又加了一片細葉。「不過，你這個方向可以。我先拍給學員看。」",
          "choices": [],
          "next": 2
        },
        {
          "text": "離開前，她把剛才挑的那枝花遞給你。「這枝沒有算在課程材料裡。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她皺了眉，沒有立刻回答。走了兩個攤位後，她拿出手機。「你說得對一半。我問問大家能不能接受換材料，再決定。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story5",
      "title": "留給自己的花藝課",
      "key": false,
      "minimum": 38,
      "trust": 24,
      "willing": true,
      "retry": true,
      "previous": "story4",
      "location": "community",
      "slot": 2,
      "deadline": null,
      "nodes": [
        {
          "text": "花藝課報名表上第一次印著若晴自己的名字。她先檢查了三遍，才把你的名字填進助手欄。「我還沒問你。這樣是不是有點狡猾？」",
          "choices": [
            {
              "label": "說助手可以，但下課要請自己吃點心",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "說更想坐在第一排，看看她上課的樣子",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "說最近忙，不能答應每次都到",
              "next": 3,
              "effect": "pause"
            }
          ]
        },
        {
          "text": "「成交。可是得先把地掃乾淨。」她低頭掩住笑，把你的名字描深了一點。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她停下筆。「你這樣看著，我可能會忘詞。」過了一會，她真的替第一排留了一張椅子。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她把筆蓋扣好，眼裡有一瞬間的失落。「好，那這次先不印助手。」又抬頭補道：「有空來坐第一排，還是可以。」",
          "choices": [],
          "result": "not_occurred",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story6",
      "title": "未說完的家庭來電",
      "key": false,
      "minimum": 46,
      "trust": 30,
      "willing": true,
      "retry": true,
      "previous": "story5",
      "location": "cafe",
      "slot": 1,
      "deadline": null,
      "nodes": [
        {
          "text": "電話又亮了。若晴沒有接，先把家裡的接送時間傳了出去。咖啡涼了，她突然問：「如果我不像你以為的那麼溫柔呢？」",
          "choices": [
            {
              "label": "說自己早就見過她嫌棄剪壞花枝的樣子",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "說自己也會累，不想一直扮演能解決事情的人",
              "next": 4,
              "effect": "respectful"
            },
            {
              "label": "急著說她離開原本的生活就會輕鬆",
              "next": 5,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "她愣了一下，笑意慢慢回來。「那你還來？」這次她沒有移開視線。",
          "choices": [
            {
              "label": "說不是因為她總能照顧別人才想見她",
              "next": 2,
              "effect": "romance"
            },
            {
              "label": "笑說先喝完咖啡，沒把後半句說出口",
              "next": 3,
              "effect": "doubt"
            }
          ]
        },
        {
          "text": "她沒有接話，卻把旁邊的椅子拉近了些。「那今天再坐一下。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 3
          }
        },
        {
          "text": "她收回視線，輕輕嗯了一聲。剩下的咖啡，你們都喝得比平常慢。",
          "choices": [],
          "result": "not_occurred",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她把手機翻面。「那今天誰都不用解決什麼。」她往旁邊挪了點，留出能一起看窗外的位置。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她的手停在杯邊。「你把事情說得太簡單了。」沉默拉長，這次她沒有替你圓場。",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story7",
      "title": "花束裡沒有寄出的卡片",
      "key": true,
      "minimum": 55,
      "trust": 40,
      "willing": true,
      "retry": true,
      "previous": "story6",
      "location": "community",
      "slot": 2,
      "deadline": null,
      "nodes": [
        {
          "text": "若晴把那張一直沒寄出的卡片放到你面前。「不是要交給以前那個人的。」她指尖壓著信封，聲音很輕。「有些話，我想當面說。我想更常見到你，但家裡的事還需要我自己慢慢理清。」",
          "choices": [
            {
              "label": "說自己也想靠近她，願意一起商量見面的方式",
              "next": 1,
              "effect": "romance"
            },
            {
              "label": "說這段相處很珍貴，想繼續做她的朋友",
              "next": 2,
              "effect": "friendship"
            },
            {
              "label": "承認自己還沒想清楚，暫時無法回答",
              "next": 3,
              "effect": "pause"
            },
            {
              "label": "要求她先處理好家庭，才能證明心意",
              "next": 4,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "她終於放開信封。「那下次不要總等我找藉口拿花給你。」笑容裡還有緊張，這次卻沒有藏起來。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 3
          }
        },
        {
          "text": "她安靜了一會，把卡片重新收好。「那你還是要來看我的花藝課。朋友的第一排也不能空著。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 0
          }
        },
        {
          "text": "她點了點頭，目光落回桌面。「那我今天先不把它交給你。不是生氣，是我也會捨不得。」",
          "choices": [],
          "result": "not_occurred",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她把信封放回袋裡。「我不是拿自己的生活來換一個答案的。」她站起來，沒有再邀你同行。",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    }
  ],
  "yian": [
    {
      "id": "story1",
      "title": "年鑑缺角",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": true,
      "previous": null,
      "location": "library",
      "slot": 0,
      "deadline": null,
      "nodes": [
        {
          "text": "以安把缺了一角的年鑑轉向你。「這裡應該是設計師的名字。有人留了整頁作品，偏偏把人拿走了。」她敲敲紙邊。「你第一眼看見的是什麼？」",
          "choices": [
            {
              "label": "指出版面留下的不自然空隙",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "說這缺角反而比整頁廣告更吸引人",
              "next": 2,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "「很好，至少你沒有說復古。」她抽出另一份影本。「幫我看看這個位置，兩份是不是同一個人改的？」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "「殘缺有戲劇性，被刪掉的人未必喜歡。」她挑眉，接著把年鑑推近。「不過這個觀察可以當開場。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story2",
      "title": "展櫃的重影",
      "key": false,
      "minimum": 12,
      "trust": 5,
      "willing": true,
      "retry": true,
      "previous": "story1",
      "location": "mall",
      "slot": 1,
      "deadline": null,
      "nodes": [
        {
          "text": "百貨展櫃映出你們的影子。以安看著自己的草圖，突然把你往左拉了一步。「現在呢？剛才那個角度把字擋掉了。連展覽都在考驗人的頸椎。」",
          "choices": [
            {
              "label": "照她說的退一步，指出仍看不清的小字",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "故意擺出導覽員姿勢，向她介紹這份作品",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "她蹲下確認，嘆了口氣。「好，這次算你贏。我回去把字放大，不能只怪觀眾站錯地方。」",
          "choices": [],
          "next": 2
        },
        {
          "text": "她在筆記角落畫了個小記號。「這個算你的意見。下次來檢查我有沒有改。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她忍了幾秒還是笑出聲。「台詞太浮誇。再來一次，假裝我真的不認識作者。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story3",
      "title": "匿名邀請",
      "key": false,
      "minimum": 22,
      "trust": 12,
      "willing": true,
      "retry": true,
      "previous": "story2",
      "location": "community",
      "slot": 2,
      "deadline": null,
      "nodes": [
        {
          "text": "社區信箱裡的匿名邀請，只寫了作品名稱。以安把信封拎在手裡：「我想去。不過，你要是打算一路勸我別去，現在就說。」",
          "choices": [
            {
              "label": "說想陪她去，也想聽她當面問清楚",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "提醒她對方連名字都不肯寫，先問清楚再赴約",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "搶過信封，說自己替她拒絕",
              "next": 3,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "她把地址拍給你。「八點。你可以提問，不准替我回答。」停了一拍，又補：「我不是找保鑣，是找你。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她本來要反駁，指尖卻停在空白署名處。「這一點，我沒辦法替他辯護。」她拿起手機，決定先回信。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她伸手拿回去。「我剛才問的是你的意見，不是請你接管。」",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story4",
      "title": "頁邊的批註",
      "key": false,
      "minimum": 30,
      "trust": 18,
      "willing": true,
      "retry": true,
      "previous": "story3",
      "location": "library",
      "slot": 0,
      "deadline": null,
      "nodes": [
        {
          "text": "年鑑頁邊有一段尖銳批註。以安認出筆跡，讀完卻笑了。「他居然還記得我討厭圓體字。可惜別的都記錯了。」她把筆轉了一圈。「你也覺得我太固執？」",
          "choices": [
            {
              "label": "說她有時把不同意見都當成不懂設計",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "說她的固執讓作品有辨識度，但不是每次都值得",
              "next": 2,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "她的笑收住了。「你可以舉例嗎？」她真的翻開筆記，等你指出上次改稿時的那一頁。",
          "choices": [
            {
              "label": "提起上次展櫃的小字：她先怪自己站錯位置",
              "next": 3,
              "effect": "respectful"
            },
            {
              "label": "坦白說自己有時只是想跟她鬥嘴",
              "next": 4,
              "effect": "doubt"
            }
          ]
        },
        {
          "text": "「這句話很會留後路。」她靠回椅背。「不過，我聽得進去。今天先不替自己辯護。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她翻到那頁，用筆劃掉一句註記。「我當時確實沒聽完。」她把筆擱下。「下次你可以直接提醒我，不用先包裝成稱讚。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "「這跟批評是兩回事。」她挑眉，把年鑑合上。「我願意聽實話，但不想猜哪句只是逗我。」",
          "choices": [],
          "result": "not_occurred",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story5",
      "title": "有署名的條件",
      "key": false,
      "minimum": 38,
      "trust": 24,
      "willing": true,
      "retry": true,
      "previous": "story4",
      "location": "mall",
      "slot": 1,
      "deadline": null,
      "nodes": [
        {
          "text": "合作方願意展出作品，條件卻是縮小她的署名。以安把合約攤平：「我有一點想接。場地真的很好。」她看向你。「別立刻露出那種表情，先聽完。」",
          "choices": [
            {
              "label": "請她列出最不能退讓的一條，再一起看其他條款",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "說接案不是投降，但這份曝光未必值得",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "說不必這麼計較，反正有人看到作品就好",
              "next": 3,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "她把署名位置圈了起來。「這條。其他的可以談。」她拿起電話，撥號前用筆碰了碰你的手背。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她盯著展場照片很久。「你說得輕鬆。」過一會，又把照片翻面。「但我知道自己會在開幕那天一直看那個角落。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她合上合約。「名字不見的時候，你還會記得是誰做的嗎？」她沒有等你回答。",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story6",
      "title": "舊草圖的背面",
      "key": false,
      "minimum": 46,
      "trust": 30,
      "willing": true,
      "retry": true,
      "previous": "story5",
      "location": "community",
      "slot": 2,
      "deadline": null,
      "nodes": [
        {
          "text": "舊草圖背面有一張被擦掉的合照。以安把紙翻回正面，卻又推給你。「不是不能看。只是我不太擅長解釋自己也曾經判斷失準。」",
          "choices": [
            {
              "label": "說自己喜歡她現在這種不急著給標準答案的樣子",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "把紙推回她手邊，說願意聽，但今天也能只改稿",
              "next": 4,
              "effect": "respectful"
            },
            {
              "label": "問她是不是還想回到照片裡的關係",
              "next": 5,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "她抬頭看你，沒有接玩笑。「你是在說設計，還是在說我？」",
          "choices": [
            {
              "label": "說是在說她，約她一起吃晚餐",
              "next": 2,
              "effect": "romance"
            },
            {
              "label": "說剛才只是在稱讚稿子，沒敢再往下說",
              "next": 3,
              "effect": "doubt"
            }
          ]
        },
        {
          "text": "「終於不是模糊的形容詞了。」她拿出手機，問你哪天有空。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 3
          }
        },
        {
          "text": "她合上資料夾。「那今天就先到這裡。下次別把我當成閱讀理解。」",
          "choices": [],
          "result": "not_occurred",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "「你真的很會替人留一張空白頁。」她鬆了口氣。「今天先改稿。下次，我請你吃飯再說。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她把紙壓進資料夾。「你跳得太快了。我還沒說完自己的事。」",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story7",
      "title": "被擦掉的署名",
      "key": true,
      "minimum": 55,
      "trust": 40,
      "willing": true,
      "retry": true,
      "previous": "story6",
      "location": "library",
      "slot": 0,
      "deadline": null,
      "nodes": [
        {
          "text": "以安把修復的年鑑放在桌上，新的註記清楚寫著她的名字。「署名這件事，我處理完了。」她沒有收書。「還有一件。我想約你，跟改稿無關。你會來嗎？」",
          "choices": [
            {
              "label": "明確答應，說自己也一直期待這樣的邀約",
              "next": 1,
              "effect": "romance"
            },
            {
              "label": "說更喜歡一起創作的友情，不想讓她誤會",
              "next": 2,
              "effect": "friendship"
            },
            {
              "label": "說自己心動，卻還不敢承諾下一步",
              "next": 3,
              "effect": "pause"
            },
            {
              "label": "說可以約會，但她應該少接工作多陪自己",
              "next": 4,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "她笑了，語速比平常快一點。「那星期六。我選地方，你不准帶工作筆電。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 3
          }
        },
        {
          "text": "她用指節敲了一下封面。「明白。那我就可以放心批評你的排版了。」停了一會，她才把書收進袋裡。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 0
          }
        },
        {
          "text": "她看了你一陣。「那這次不先替星期六取名字。」她把餐廳地址傳來。「等你想清楚，再約。」",
          "choices": [],
          "result": "not_occurred",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她把手機放下。「我的邀請沒有附上辭職申請。這個條件，我不接受。」",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    }
  ],
  "zhiyan": [
    {
      "id": "story1",
      "title": "少一點糖的清單",
      "key": false,
      "minimum": 0,
      "trust": 0,
      "willing": true,
      "retry": true,
      "previous": null,
      "location": "market",
      "slot": 1,
      "deadline": null,
      "nodes": [
        {
          "text": "芷妍拎起供應商送來的清單：「又是少一點糖。大家都這樣寫，我乾脆賣麵粉好了。」她看見那行熟悉的字，笑聲停了一下。",
          "choices": [
            {
              "label": "接話說麵粉要附試吃，順便幫她核對數量",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "問她這一單是不是讓她想到以前的人",
              "next": 2,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "「試吃麵粉的名額留給你。」她拿回筆，重新把漏算的一項圈起來。「這個先別搬，我還沒決定要不要做。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她折起清單。「有一點。你觀察力可以不要總挑這種時候上班嗎？」過了一會，她還是把那張紙留在桌上。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story2",
      "title": "太像從前的味道",
      "key": false,
      "minimum": 12,
      "trust": 5,
      "willing": true,
      "retry": true,
      "previous": "story1",
      "location": "cafe",
      "slot": 2,
      "deadline": null,
      "nodes": [
        {
          "text": "芷妍端出兩盤幾乎一樣的甜點。「左邊是以前的配方，右邊是現在的。先吃，不准看我表情作弊。」她自己卻一直看著你。",
          "choices": [
            {
              "label": "選比較酸的那款，說吃完還想再吃一口",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "說舊配方更順口，不想為了鼓勵她說謊",
              "next": 3,
              "effect": "respectful"
            },
            {
              "label": "只顧稱讚她漂亮，沒認真試味道",
              "next": 4,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "她先露出笑，又急忙裝作記錄分數。「記下了，你不怕酸。以後不能假裝自己喜歡所有口味。」",
          "choices": [],
          "next": 2
        },
        {
          "text": "她把一小份試作品裝進紙袋。「路上吃。心得明天再交，不准只寫好吃。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她的筆停住。「真的？」她也吃了一口，沉默片刻。「好，那我們找出差在哪裡。不是每個新開始都得把以前全倒掉。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她把盤子往回收了些。「我今天是請你試吃，不是請你轉移話題。」",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story3",
      "title": "臨時加單",
      "key": false,
      "minimum": 22,
      "trust": 12,
      "willing": true,
      "retry": true,
      "previous": "story2",
      "location": "community",
      "slot": 2,
      "deadline": null,
      "nodes": [
        {
          "text": "社區臨時加單。芷妍算到第三遍，突然把計算機推給你。「你來。我再看下去，連十二乘八都想跟它吵架。」",
          "choices": [
            {
              "label": "接過計算機，把交貨拆成兩批給她比較",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "說這個數量不可能準時，建議她退掉一半",
              "next": 2,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "她挨過來看螢幕，肩膀碰到你的手臂也沒退。「這樣能睡滿六小時。好，這版我敢接。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她先瞪了你一眼，接著自己按了一遍。「討厭，你算得對。」她拿起電話，示意你先別走。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story4",
      "title": "被刪去的步驟",
      "key": false,
      "minimum": 30,
      "trust": 18,
      "willing": true,
      "retry": true,
      "previous": "story3",
      "location": "market",
      "slot": 1,
      "deadline": null,
      "nodes": [
        {
          "text": "泛黃食譜上有一段被她刪去的步驟。芷妍讀到一半，指著頁邊笑：「這個人連烤箱預熱都要寫成情詩。」笑完卻沒翻頁。",
          "choices": [
            {
              "label": "問她當年為什麼把那一步刪掉",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "打趣說可以把情詩保留，步驟另外重寫",
              "next": 3,
              "effect": "respectful"
            },
            {
              "label": "追問寄件人到底還想從她這裡得到什麼",
              "next": 4,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "「太慢。我那時候總怕別人等。」她把現在的時間補在旁邊。「其實多十分鐘，味道就不一樣了。」",
          "choices": [],
          "next": 2
        },
        {
          "text": "她把一小份試作品裝進紙袋。「路上吃。心得明天再交，不准只寫好吃。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她用手肘輕碰你一下。「那請你負責朗讀，我負責笑場。」食譜沒有被她收起來，你們就在攤位邊改了第一頁。",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她把紙翻過去。「我也不知道。可不可以先談我的配方？」",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story5",
      "title": "舊識的邀約",
      "key": false,
      "minimum": 38,
      "trust": 24,
      "willing": true,
      "retry": true,
      "previous": "story4",
      "location": "park",
      "slot": 0,
      "deadline": null,
      "nodes": [
        {
          "text": "公園裡，芷妍說自己答應跟舊識見面。「我會緊張。但有些話，我想自己講完。」她踢了踢腳邊的小石子。「你今天怎麼忽然不說話？」",
          "choices": [
            {
              "label": "承認有點吃味，但想聽她回來以後怎麼說",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "說自己也不知道該怎麼回，只能陪她走一段",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "說她既然答應見面，就不該再找自己",
              "next": 3,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "她轉頭看你，耳朵慢慢紅了。「你倒是挑了個很難讓人接話的時候。」走了幾步，她小聲說：「回來我找你。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 1
          }
        },
        {
          "text": "她放慢腳步。「那就走到前面那棵樹。你不說話的時候，也沒那麼難相處嘛。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她停了下來。「我找你說，是因為在意你。不是請你替我判決。」剩下的路她沒有再開玩笑。",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story6",
      "title": "新的配方",
      "key": false,
      "minimum": 46,
      "trust": 30,
      "willing": true,
      "retry": true,
      "previous": "story5",
      "location": "cafe",
      "slot": 2,
      "deadline": null,
      "nodes": [
        {
          "text": "新配方出爐。芷妍先把偏酸的一份放在你面前。「你上次的表情我記得，比打分數誠實。」她把另一支叉子放在旁邊，像早就決定要跟你分著吃。",
          "choices": [
            {
              "label": "說自己開始分不清是期待甜點，還是期待見她",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "指出果香還能再明顯些，問她敢不敢再試一版",
              "next": 4,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "她低頭切蛋糕，第一刀歪得很明顯。「你這樣問，我很難裝作只是在做顧客調查。」",
          "choices": [
            {
              "label": "說自己想約她，這次不用準備試吃",
              "next": 2,
              "effect": "romance"
            },
            {
              "label": "把剛才的話說成玩笑，低頭吃蛋糕",
              "next": 3,
              "effect": "doubt"
            }
          ]
        },
        {
          "text": "「好。」她回答得太快，自己先笑了。「地點換你挑。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 3
          }
        },
        {
          "text": "她把叉子放回盤邊。「也好，先吃吧。涼了口感會變。」",
          "choices": [],
          "result": "not_occurred",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她把歪掉的一塊塞給你。「敢。但你要留下來洗模具。別想只負責出主意。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        }
      ],
      "officialVersion": 2
    },
    {
      "id": "story7",
      "title": "總是少一點糖的訂單",
      "key": true,
      "minimum": 55,
      "trust": 40,
      "willing": true,
      "retry": true,
      "previous": "story6",
      "location": "community",
      "slot": 2,
      "deadline": null,
      "nodes": [
        {
          "text": "社區分享會結束，舊識把食譜交還給她，也把道歉說完了。芷妍拉下攤位的燈，留了一盞給你。「以後我想做自己喜歡的甜度。還有，打烊以後，你願不願意也留下來？」",
          "choices": [
            {
              "label": "說願意，想跟她一起過工作以外的日子",
              "next": 1,
              "effect": "romance"
            },
            {
              "label": "說想繼續當能說真話的朋友與試吃員",
              "next": 2,
              "effect": "friendship"
            },
            {
              "label": "說自己還有猶豫，現在給不出確定答案",
              "next": 3,
              "effect": "pause"
            },
            {
              "label": "要求她別再見舊識，才肯留下來",
              "next": 4,
              "effect": "intrusive"
            }
          ]
        },
        {
          "text": "她看著你笑，終於不拿甜點當掩護。「那明天休息。不要問新品，我們去吃別人做的早餐。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 0,
            "closeness": 3
          }
        },
        {
          "text": "她點點頭，把最後一盒甜點遞過來。「試吃員沒有離職金，只有這個。」笑過以後，她認真地說：「謝謝你講清楚。」",
          "choices": [],
          "result": "success",
          "delta": {
            "trust": 1,
            "closeness": 0
          }
        },
        {
          "text": "她把燈關掉，沒有立刻轉身。「好。我不想讓你為了今晚的氣氛答應。明天先不用來接我。」",
          "choices": [],
          "result": "not_occurred",
          "delta": {
            "trust": 0,
            "closeness": 0
          }
        },
        {
          "text": "她鬆開拉著你的手。「我把以前的事說完了，不代表要把決定權交出去。」",
          "choices": [],
          "result": "temporary_failure",
          "delta": {
            "trust": 0,
            "closeness": -1
          }
        }
      ],
      "officialVersion": 2
    }
  ]
};});
