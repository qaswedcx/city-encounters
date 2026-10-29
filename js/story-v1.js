/* 三位核心角色的七段原創事件。節點、門檻及結算沿用 life.js。 */
(function(root,factory){const v=factory();if(typeof module==='object'&&module.exports)module.exports=v;else root.CityStoryV1=v;})(globalThis,function(){'use strict';return {
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
          "text": "花商說，每月預留的同一束花突然被取消。若晴認出卡片筆跡，卻默默收進口袋。",
          "choices": [
            {
              "label": "替她把卡片放回信封，不問名字",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "問她是否需要一個安靜的地方整理思緒",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "提議明天再談這張卡片",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "你沒有攤開那張卡片。若晴說：『有些字，等我自己準備好再讀。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "若晴點頭：『我不怕面對，只是不想在市場的喧鬧裡決定。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她收好花束：『謝謝你不急著追問。我會記得。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "若晴請你幫忙挑花，最後卻盯著空白卡片。她說有些話想了很久，仍不知道怎麼開口。",
          "choices": [
            {
              "label": "挑一枝能代表勇氣的花，讓她自行寫字",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "指出空白也可以是完整的答覆",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "把選花留到她想清楚再決定",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "她輕輕轉動花莖：『上次你幫我收起卡片，這次也沒有替我寫。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "若晴說：『我總以為非得交代清楚，原來可以先承認我還在想。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她將空卡放回包裡：『那就不勉強今天完成。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "社區花藝課有熟悉的學員缺席，連花材也退回。若晴記得對方說過，最喜歡有人替自己留一個座位。",
          "choices": [
            {
              "label": "保留學員的座位，但不公開缺席原因",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "協助將花材整理成可日後領取的小束",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "等活動結束再討論缺席的事",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "若晴把花材移到陰涼處：『她的事由她自己說，座位可以先留著。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她笑了：『不替別人安排出席，也不讓心意浪費。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她點頭：『這堂課先讓大家好好完成作品。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "重要花材沒有到貨，若晴得重做作品；那是她一直避談的家庭紀念日。",
          "choices": [
            {
              "label": "一起檢查替代花材的顏色與保存時間",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "問她願不願意只說作品代表誰",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "把花材清單留給她獨自斟酌",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "若晴說：『作品可以重做，但這個日子的意義不能讓別人代替我定義。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她沉默片刻：『是我和家人共享的記憶，不必把它解釋成誰欠了誰。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她說：『我會自己決定要用哪些花。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "臨時開設的社區花藝課裡，若晴發現自己總替別人安排生活，卻忘了想學的事情。",
          "choices": [
            {
              "label": "請她把自己的願望寫進課程表",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "協助她把學員材料與個人計畫分開整理",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "讓她先獨自完成課程安排",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "若晴寫下『每週留一個下午進修』：『這一次，我先替自己留位置。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她把兩份清單夾好：『照顧別人，不該把我自己完全抹掉。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她說：『我需要這一小段空間。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "家庭來電打斷若晴原本想說的計畫。她想完整表達自己的打算，不需要你替她判定對錯。",
          "choices": [
            {
              "label": "把手機放遠，先完整聽她講完",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "確認她希望得到傾聽還是實務協助",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "表示可以等她處理完家事再談",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "她說：『卡片上的字，是提醒我有話該對家人親口說；我的婚姻，我自己負責。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "若晴說：『謝謝你先問我需要什麼。我想先說，不需要裁判。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她道謝：『家庭的事要先回應；我們下次再把話說完。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "社區活動結束時，取消的花束、空白卡片與她寫下的進修願望終於串在一起。若晴說：『那是我曾想寫給自己的話。我已決定和家人好好談，繼續照顧家庭，也留時間學習花藝。至於我們，我希望由我自己說明。』",
          "choices": [
            {
              "label": "告訴她願意在尊重家庭界線下，慢慢探索彼此的心意",
              "next": 1,
              "effect": "romance"
            },
            {
              "label": "祝福她的選擇，明確提出繼續做朋友",
              "next": 2,
              "effect": "friendship"
            },
            {
              "label": "告訴她不必現在定義關係",
              "next": 3,
              "effect": "pause"
            }
          ]
        },
        {
          "text": "若晴看著你：『我願意讓我們更靠近，但不會拿婚姻當作交換條件。我會自己釐清並承擔我的決定。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "若晴笑了：『我也珍惜這份友情。花藝課還有很多事想和你分享。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "若晴收好卡片：『謝謝。我也需要時間，等想清楚再親自告訴你。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "以安在設計年鑑發現熟悉作品，署名被裁掉一角。她很快闔上書：『很久以前的事了。』",
          "choices": [
            {
              "label": "只記下年鑑頁碼，不替她拍照散布",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "問她作品構圖哪一處最難忘",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "讓她先把書放回架上",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "以安說：『你記的是可查證的線索，不是替我發聲。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她指向留白：『那是我反覆修改的細節，名字可以裁掉，思考沒辦法。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她點頭：『今天先不翻那一頁。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "百貨公司新視覺像極以安早年作品，卻沒有署名。她拍下細節，遲遲沒有行動。",
          "choices": [
            {
              "label": "建議先整理作品與展出日期再決定",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "請她說說新案和舊作的實際差異",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "讓她保留照片而不急著公開",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "以安說：『你沒有催我指控誰。證據要比情緒可靠。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她指出字距：『像，不等於相同。我要確認是巧合還是沿用。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她收起手機：『我會再想想。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "社區收到匿名展覽邀請，稱以安是『真正的創作者』，卻未署名寄件人。",
          "choices": [
            {
              "label": "先查證場地和主辦，再回覆是否參加",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "詢問她是否想自己寫回函要求透明",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "將邀請原樣交回，暫不回信",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "以安說：『有人替我喊話，不等於我授權他代表我。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她打開筆記：『這至少讓對話回到我手上。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她把信封收好：『不急著給陌生人我的答案。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "年鑑旁出現手寫批註，指出原作品圖層的微小錯位，只有真正看過草稿的人才知道。",
          "choices": [
            {
              "label": "拍下批註位置，但不擅自追查個資",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "請她比較這段批註和當年合作筆記",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "先讓她獨自核對筆跡",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "以安說：『你注意到界線。線索值得保存，人未必該被追蹤。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她翻出舊筆記：『這個詞彙，像是一起工作過的人。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她說：『謝謝，這一部分我想自己確認。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "百貨公司的新提案允許以安署名，卻要求沿用那套曾經抹去她名字的視覺。",
          "choices": [
            {
              "label": "協助她列出署名、授權與改稿的談判條件",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "建議她設計一張全新的替代提案",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "尊重她暫時不回覆提案",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "以安說：『被看見不是唯一價值，我也要有修改和拒絕的權利。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她眼睛亮了：『我不是只有舊作品。我還能創造下一個版本。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她說：『合約可以慢一點，選擇不該倉促。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "社區分享會前，以安拿出舊草圖。『我不只在意作品，也在意有沒有人理解我為什麼這樣畫。』",
          "choices": [
            {
              "label": "指出草圖中刻意留給行人的閱讀空間",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "問她要不要在分享會說出設計過程",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "讓她先保留不願展示的頁面",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "她說：『你看到的不只是漂亮。你理解我為什麼留白。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她思索：『我可以公開自己的方法，不必公開所有私事。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "以安把草圖翻回：『那幾頁就只給自己看。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "圖書館裡，以安確認匿名邀請來自當年的合作夥伴。對方想補救署名，卻先替她決定公開方式。以安說：『我會用自己的作品說話，先釐清授權，重新辦一場由我署名的展。至於我們的關係，也該由我說。』",
          "choices": [
            {
              "label": "坦白想更靠近，並尊重她獨立創作的界線",
              "next": 1,
              "effect": "romance"
            },
            {
              "label": "告訴她自己珍惜這段能坦誠討論的友情",
              "next": 2,
              "effect": "friendship"
            },
            {
              "label": "表示關係不必今天定義",
              "next": 3,
              "effect": "pause"
            }
          ]
        },
        {
          "text": "以安回答：『我願意試著讓你靠近，但不會把創作自主權交出去。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "以安說：『朋友也可以真正理解作品。我很珍惜這樣的同行。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "以安闔上年鑑：『我也想再想想。答案不是一份設計提案的截止日。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "供應商轉交匿名材料清單，上面寫著『照以前那樣，但糖再少一點』。芷妍認出句子，卻把紙折起來。",
          "choices": [
            {
              "label": "幫她核對材料數量，不追問寄件人",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "問她這句話與現在的配方有什麼不同",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "讓清單先放進她的工作袋",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "芷妍說：『你竟然先看份量。這是我能自己處理的訂單。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她想了想：『以前是討好一個人的口味，現在我想做我喜歡的甜度。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她收好紙條：『等我願意再打開。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "芷妍端出新甜點，說它『太像從前』，問你是否還應保留這個味道。",
          "choices": [
            {
              "label": "指出口感成功之處，交由她決定保留與否",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "建議盲測新舊兩款，讓她自己評分",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "表示今天先不給結論",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "芷妍說：『這樣我就知道哪些技術值得留，故事不用照搬。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她笑了：『這主意不錯。我不必靠回憶判斷現在。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "芷妍把盤子收走：『好，甜點也值得多試幾次。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "社區活動臨時加單一款舊甜點。芷妍答應後，計算份量的筆卻停了下來。",
          "choices": [
            {
              "label": "協助重算原料與工時，確認是否能接單",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "提議只接能完成的小批次",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "勸她明天再回覆活動主辦",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "芷妍說：『你提醒我可以說做得到多少，而不是什麼都答應。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她點頭：『這不是退縮，是替品質和自己負責。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她說：『我先睡一覺再估工時。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "供應商帶回泛黃食譜，上面有芷妍曾刪除的步驟。有人託他送來，她認出筆跡。",
          "choices": [
            {
              "label": "讓她先保留食譜原件，另外抄錄配方",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "問她刪步驟是為了味道還是生活",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "提議先把食譜封存到她想重看時",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "芷妍說：『過去是真的，但我可以決定哪些步驟不再需要。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她說：『兩者都有。那時候我太常按別人的期待修改。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她把書頁壓平：『我會自己選一天打開。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "散步時，芷妍收到舊識邀約。對方想談匿名訂單，她既好奇又戒備：『我可能會去，但只想在公開場所談。』",
          "choices": [
            {
              "label": "協助她寫下見面的時間界線與離開方式",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "建議先要求對方以文字說明來意",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "告訴她可以拒絕這次邀約",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "芷妍笑說：『你在意的是我的安全和選擇，不是替我赴約。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她說：『對，我可以先確認，再決定要不要見。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她點頭：『拒絕也是一種答案。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "芷妍完成新配方，卻擔心只是把過去包裝成新開始。『你覺得哪個部分最像現在的我？』",
          "choices": [
            {
              "label": "指出少糖但保留果香的平衡",
              "next": 1,
              "effect": "support"
            },
            {
              "label": "指出她敢把失敗過程寫在食譜旁",
              "next": 2,
              "effect": "respectful"
            },
            {
              "label": "說還想多試幾次才評論",
              "next": 3,
              "effect": "respectful"
            }
          ]
        },
        {
          "text": "她笑了：『沒錯，我不再為某個人的口味把自己變淡。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "芷妍看著筆記：『我現在敢讓別人看到我怎麼重新站穩。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "她眨眨眼：『好啊，試吃可不能只吃一次。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
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
          "text": "社區分享會上，芷妍確認匿名訂單是舊識想向她道歉、交還過去共用的食譜。她已決定接受食譜、不接受對方替她安排未來，並用自己的名字推出新配方。『關係的下一步，也讓我親自回答吧。』",
          "choices": [
            {
              "label": "告訴她希望慢慢開始新的關係，節奏由雙方商量",
              "next": 1,
              "effect": "romance"
            },
            {
              "label": "說很珍惜一起試味道的友情，不期待她回報感情",
              "next": 2,
              "effect": "friendship"
            },
            {
              "label": "表示她可以先專注自己的生活，不必立刻答覆",
              "next": 3,
              "effect": "pause"
            }
          ]
        },
        {
          "text": "芷妍回答：『我願意試試看新的關係，但不急著把它叫做命運。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "芷妍笑說：『那就繼續當最誠實的試吃朋友。』",
          "choices": [
            {
              "label": "尊重她的決定，結束這段交流",
              "result": "success"
            }
          ]
        },
        {
          "text": "芷妍說：『謝謝。我想先把新品做好；之後若想談，我會自己說。』",
          "choices": [
            {
              "label": "留待下次，先結束這段交流",
              "result": "not_occurred"
            }
          ]
        }
      ]
    }
  ]
};});
