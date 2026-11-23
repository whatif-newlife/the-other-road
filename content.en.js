/* ============ domains ============ */
var DOMAINS = {
  culinary:{kw:/요리|조리|셰프|쉐프|제과|제빵|식당|파티시|바리스타|음식|한식|양식|일식|중식|料理|調理|シェフ|製菓|パティシエ|飲食|厨师|烹饪|烹饪|厨艺|餐厅|面包|甜点|调理|\bcook|\bculinary|\bchef|\bbak(e|ing|er|ery)\b|\bpastr|\brestaurant|\bkitchen|\bbarista|\bfood/i, field:"cooking", place:"kitchen", mentor:"chef", label:"cooking"},
  arts:{kw:/음악|미술|연기|배우|디자인|작가|웹툰|만화|사진|영화|예술|예고|춤|댄스|가수|밴드|작곡|피아노|성악|애니|音楽|美術|芸術|演技|俳優|デザイン|漫画|写真|映画|ダンス|歌手|バンド|アニメ|音乐|美术|艺术|表演|演员|设计|作家|漫画|摄影|电影|舞蹈|歌手|乐队|动画|\bmusic|\barts?\b|\bartist|\bacting\b|\bactor|\bactress|\bdesign|\bwriter|\bwriting\b|\bcomic|\bmanga|\bphotograph|\bfilm|\bmovie|\bdanc|\bsing(er|ing)?\b|\bband\b|\bpiano|\banimat/i, field:"art", place:"studio", mentor:"teacher", label:"Arts"},
  sports:{kw:/운동|축구|야구|농구|배구|체육|선수|태권도|수영|육상|e스포츠|프로게이머|골프|격투|체대|スポーツ|サッカー|野球|バスケ|水泳|陸上|選手|体育|ゴルフ|运动|足球|棒球|篮球|排球|体育|游泳|田径|选手|电竞|高尔夫|\bsport|\bsoccer|\bfootball|\bbaseball|\bbasketball|\bvolleyball|\bathlet|\bswim|\bgolf|\besport|\bpro gamer|\bboxing/i, field:"sports", place:"training ground", mentor:"coach", label:"sports"},
  abroad:{kw:/유학|해외|외국|이민|워홀|워킹홀리데이|어학연수|미국|일본|호주|캐나다|유럽|독일|영국|留学|海外|移住|移民|ワーホリ|出国|国外|移民|打工度假|\babroad|\boverseas|\bforeign|\bimmigra|\bworking holiday|\bexchange student/i, field:"life abroad", place:"new city", mentor:"local mentor", label:"Abroad"},
  business:{kw:/창업|사업|장사|스타트업|가게|자영업|쇼핑몰|起業|創業|事業|商売|お店|スタートアップ|创业|生意|开店|创办|自营|\bstart-?up|\bbusiness|\bentrepreneur|\bmy own (shop|store|company|cafe|restaurant)/i, field:"business", place:"shop", mentor:"veteran owner", label:"business"},
  academic:{kw:/대학|진학|大学|進学|升学|读大学|\buniversity|\bcollege|의대|의사|약대|한의|공대|개발|프로그래밍|코딩|연구|대학원|과학|재수|반수|법|로스쿨|교대|교사|간호|수의|공부|편입|전공|医学|医者|研究|大学院|科学|法学|教師|看護|浪人|勉強|専攻|プログラミング|医学|医生|研究生|科学|法律|老师|护士|复读|学习|专业|编程|考研|\bmedic|\bdoctor|\bpharma|\bengineer|\bprogramm|\bcoding\b|\bresearch|\bgraduate|\bphd\b|\bscience|\blaw\b|\bteacher|\bnurs|\bvet\b|\bstud(y|ies|ying)\b|\bmajor\b/i, field:"study", place:"lab", mentor:"professor", label:"Academics"},
  work:{kw:/취업|회사|직장|공무원|특성화|마이스터|입사|이직|군인|경찰|소방|就職|会社|公務員|転職|警察|消防|自衛|就业|工作|公司|公务员|考公|跳槽|警察|消防|当兵|\bjob\b|\bemploy|\bcompany\b|\boffice\b|\bcivil serv|\bgovernment|\bvocational|\bsoldier|\bpolice|\bfirefight/i, field:"work", place:"office", mentor:"senior colleague", label:"Work"},
  love:{kw:/고백|결혼|연애|이별|헤어|사귀|프러포즈|프로포즈|짝사랑|재회|告白|結婚|恋愛|別れ|プロポーズ|片思い|表白|结婚|恋爱|分手|求婚|暗恋|复合|\bconfess|\bmarr|\bdat(e|ing)\b|\blove\b|\bbreak ?up|\bpropos|\bcrush\b/i, field:"work", place:"workplace", mentor:"old friend", label:"Relationships"},
  generic:{kw:/$^/, field:"new path", place:"new place", mentor:"senior", label:"New path"}
};
function detectDomain(p){
  const t = p.untaken + " " + p.situation;
  for (const k of ["culinary","love","sports","arts","business","abroad","academic","work"]) if (DOMAINS[k].kw.test(p.untaken)) return k;
  for (const k of ["culinary","love","sports","arts","business","abroad","academic","work"]) if (DOMAINS[k].kw.test(t)) return k;
  return "generic";
}

/* ============ events ============
   phases: teen(<20) early(20-25) late(26-31) thirty(32-39) mid(40+)
   choice: {t, e:{stat:delta}, f:flag, x:outcome text, r:{st, d, win:{e,x}, lose:{e,x}}}  */
var EVENTS = [
 // ---- teen
 {ph:["teen"], title:"Hitting the wall", text:"The first few months at the {place} were harder than you expected. Your old friends are far away, and everyone around you already seems miles ahead.",
  ch:[{t:"Stay late and practice alone", e:{s:8,b:-5}, x:"Your hands got noticeably faster. You were also tired all the time."},
      {t:"Make the first move and find new friends", e:{r:9,s:2,h:3}, x:"Once you had friends to struggle alongside, the strange place slowly became yours."},
      {t:"Call your hometown friends every day to get through it", e:{h:4,r:3,s:-3}, x:"It felt comforting, but putting down roots in the new place took longer."}]},
 {ph:["teen"], title:"The first contest", text:"A {field} contest notice went up on the board. There is only one spot to represent your year, and plenty of people have already applied.",
  ch:[{t:"Enter the contest", r:{st:"s", d:5, win:{e:{s:10,h:8}, x:"You placed. For the first time, you felt sure this path wasn't a mistake."}, lose:{e:{h:-6,s:4}, x:"You were cut in the preliminaries. It stung, but now you know exactly what you're missing."}}},
      {t:"Just watch this year and aim for next year", e:{s:3,h:1}, x:"You watched the best up close and filled a notebook with notes."}]},
 {ph:["teen"], title:"Your parents' question", text:"When you went home for the weekend, your parents asked carefully, “Are you sure this is the right path?”",
  ch:[{t:"Show them what you've learned and tell them you're sure", e:{r:6,h:4}, x:"Their faces softened a little. Dinner that night felt easy for the first time in a while."},
      {t:"Admit honestly that you're anxious", e:{r:9,h:-1,b:2}, x:"“Of course you're anxious.” Those few words took a weight off your shoulders."},
      {t:"Avoid the conversation and go to your room", e:{r:-7,h:-2}, x:"After that day, going home felt a little awkward."}]},
 {ph:["teen"], title:"Someone is watching", text:"A {mentor} kept a close eye on you, then told you to stay after school and learn more.",
  ch:[{t:"Stay and learn", e:{s:10,b:-4,h:2}, f:"mentor", x:"It was tough, but you picked up in months what takes others years."},
      {t:"Thank them but say you'll go at your own pace", e:{h:5,s:2}, x:"You decided not to rush. You spent more time figuring things out alone."}]},
 {ph:["teen","early"], title:"A part-time job offer", text:"Someone you know offered you a weekend job. The money is good, but it eats into study and practice time.",
  ch:[{t:"Take it. I'll earn my own pocket money", e:{m:9,s:-2,b:-3,r:2}, x:"Your savings grew bit by bit, and you got your first look at the world of working adults."},
      {t:"Focus on building skills for now", e:{s:6,m:-2}, x:"Your pockets were light, but your hands were busy."}]},
 {ph:["teen"], title:"Field placement", text:"The school offered field placements. The famous places are fiercely competitive; the small place near home will take you right away.",
  ch:[{t:"Go for the famous place", r:{st:"s", d:10, win:{e:{s:12,r:3}, f:"bigplace", x:"You got in. The standards you saw there set the bar for years to come."}, lose:{e:{h:-5,s:2}, x:"You didn't get in. You ended up at one of the leftover spots, and there was still plenty to learn."}}},
      {t:"Go to the small place that gives you real responsibility", e:{s:7,r:5,h:3}, x:"With so few people, you got to try everything yourself."}]},
 {ph:["teen","early"], title:"Slump", text:"A stretch came when nothing improved no matter what you did. Today felt worse than yesterday.",
  ch:[{t:"Go back to the basics", e:{s:7,h:-3}, x:"After endless repetition, one day the block simply lifted."},
      {t:"Put it down for a while and travel", e:{h:8,b:4,s:-2}, x:"When you came back, you strangely wanted to do it again."},
      {t:"Seriously question whether this is the right path", e:{h:-4,s:-2}, f:"doubt", x:"No answer came, but a seed of doubt settled in your heart."}]},

 // ---- early 20s
 {ph:["early"], title:"Your first position", text:"Finally, an offer came to get paid for {field}. The famous place offers harsh terms; the small one treats you better.",
  ch:[{t:"Start from the bottom at a famous place", r:{st:"b", d:0, win:{e:{s:12,m:-3}, f:"bigplace", x:"You held on. You gained a line on your résumé and a whole new standard for your work."}, lose:{e:{b:-10,h:-6,s:4}, x:"Your body gave out before the first year was up. You cried a lot when you quit."}}},
      {t:"Go to the small place with better terms", e:{m:8,s:4,h:3}, x:"With some breathing room, you started to see a life outside work."},
      {t:"Take a few months off to find your direction", e:{h:5,m:-6,b:3}, x:"While resting, what you really wanted became a little clearer."}]},
 {ph:["early","late"], title:"Leaving at dawn", text:"For weeks you've been leaving work at dawn. Your hands are faster, but you smile less.",
  ch:[{t:"Force yourself to set days off", e:{b:7,h:5,s:-2}, x:"One day a week, you began switching your phone off."},
      {t:"Decide this is the time to push through", r:{st:"b", d:5, win:{e:{s:10,m:4}, x:"Once that stretch was over, you had clearly moved up a level."}, lose:{e:{b:-12,h:-8}, f:"burnout", x:"One morning your body simply wouldn't get out of bed. It was burnout."}}}]},
 {ph:["early","late"], title:"Someone you click with", text:"You kept running into someone near the {place}, and the conversation flowed. “Let's meet again” didn't sound like empty words.",
  ch:[{t:"Make the first move", r:{st:"r", d:0, win:{e:{h:12,r:10}, f:"partner", x:"You became a couple. On hard days, you had somewhere to go home to."}, lose:{e:{h:-5,r:2}, x:"You decided to stay good friends. It was a little sad, but you had no regrets."}}},
      {t:"Work comes first right now", e:{s:5,h:-3}, x:"A few months later, you heard they had moved to another city."}]},
 {ph:["early","late"], title:"A chance to train abroad", text:"A six-month training spot opened up abroad. You'd pay part of the cost and give up the position you've built.",
  ch:[{t:"Go", e:{m:-10,s:11,r:-4,h:5}, f:"abroad", x:"In a place where you could barely talk to anyone, you learned a completely different way of working."},
      {t:"Stay and keep your position", e:{r:4,m:4,s:2}, x:"It was stable. Now and then you wondered how it would have gone if you'd left."}]},
 {ph:["early","late"], title:"A peer's success", text:"A classmate who started with you became famous on social media. The comments are full of the face you know so well.",
  ch:[{t:"Start posting your own work too", r:{st:"h", d:15, win:{e:{r:8,m:6,h:6}, f:"media", x:"The response was better than expected. Your followers grew steadily."}, lose:{e:{h:-5}, x:"The views were close to zero. You quit after a few months."}}},
      {t:"Congratulate them and walk your own path", e:{h:3,s:4,r:3}, x:"Once you stopped comparing, things actually went better."},
      {t:"Feel strangely shaken", e:{h:-6,s:-2}, f:"doubt", x:"Several sleepless nights followed."}]},
 {ph:["early"], title:"A time of pause", text:"An unavoidable gap arrived: military service, caring for family, or a sudden leave from school.",
  ch:[{t:"Keep practicing and studying a little even then", e:{s:4,h:2,b:-1}, x:"When the gap ended, you hadn't lost much of your touch."},
      {t:"Rest your body and mind completely", e:{b:8,h:4,s:-5}, x:"When you came back, your hands were stiff. Your body felt much lighter, though."}]},
 {ph:["early","late"], title:"An offer to team up", text:"A senior you trusted asked you to join their new venture. It could be big if it works, or back to square one if it fails.",
  ch:[{t:"Join them", r:{st:"luck", d:0, win:{e:{m:12,s:8,h:5}, f:"own", x:"The first year was brutal, but it eventually found its footing."}, lose:{e:{m:-14,h:-6,r:-3}, x:"It closed after a year and a half. You learned a lot, along with some debt."}}},
      {t:"Keep your current position", e:{m:5,s:3}, x:"Your steadiness added up, and people began to recognize you."}]},

 // ---- late 20s
 {ph:["late","thirty"], title:"Your body's warning", text:"Your wrists and back ache often. The doctor tells you not to overdo it.",
  ch:[{t:"Get treatment and cut back on work", e:{b:10,m:-6,s:-2}, x:"It took a few months, but the pain almost disappeared."},
      {t:"Grit your teeth and keep going", e:{b:-11,s:4}, f:"injured", x:"The pain became chronic. Your wrist knows it's going to rain before you do."}]},
 {ph:["late","thirty"], title:"Plateau", text:"It feels like you've done the same thing for years. You're good at it, but you're not sure you're growing.",
  ch:[{t:"Learn something new after work", e:{s:8,m:-4,b:-3}, x:"Years later, what you learned turned out useful in unexpected places."},
      {t:"Try to move to a bigger company", r:{st:"s", d:10, win:{e:{m:10,s:6}, x:"You got in. Your salary grew, and so did your responsibilities."}, lose:{e:{h:-6}, x:"You were cut at the final interview. You felt unmotivated for a while."}}},
      {t:"Accept that stability is fine too", e:{h:5,s:-2,m:3}, x:"Once you let go of some ambition, your weekends felt a little longer."}]},
 {ph:["late","thirty"], title:"A call about your parents", text:"A call came at dawn. One of your parents has been hospitalized.",
  ch:[{t:"Go back home for a while and stay by their side", e:{r:10,s:-6,m:-4}, x:"You spent a long stretch with family for the first time in years. Thankfully, they recovered."},
      {t:"Help with the hospital bills and visit every weekend", e:{m:-10,r:4,b:-3}, x:"It was exhausting, but you feel you did everything you could."}]},
 {ph:["late","thirty"], title:"Talk of moving in together", cond:S=>S.flags.has("partner"), text:"Your partner asked carefully, “Should we live together?”",
  ch:[{t:"Say yes", e:{h:10,r:8,m:-5}, f:"family", x:"In a small home, two people's things began to mix."},
      {t:"Say you want to focus on your work a bit longer", r:{st:"r", d:10, win:{e:{s:5,r:-2}, x:"They said they would wait for you."}, lose:{e:{h:-10,r:-8}, x:"Not long after, they ended things."}}}]},
 {ph:["late","thirty"], title:"Evenings alone", cond:S=>!S.flags.has("partner"), text:"Friends are getting married one by one, and get-togethers are rarer. More and more often you come home to a dark apartment.",
  ch:[{t:"Go on a blind date", r:{st:"r", d:5, win:{e:{h:10,r:8}, f:"partner", x:"On the third date, you couldn't stop laughing."}, lose:{e:{h:-3}, x:"The right person didn't come easily."}}},
      {t:"Join a hobby club", e:{r:8,h:5,m:-2}, x:"Time with people outside of work gave you room to breathe."},
      {t:"Enjoy your time alone", e:{h:4,s:4}, x:"Once you learned how to be alone, loneliness felt a little different."}]},
 {ph:["late","thirty","mid"], title:"A night of looking back", text:"You suddenly wondered how life would be if you had taken the '{taken}' path. The friends on that path all seem settled.",
  ch:[{t:"Decide to focus on your own path", e:{h:6,s:2}, x:"You realized comparing never ends. You focused on what was in front of you."},
      {t:"Bring the strengths of that path into this life", e:{s:5,m:4}, x:"Mixing the best of both paths gave you a way of your own."},
      {t:"Look into ways to go back to that path", e:{h:-3}, f:"pivot", x:"It occurred to you that maybe it isn't too late."}]},

 // ---- thirties
 {ph:["thirty"], title:"A chance to put your name on it", text:"With your savings and experience, you could start something with your own name on it. You'd need a loan.",
  ch:[{t:"Start it", r:{st:"luck", d:5, win:{e:{m:14,s:10,h:6}, f:"own", x:"From the first year, customers and requests kept coming."}, lose:{e:{m:-16,h:-8,b:-4}, x:"You closed it after two years. You went back to working for others, with no regrets."}}},
      {t:"Keep learning inside an organization for now", e:{m:5,s:4}, x:"As you moved up, you learned how to lead people."}]},
 {ph:["thirty","mid"], title:"A request to teach", text:"Juniors come to you wanting to learn. You even got an offer to teach a regular class.",
  ch:[{t:"Take the class", e:{r:8,s:3,m:4,h:4}, f:"teach", x:"By teaching, you ended up learning even more."},
      {t:"Focus on your own work", e:{s:6}, x:"You went one step deeper into your craft."}]},
 {ph:["thirty","mid"], title:"A TV offer", text:"A show invited you to appear. If it goes well your name gets out, but so do people's opinions.",
  ch:[{t:"Appear on the show", r:{st:"luck", d:10, win:{e:{m:10,r:6,h:5}, f:"media", x:"After the broadcast, people started recognizing you. Work poured in."}, lose:{e:{h:-8,r:-3}, x:"The edit made you look bad, and the hateful comments followed."}}},
      {t:"Politely decline", e:{h:3,s:3}, x:"You quietly kept doing what you do."}]},
 {ph:["thirty"], title:"Housing trouble", text:"Rent deposits have shot up. You'll have to move or take on a bigger loan.",
  ch:[{t:"Take out a loan and buy a home", r:{st:"m", d:0, win:{e:{m:10,h:4}, x:"A few years later prices rose, and you could finally breathe."}, lose:{e:{m:-12,h:-5}, x:"Interest rates rose, and the monthly payments crushed you."}}},
      {t:"Move to the outskirts", e:{m:5,b:-3,h:-2}, x:"Your commute got longer, but your bank account loosened up a little."}]},
 {ph:["thirty","mid"], title:"Industry crisis", text:"A sudden downturn hit the whole industry. One by one, people around you quit or closed shop.",
  ch:[{t:"Change your approach and survive", r:{st:"s", d:10, win:{e:{s:8,m:6}, x:"In the middle of the crisis, the new approach became an opportunity."}, lose:{e:{m:-10,h:-5}, x:"You made it through, but spent almost all your savings."}}},
      {t:"Take other work for a while to get by", e:{m:3,s:-4,h:-2}, f:"pivot", x:"You kept food on the table, but drifted a little from your real work."}]},

 // ---- 40s+
 {ph:["mid"], title:"At the peak", text:"Somewhere along the way, a lot of people in your field came to know your name. Climb higher, or enjoy where you are?",
  ch:[{t:"Take one last big shot", r:{st:"s", d:15, win:{e:{s:12,m:8,h:5}, x:"That challenge became the defining work of your career."}, lose:{e:{m:-8,b:-6}, x:"It was too much. Still, you'll always know you tried."}}},
      {t:"Slow down and spend time with family", e:{h:8,r:8,s:-2}, x:"You sat down at the dinner table more often."}]},
 {ph:["mid"], title:"Checkup results", text:"There are a few lines in red on your checkup report. The doctor says you need to change how you live.",
  ch:[{t:"Start exercising and change your diet", e:{b:12,h:3,m:-2}, x:"A year later, your numbers were back to normal."},
      {t:"Too busy. Put it off for later", e:{b:-10}, x:"Your body sent the bill later, with interest."}]},
 {ph:["mid"], title:"The next generation", text:"You watch young people working in completely new ways. Follow along, or keep your own way?",
  ch:[{t:"Learn from the young people", e:{s:6,r:5}, x:"Learning new things was still a joy."},
      {t:"Write down the methods you've built and pass them on", e:{s:4,h:4}, f:"teach", x:"Those notes circulated among juniors like a textbook."}]},

 // ======== domain: culinary
 {dom:"culinary", ph:["teen"], title:"Knife skills test", text:"In cooking class, the teacher announced a julienne test. The standard is 0.2 cm, and you have five minutes.",
  ch:[{t:"Practice every day by cutting a radish", r:{st:"s", d:0, win:{e:{s:10,h:5}, x:"You cut the most even julienne in class. The teacher called you by name for the first time."}, lose:{e:{b:-4,s:4}, x:"You cut your finger and took the test with a bandage on. The result was average."}}},
      {t:"Study recipe theory instead of tricks", e:{s:5,h:2}, x:"Knowing why things are done a certain way became a bigger weapon later."}]},
 {dom:"culinary", ph:["teen"], title:"Cooking certification exam", text:"The practical exam for the Korean cuisine certificate is next week. The tasks are revealed on the day, and many fail on hygiene points.",
  ch:[{t:"Repeat every task ten times", r:{st:"s", d:0, win:{e:{s:9,h:6}, x:"You passed on the first try. One certificate felt surprisingly reassuring."}, lose:{e:{h:-5,s:3}, x:"You ran out of time and failed. You passed on the second try."}}},
      {t:"Prepare for the Western cuisine certificate too", e:{s:7,b:-4,h:-2}, x:"It was chaotic, but you earned both."}]},
 {dom:"culinary", ph:["early"], title:"A hotel or a neighborhood restaurant?", text:"Before graduation, two places reached out: the junior spot in a luxury hotel kitchen, and sous-chef at a well-known neighborhood restaurant.",
  ch:[{t:"Join the hotel kitchen", e:{s:8,m:2,b:-4}, f:"hotel", x:"In a kitchen sending out hundreds of plates a day, you learned how a system works."},
      {t:"Run the menu at the neighborhood restaurant", e:{s:5,r:6,h:4}, f:"local", x:"You discovered the joy of cooking while seeing your customers' faces."},
      {t:"Turn both down and go to Japan", e:{s:7,m:-8,r:-3}, f:"abroad", x:"You started out washing dishes at a small shop in Osaka."}]},
 {dom:"culinary", ph:["early","late"], title:"A stage offer", text:"An unpaid apprenticeship (a stage) opened at a famous restaurant in Europe. Three months, with only lodging provided.",
  ch:[{t:"Spend all your savings and go", r:{st:"s", d:10, win:{e:{s:14,m:-8}, f:"abroad", x:"The head chef offered you a real job. You stayed another year."}, lose:{e:{m:-10,h:-4,s:5}, f:"abroad", x:"Worn out by the language and the cliques, you came back early. You never forgot those flavors, though."}}},
      {t:"Build your career at home", e:{m:5,s:3}, x:"With that money, you bought a good set of knives and a deposit for your own place."}]},
 {dom:"culinary", ph:["late","thirty"], title:"Signature dish", text:"The head chef handed you one dish for next season's menu. If it fails, you may not get another chance.",
  ch:[{t:"Reinvent a dish from your hometown", r:{st:"s", d:5, win:{e:{s:10,h:8,r:4}, x:"Customers began calling it “that dish at that place.”"}, lose:{e:{h:-6,s:3}, x:"It was pulled from the menu mid-season."}}},
      {t:"Perfect a proven classic", e:{s:6,m:3}, x:"It earned solid, safe reviews."}]},
 {dom:"culinary", ph:["late","thirty","mid"], title:"A kitchen burn", text:"During a busy dinner service, hot oil burned your hand. The doctor says you need a month off.",
  ch:[{t:"Rest properly and recover", e:{b:6,m:-6,s:-3}, x:"It left a scar, but your hand came back fully."},
      {t:"Wrap it up and go to work the next day", e:{b:-10,s:3,r:3}, f:"injured", x:"Your coworkers admired you, but your hand was never quite the same."}]},
 {dom:"culinary", ph:["thirty","mid"], title:"Cooking show", text:"A writer from a cooking competition show reached out. It's the kind of show that changes your life if you place high.",
  ch:[{t:"Appear on the show", r:{st:"s", d:15, win:{e:{m:12,r:8,h:6}, f:"media", x:"You made it to the finals. The next day, the reservation line wouldn't stop ringing."}, lose:{e:{h:-6,r:2}, x:"You were eliminated in the first round. Still, a few customers came after seeing you on TV."}}},
      {t:"The kitchen is my stage", e:{s:5,h:2}, x:"Every day, in the same spot, you cooked with the same care."}]},

 // ======== domain: arts
 {dom:"arts", ph:["teen","early"], title:"First showing", text:"For the first time, you have a chance to show your work to people. A small stage, a small exhibition, but everyone you know is coming.",
  ch:[{t:"Present your most experimental work", r:{st:"s", d:5, win:{e:{s:9,h:8}, x:"A critic left a short post on their blog. It was the first serious review you'd ever received."}, lose:{e:{h:-6,s:4}, x:"The reaction was cold. But you learned what you really want to make."}}},
      {t:"Present your most polished work", e:{s:5,r:5}, x:"You got a polite round of applause."}]},
 {dom:"arts", ph:["early","late"], title:"Commissions or your own work?", text:"Paid commission work is pouring in. But if you take it, there's no time for your own work.",
  ch:[{t:"Stabilize your life with commissions", e:{m:10,s:2,h:-3}, x:"Your bank account grew solid, and your sketchbook gathered dust."},
      {t:"Do your own work even if you're broke", r:{st:"luck", d:10, win:{e:{s:12,h:6}, f:"media", x:"That work won a prize in a competition."}, lose:{e:{m:-10,h:-4,s:5}, x:"No one noticed. Still, that work remains yours."}}}]},
 {dom:"arts", ph:["late","thirty"], title:"A contract offer", text:"A big company offered you an exclusive contract. It's stable, but you can't always do what you want.",
  ch:[{t:"Sign it", e:{m:10,s:5,h:-3}, f:"company", x:"Your name started appearing on big projects."},
      {t:"Stay independent", e:{h:5,m:-4}, f:"own", x:"Slowly, but at your own pace."}]},

 // ======== domain: sports
 {dom:"sports", ph:["teen","early"], title:"Tryouts", text:"Tryouts for the top team are coming. You have to make the short list to reach the next level.",
  ch:[{t:"Go all in on preparing", r:{st:"b", d:5, win:{e:{s:12,h:8}, f:"elite", x:"Your name made the list."}, lose:{e:{h:-8,s:4}, x:"You missed by a hair. You'll have to wait for the next chance."}}},
      {t:"Choose steady progress without injury", e:{b:5,s:4}, x:"It wasn't flashy, but you built a body that can last."}]},
 {dom:"sports", ph:["early","late","thirty"], title:"Injury", text:"During training, something in your knee went “pop.” After surgery, rehab will take a year.",
  ch:[{t:"Put everything into rehab", r:{st:"b", d:10, win:{e:{b:6,s:5,h:6}, x:"A year later, you stepped back onto the field."}, lose:{e:{b:-6,h:-10}, f:"injured", x:"Your old level never quite came back."}}},
      {t:"Use the time to study coaching", e:{s:3,r:5}, f:"teach", x:"You started seeing the game with completely different eyes."}]},

 // ======== domain: abroad
 {dom:"abroad", ph:["teen","early"], title:"A classroom where no one understands you", text:"You can't follow even half of each lesson. Every break, you end up alone.",
  ch:[{t:"Talk to one local classmate every day", e:{r:9,s:5,h:-2}, x:"Three months later, you could laugh at their jokes."},
      {t:"Hang out with friends from home", e:{h:6,r:4,s:-3}, x:"It felt comfortable, but your language skills grew slowly."}]},
 {dom:"abroad", ph:["early","late"], title:"Visa trouble", text:"Your visa is about to expire. If you don't land a local job, you'll have to go back.",
  ch:[{t:"Try for a local job", r:{st:"s", d:10, win:{e:{m:10,s:8}, f:"settled", x:"Your work visa came through. This place began to feel like a second home."}, lose:{e:{h:-8,m:-5}, f:"returned", x:"You packed up and went back. You sat in the airport for a long time."}}},
      {t:"Go home with the experience", e:{r:6,h:3}, f:"returned", x:"Familiar food and family welcomed you."}]},

 // ======== domain: business
 {dom:"business", ph:["teen","early","late"], title:"First sale", text:"For the first time, a stranger's money landed in your account. The amount was small, but your hands shook.",
  ch:[{t:"Reinvest everything you earned", r:{st:"luck", d:5, win:{e:{m:12,s:6}, x:"Sales doubled."}, lose:{e:{m:-8,h:-4}, x:"All you got was a pile of unsold stock."}}},
      {t:"Go slow and don't go under", e:{m:5,h:3}, x:"Small, but steadily growing."}]},
 {dom:"business", ph:["late","thirty"], title:"Investment offer", text:"An investor offered a lot of money. In return, you'd give up part of your shares and your say.",
  ch:[{t:"Take the investment", r:{st:"s", d:10, win:{e:{m:15,s:8}, f:"scale", x:"The company grew fast."}, lose:{e:{h:-10,m:-6}, x:"After clashing with the investor, you had to leave your own company."}}},
      {t:"Do it your way", e:{h:5,m:3}, x:"It was slow, but it was yours."}]},

 // ======== domain: academic
 {dom:"academic", ph:["teen","early"], title:"The deciding exam", text:"An exam is coming that will judge years of effort in a single day.",
  ch:[{t:"Pull all-nighters to the very end", r:{st:"b", d:5, win:{e:{s:12,h:8}, x:"You got the result you wanted."}, lose:{e:{h:-10,b:-4}, x:"You fell apart on exam day. You had to do another year."}}},
      {t:"Focus on staying in good shape", r:{st:"s", d:0, win:{e:{s:9,h:6}, x:"You scored as well as you're able. You passed."}, lose:{e:{h:-6}, x:"You narrowly got your second choice."}}}]},
 {dom:"academic", ph:["late","thirty"], title:"Research or industry?", text:"You have to decide: stay in research, or go into industry and earn money.",
  ch:[{t:"Keep researching", e:{s:10,m:-6}, f:"research", x:"One paper after another, they added up."},
      {t:"Go into industry", e:{m:10,s:4}, x:"It was fun to use what you'd learned on real problems."}]},

 // ======== domain: work
 {dom:"work", ph:["teen","early"], title:"First paycheck", text:"You got your first paycheck earlier than most. Your friends are still students.",
  ch:[{t:"Save half, no matter what", e:{m:12,h:-2}, x:"Years later, that money became the seed for a big decision."},
      {t:"Buy your parents a gift and treat yourself", e:{h:7,r:6,m:2}, x:"Your parents bragged about that gift for a long time."}]},
 {dom:"work", ph:["late","thirty"], title:"A shot at promotion", text:"The team lead position opened up. Applying means more responsibility and more overtime.",
  ch:[{t:"Apply", r:{st:"s", d:5, win:{e:{m:10,s:8,b:-4}, f:"manager", x:"You became the team lead."}, lose:{e:{h:-5}, x:"Someone else got it. You'll try next time."}}},
      {t:"Stay a hands-on worker", e:{h:5,b:3}, x:"You kept a clear line between work and life."}]},

 // ======== domain: love
 {dom:"love", ph:["teen","early","late"], title:"First fight", text:"You had a big fight over something small. It's been three days since either of you reached out.",
  ch:[{t:"Reach out first", e:{r:8,h:5}, f:"partner", x:"“I wanted to call you too.” Those words melted everything."},
      {t:"Wait for them to reach out first", r:{st:"r", d:10, win:{e:{r:4,h:3}, f:"partner", x:"On the fourth day, they called."}, lose:{e:{r:-10,h:-10}, f:"breakup", x:"The call never came. That was the end."}}}]},
 {dom:"love", ph:["early","late","thirty"], title:"Distance", text:"One of you has to move to a faraway city.",
  ch:[{t:"Go with them", e:{r:10,s:-6,m:-4}, f:"partner", x:"It was a strange city, but being together made it fine."},
      {t:"Try a long-distance relationship", r:{st:"r", d:10, win:{e:{r:8,h:4}, f:"partner", x:"Every weekend you took the train. Missing each other made the bond stronger."}, lose:{e:{h:-10,r:-6}, f:"breakup", x:"The calls got shorter, and in the end you went separate ways."}}}]},
];

/* fate cards: something that happens to you regardless of your choices */
var FATES = [
  {t:"A friend you had lost touch with reached out first.", e:{r:5,h:3}},
  {t:"A lottery ticket you bought on a whim won a small prize.", e:{m:6,h:3}},
  {t:"A cold has lingered for weeks.", e:{b:-6}},
  {t:"Your landlord suddenly asked you to move out.", e:{m:-6,h:-3}},
  {t:"You took in an abandoned cat from the street.", e:{h:6,m:-2}},
  {t:"Someone you trusted never paid back the money you lent.", e:{m:-8,r:-4}},
  {t:"Someone you met by chance praised your work highly.", e:{s:5,h:3}},
  {t:"The economy turned, and the whole industry shrank back.", e:{m:-6}},
  {t:"Your family had some happy news.", e:{h:5,r:4}},
  {t:"You nearly got into a car accident. You weren't hurt, but the shock stayed with you for a while.", e:{h:-4,b:-2}},
  {t:"A short post you wrote online unexpectedly went viral.", e:{r:4,s:2}},
  {t:"Since you started exercising, your body feels lighter.", e:{b:7,h:2}},
  {t:"Someone who had always cheered you on passed away.", e:{h:-6,r:-2}},
  {t:"You got a bonus you never expected.", e:{m:7}},
];

/* ============ endings ============ */
var ENDINGS = {
 culinary:[
  {job:"Head chef of a Michelin-starred restaurant", w:{s:1.4,h:.2}, need:{s:72}, bonus:{abroad:25,bigplace:10}, d:"After countless nights in the kitchen, your name went to the top of the menu. Guests smell your plates before they photograph them."},
  {job:"Sous-chef at a luxury hotel restaurant", w:{s:1,b:.4,m:.3}, need:{s:55}, bonus:{hotel:25,bigplace:10}, d:"Hundreds of plates pass through your hands every day. The name tag on your white jacket finally fits."},
  {job:"Owner of a beloved little restaurant down the alley", w:{r:1,h:.6,s:.3}, bonus:{own:25,local:20}, d:"A twelve-seat place with a line every lunch. You know every regular's name and taste by heart."},
  {job:"Cooking creator with hundreds of thousands of subscribers", w:{r:.6,h:.4,s:.4}, bonus:{media:40}, d:"Years after you first picked up a knife on camera, photos of people making your recipes arrive every day."},
  {job:"Menu developer at a food company", w:{m:.9,s:.5,b:.3}, d:"The lunch box you developed sits on convenience store shelves. You chose a steady paycheck and your evenings free."},
  {job:"Head cook of a school cafeteria", w:{b:.6,r:.7,h:.5}, bonus:{family:10}, d:"You're in charge of lunch for hundreds of kids every day. Their “that was delicious!” keeps your days warm."},
  {job:"Food truck chef touring the country", w:{h:.9,r:.2}, bonus:{own:10,pivot:10}, d:"There's no fixed kitchen. Wherever the festival is, that's today's kitchen."},
  {job:"Teacher at a culinary high school", w:{r:.7,s:.5,h:.2}, bonus:{teach:35}, d:"In the same practice room where you once stood, you now teach students how to hold a knife."},
  {job:"Office worker who kept cooking as a hobby", pivot:true, d:"Reality was spicier than expected. You make a living doing something else, but on weekends you still cook for your friends."}],
 arts:[
  {job:"Full-time artist with a known name", w:{s:1.4,h:.2}, need:{s:70}, bonus:{media:20,own:10}, d:"You live on your work alone. Some days you still can't believe it."},
  {job:"Creator at a major studio", w:{s:.9,m:.6}, bonus:{company:30}, d:"Your name rolls in the credits of big projects."},
  {job:"Teacher who runs a studio", w:{r:.8,s:.5}, bonus:{teach:30}, d:"Classes in the afternoon, your own work at night. Your students' growth is another kind of masterpiece."},
  {job:"Established freelancer", w:{m:.9,s:.5}, d:"Your client list has grown long. It's stable, though sometimes you miss your own work."},
  {job:"Artist working on international stages", w:{s:1,h:.3}, need:{s:60}, bonus:{abroad:35}, d:"You work across many countries. You've gotten used to giving interviews in a clumsy second language."},
  {job:"Popular artist loved on social media", w:{r:.7,h:.4}, bonus:{media:40}, d:"Within minutes of posting new work, hundreds of comments roll in."},
  {job:"Office worker who keeps art close to heart", pivot:true, d:"You make your living another way, but the sense you built back then quietly shows in your work today."}],
 sports:[
  {job:"National team athlete", w:{s:1.3,b:.6}, need:{s:72,b:55}, bonus:{elite:30}, d:"You stepped onto the field with your country's flag on your chest. Every day led to that moment."},
  {job:"Starting player on a pro team", w:{s:1,b:.6}, need:{s:58}, bonus:{elite:15}, d:"There are people in the stands chanting your name."},
  {job:"Coach and former athlete", w:{r:.8,s:.6}, bonus:{teach:35,injured:10}, d:"You now pass the sweat of your playing days on to kids."},
  {job:"Sports commentator", w:{r:.7,s:.5}, bonus:{media:40}, d:"In front of the mic, you read the game for everyone. Your experience on the field gives your words weight."},
  {job:"Owner of a fitness center", w:{m:.7,r:.5}, bonus:{own:35}, d:"You started with a small gym and now have two locations."},
  {job:"Former athlete on a completely different path", pivot:true, bonus:{injured:25}, d:"Your body wouldn't allow it. But the grit sports taught you carries you down a new road."}],
 abroad:[
  {job:"Professional rooted abroad", w:{s:1,m:.6}, need:{s:55}, bonus:{settled:35}, d:"Now you even dream in that language. During the holidays, you miss home."},
  {job:"Trade and interpreting expert bridging two countries", w:{r:.8,s:.6}, bonus:{abroad:10}, d:"Between two languages and two cultures, you do work no one else can."},
  {job:"Office worker using experience from abroad", w:{m:.7,r:.5}, bonus:{returned:30}, d:"You came back and settled in. Calls with overseas partners are always your job."},
  {job:"Owner of a shop abroad", w:{m:.6,h:.6}, bonus:{own:35}, d:"Your sign hangs in an alley of a once-strange city."},
  {job:"Nomad drifting between countries", w:{h:1}, d:"You work from one laptop and live in three countries a year."},
  {job:"Someone who came home and started over", pivot:true, bonus:{returned:15}, d:"You left life abroad behind, but the perspective you gained stayed with you."}],
 business:[
  {job:"CEO leading dozens of people", w:{m:1.1,s:.8}, need:{m:60}, bonus:{scale:35,own:15}, d:"What started at a single small desk now fills a whole office floor."},
  {job:"Serial entrepreneur who fell and got back up", w:{s:.8,h:.5}, bonus:{own:15}, d:"Having failed became your greatest asset. You're now growing your third company."},
  {job:"Owner of a neighborhood shop full of regulars", w:{r:1,h:.6}, d:"It isn't big, but everyone in the neighborhood knows it."},
  {job:"Founder resting after selling the company", w:{m:1.3}, need:{m:72}, d:"You sold the company you built. You're slowly deciding what to do next."},
  {job:"Mentor to entrepreneurs", w:{r:.8,s:.6}, bonus:{teach:35}, d:"You help young founders avoid the mistakes you made."},
  {job:"Founder who returned to a company job", pivot:true, d:"You closed your business, but you became someone who works like an owner wherever you are."}],
 academic:[
  {job:"One of the top experts in the field", w:{s:1.4,m:.3}, need:{s:72}, d:"When a hard problem comes up, people come to you first."},
  {job:"Professor and researcher", w:{s:1,r:.3}, need:{s:60}, bonus:{research:35}, d:"Papers with your name on them are cited in other people's research."},
  {job:"Lead researcher at a corporate lab", w:{s:.8,m:.7}, d:"You watch what you learned become products out in the world."},
  {job:"Teacher sharing what you learned", w:{r:.9,h:.4}, bonus:{teach:35}, d:"You love the look on students' faces when a hard idea clicks."},
  {job:"Researcher working abroad", w:{s:1}, need:{s:58}, bonus:{abroad:35}, d:"You run experiments late at night in a lab overseas."},
  {job:"Someone who found another path after studying", pivot:true, d:"You're on a different path than planned, but you learn anything the way you once studied."}],
 work:[
  {job:"Veteran who settled in earlier than anyone", w:{s:.8,m:.8}, d:"While your peers were new hires, you were already a pillar of the team."},
  {job:"Manager leading an organization", w:{s:.8,r:.6}, bonus:{manager:35}, d:"The head of the meeting table is your seat now."},
  {job:"Independent professional using your experience", w:{m:.6,s:.7}, bonus:{own:35}, d:"With the experience and connections you built, you started your own work."},
  {job:"Worker who keeps a healthy work-life balance", w:{h:1,b:.5}, d:"You leave at six. Your evenings are the center of your life."},
  {job:"Seasoned pro who went to grad school", w:{s:1}, bonus:{research:20}, d:"Holding on to questions from work, you started studying again."},
  {job:"Someone who started a completely new kind of work", pivot:true, d:"You walked away from a stable job and are learning something new."}],
 love:[
  {job:"A life building a family with that person", w:{r:1.2,h:.6}, need:{r:55}, bonus:{partner:30,family:25}, d:"That person sits across the dinner table. The choice you made that day became tonight's dinner."},
  {job:"A life as good friends who cheer each other on", w:{r:.8,h:.5}, d:"Not lovers, but you reach out to each other at every important moment."},
  {job:"A life that grew stronger after a breakup", w:{s:.8,h:.6}, bonus:{breakup:30}, d:"That breakup hurt. But that time made you who you are now."},
  {job:"A happy life with someone new", w:{h:1,r:.5}, bonus:{breakup:10}, d:"You met someone new where you least expected."},
  {job:"A full life on your own", w:{h:.8,s:.6,m:.4}, d:"You learned it's okay not to be with someone."}],
 generic:[
  {job:"Someone who settled on the '{untaken}' path", cjob:"Someone who settled on that path", w:{s:1.2,m:.3}, need:{s:60}, d:"You walked that path to the end. It wasn't easy, but now you stand firmly on it."},
  {job:"Someone who created their own work on that path", w:{s:.7,m:.6}, bonus:{own:35}, d:"You built your work your own way, not the way everyone else did."},
  {job:"Someone surrounded by good people", w:{r:1.1,h:.5}, d:"It isn't flashy, but you have many names to call on hard days."},
  {job:"A senior who shares their experience", w:{r:.7,s:.6}, bonus:{teach:35}, d:"People standing at the same crossroads come to you for advice."},
  {job:"A traveler still on the road", w:{h:1}, d:"There's no fixed destination. But you've come to enjoy the walking itself."},
  {job:"Someone who eventually turned onto another path", pivot:true, d:"That path wasn't what you imagined. But because you walked it, you could turn without regrets."}]
};

/* ============ traits & presets ============ */
var TRAITS = {grit:{s:6}, optimist:{h:8}, social:{r:8}, careful:{m:6}, adventurous:{luck:8}, delicate:{s:4,h:-2}, strong:{b:8}, sensitive:{h:-4,s:4}, planner:{m:4,s:2}, spontaneous:{h:4,m:-3}};
var TRAIT_NAMES = {grit:"Persistent", optimist:"Optimistic", social:"Sociable", careful:"Careful", adventurous:"Adventurous", delicate:"Detail-minded", strong:"Physically strong", sensitive:"Sensitive", planner:"Organized", spontaneous:"Spontaneous"};
var VALUES = {money:"m", achieve:"s", people:"r", health:"b", freedom:"h"};
var VALUE_NAMES = {money:"Money and stability", achieve:"Recognition and achievement", people:"Family and people", health:"A healthy life", freedom:"Freedom and joy"};
var PRESETS = [
  {label:"Culinary school vs. regular high school (example)", forkAge:16, nowAge:30, situation:"I wanted to be a chef until middle school. I was torn between the regular high school in my hometown and a culinary high school in another city.", taken:"Regular high school in my hometown", untaken:"Culinary high school in another city"},
  {label:"Arts high school", forkAge:16, nowAge:28, situation:"I loved drawing, but my parents wanted me at a regular high school.", taken:"Regular high school", untaken:"Fine arts program at an arts high school"},
  {label:"Studying abroad", forkAge:19, nowAge:33, situation:"After my entrance exams, I got into a US university, but I was worried about the cost.", taken:"University at home", untaken:"University in the US"},
  {label:"A startup instead of a job", forkAge:27, nowAge:35, situation:"A job offer from a big company and a friend's startup offer came at the same time.", taken:"Join a big company", untaken:"Start a startup with a friend"},
  {label:"If I had confessed", forkAge:20, nowAge:29, situation:"In my first year of college, I liked a friend for a long time but never told them.", taken:"Stayed friends without confessing", untaken:"Worked up the courage to confess"},
];


/* ============ more main events (v2) ============ */
EVENTS.push(
 // generic
 {ph:["teen"], title:"Rival", text:"Your classmate {rival} is always one step ahead of you. Today again, the teacher praised {rival}'s work.",
  ch:[{t:"Ask {rival} for their secret", e:{r:7,s:5}, f:"rivalfriend", x:"Surprisingly, {rival} told you willingly. From that day on, you were rivals and friends."},
      {t:"Practice harder in silence and win", r:{st:"s", d:10, win:{e:{s:10,h:6}, x:"In the next evaluation, you beat {rival} for the first time."}, lose:{e:{h:-6,s:5}, x:"You lost again. But the gap clearly got smaller."}}},
      {t:"Decide not to care", e:{h:4,s:1}, x:"Once you stopped comparing yourself, your mind felt at ease."}]},
 {ph:["teen","early"], title:"First place of your own", text:"For the first time, you live alone. A small room, an old fridge, and more bills than you expected.",
  ch:[{t:"Keep a budget and live frugally", e:{m:7,h:-1}, x:"For the first time, you knew exactly how much a month costs."},
      {t:"Decorate the room your way", e:{h:7,m:-5}, x:"Small as it was, it became a room you wanted to come home to."},
      {t:"Live with your friend {friend}", e:{r:7,m:4,h:2}, f:"roommate", x:"The talks went on every night. Sometimes you fought over the dishes."}]},
 {ph:["early","late"], title:"Unfair treatment", text:"Your boss reported your work as their own. Your coworkers all know, but no one says anything.",
  ch:[{t:"Confront it head-on", r:{st:"r", d:15, win:{e:{s:6,h:6}, x:"Upper management learned the truth, and your name went on the work."}, lose:{e:{h:-6,r:-6}, x:"It only made things tense. You had to tiptoe around for months."}}},
      {t:"Gather evidence and wait", e:{s:3,h:-3}, x:"The chance came later than expected, but it came."},
      {t:"Let it go this time", e:{h:-5,r:2}, x:"It stung, but work went on."}]},
 {ph:["early","late","thirty"], title:"A friend's request", text:"Your old friend {friend} urgently asks to borrow money. It's a large amount.",
  ch:[{t:"Lend it", r:{st:"luck", d:0, win:{e:{r:8,m:-2}, x:"{friend} paid it back in six months. Your friendship grew deeper."}, lose:{e:{m:-12,r:-6,h:-4}, x:"Contact grew rarer. You lost both the money and the friend."}}},
      {t:"Give only what you can afford to lose", e:{m:-4,r:5}, x:"{friend} thanked you, close to tears."},
      {t:"Say no", e:{r:-6,m:2}, x:"“Okay, I understand.” Those words weighed on you for a long time."}]},
 {ph:["late","thirty"], title:"A recruiting call", text:"A competitor offers a big raise if you join them. Without you, your current team will struggle.",
  ch:[{t:"Make the move", e:{m:12,r:-5,s:3}, x:"Your pay went up, but it took a year to adjust to the new culture."},
      {t:"Negotiate with your current company", r:{st:"s", d:10, win:{e:{m:8,s:4}, x:"They kept you. You learned what negotiating power means."}, lose:{e:{r:-4,h:-4}, x:"The talks fell apart and things just got awkward."}}},
      {t:"Stay loyal", e:{r:7,h:3}, x:"Your team came to trust and follow you even more."}]},
 {ph:["thirty","mid"], title:"An old dream", text:"You found a notebook from high school in a drawer. It holds a list: “Things I want to do when I'm thirty.”",
  ch:[{t:"Do one of them this year", e:{h:9,m:-4}, x:"Something you thought was too late turned out to be a joy."},
      {t:"Smile and put it back", e:{h:2}, x:"You felt a little sorry, and a little grateful, to your younger self."}]},
 {ph:["thirty","mid"], title:"Should we have a child?", cond:S=>S.flags.has("family"), text:"{lover} brought up having a child. You're both in a busy season.",
  ch:[{t:"Decide to have one", e:{h:8,r:10,m:-8,b:-4}, f:"child", x:"A year later, a tiny hand held tight to your finger."},
      {t:"Wait a little longer", e:{s:4,m:3}, x:"You decided to enjoy time as a couple a little longer."},
      {t:"Choose a life for just the two of you", e:{h:4,m:6}, x:"Every weekend, you two plan your next trip."}]},
 {ph:["mid"], title:"Your parents growing old", text:"Your parents have aged a lot. Living on their own looks hard for them.",
  ch:[{t:"Have them live with you", e:{r:10,h:-3,m:-5}, x:"The house got smaller, but the dinner table got livelier."},
      {t:"Help them move somewhere close by", e:{r:6,m:-6}, x:"Every weekend you visit and go grocery shopping together."},
      {t:"Share the duties with your siblings", e:{r:3,h:2}, x:"There were some heated moments, but it all got sorted out."}]},

 // culinary
 {dom:"culinary", ph:["teen"], title:"Nights in the dorm", text:"At the culinary school dorm, lights go out at 10 p.m. But a few students secretly practice on portable burners.",
  ch:[{t:"Sneak in some practice together", r:{st:"luck", d:10, win:{e:{s:7,r:6}, x:"The dorm supervisor never caught you. Those nights became memories with your classmates."}, lose:{e:{r:3,h:-5}, x:"You got caught and got demerits. You laughed even while writing your apology."}}},
      {t:"Follow the rules and sleep early", e:{b:6,s:1}, x:"You always woke up more refreshed than everyone else."}]},
 {dom:"culinary", ph:["teen","early"], title:"The taste of home", text:"When you went home for break, your grandmother was making kimchi. The recipe isn't written down anywhere.",
  ch:[{t:"Measure and take notes beside her", e:{s:6,r:8}, f:"grandma", x:"It took three days to turn “just enough” into numbers. That notebook became a treasure."},
      {t:"Just enjoy eating it", e:{h:7,r:4}, x:"You ate your fill and took a nap. That was a good break, too."}]},
 {dom:"culinary", ph:["early","late"], title:"A day as the kitchen junior", text:"A kitchen junior's day starts with checking deliveries at 6 a.m. and ends mopping floors at 11 p.m. Being yelled at is routine.",
  ch:[{t:"Grit your teeth and endure", r:{st:"b", d:5, win:{e:{s:9}, x:"After a year, instead of yelling you heard, “Take care of this tomorrow.”"}, lose:{e:{b:-8,h:-6}, f:"burnout", x:"One day you put down your knife and cried in the bathroom for a long time."}}},
      {t:"Call out what's unfair", e:{r:-4,h:4}, x:"The kitchen atmosphere changed a little. Some seniors came to dislike you."},
      {t:"Move to a better kitchen", e:{h:5,s:-2}, x:"The chef in the new kitchen never raised their voice."}]},
 {dom:"culinary", ph:["late","thirty"], title:"A spot for your own place", text:"A small space opened up in an old alley. The deposit is all your savings; the key money is a loan.",
  ch:[{t:"Sign it", r:{st:"luck", d:5, win:{e:{m:10,h:8,s:6}, f:"own", x:"Three months after opening, you were on the neighborhood food map."}, lose:{e:{m:-15,h:-8}, x:"News of redevelopment drove customers away. You closed after two years."}}},
      {t:"Keep learning in someone else's kitchen", e:{s:6,m:4}, x:"You kept filling your menu notebook for someday."}]},
 {dom:"culinary", ph:["thirty","mid"], title:"The age of delivery apps", text:"More than half your orders come through delivery. Fees keep rising, and one star in a review can shake your sales.",
  ch:[{t:"Create delivery-only dishes", e:{m:8,s:3,b:-3}, x:"You spent a month finding dishes that taste good even cold."},
      {t:"Focus on dine-in guests", e:{r:6,m:-4}, x:"Your regulars came even more often."},
      {t:"Put effort into managing ratings", e:{m:4,h:-5}, x:"Replying to every single review often kept you up until dawn."}]},

 // arts
 {dom:"arts", ph:["teen"], title:"Practical entrance exam", text:"Hundreds compete on the same theme in the exam hall. You have four hours.",
  ch:[{t:"Go by the book, the way you were taught", r:{st:"s", d:5, win:{e:{s:9,h:6}, x:"You screamed when the acceptance text came."}, lose:{e:{h:-8}, x:"Rejected. You decided to prepare for another year."}}},
      {t:"Compete with your own style", r:{st:"luck", d:10, win:{e:{s:12,h:8}, x:"One judge stood in front of your piece for a long time. You got in."}, lose:{e:{h:-8,s:3}, x:"You didn't get in, but you had no regrets."}}}]},
 {dom:"arts", ph:["early","late"], title:"Plagiarism dispute", text:"A piece similar to yours was released under a famous name. People say you're the one who copied.",
  ch:[{t:"Publish your process records", r:{st:"r", d:5, win:{e:{r:8,s:5}, f:"media", x:"Public opinion flipped. Your name actually got out."}, lose:{e:{h:-8}, x:"It got buried. The unfairness became fuel for your next work."}}},
      {t:"Ignore it and move on to the next piece", e:{s:5,h:-4}, x:"In time, people forgot."}]},
 {dom:"arts", ph:["thirty","mid"], title:"Solo exhibition offer", text:"A small gallery wants to host your solo show. You'd cover part of the rental fee yourself.",
  ch:[{t:"Do it", r:{st:"s", d:5, win:{e:{s:10,m:4,h:8}, x:"Half the pieces sold."}, lose:{e:{m:-8,h:-4}, x:"Few visitors came, but one critic's review remained."}}},
      {t:"Not ready yet", e:{s:4}, x:"You decided to prepare for one more year."}]},

 // sports
 {dom:"sports", ph:["teen","early"], title:"Dawn training", text:"5 a.m., and the sun isn't up yet. The coach said if your time isn't there today, you're off the roster.",
  ch:[{t:"Push to your limit", r:{st:"b", d:10, win:{e:{s:10}, x:"You set a personal best."}, lose:{e:{b:-8}, f:"injured", x:"You tore a muscle. You need weeks off."}}},
      {t:"Keep your pace", e:{s:4,b:3}, x:"Without overdoing it, you posted steady times."}]},
 {dom:"sports", ph:["early","late"], title:"Transfer offer", text:"A bigger team offered you a transfer. The fight for a starting spot is far fiercer.",
  ch:[{t:"Transfer", r:{st:"s", d:15, win:{e:{s:10,m:10}, f:"elite", x:"By mid-season, you had won a starting spot."}, lose:{e:{h:-8,s:2}, x:"You spent many days on the bench."}}},
      {t:"Stay the ace of your current team", e:{h:5,r:5}, x:"The fans chanted your name."}]},
 {dom:"sports", ph:["thirty","mid"], title:"Time to retire", text:"Your body isn't what it used to be. The club offered a retirement ceremony.",
  ch:[{t:"Retire and become a coach", e:{r:6,h:4}, f:"teach", x:"On the day of your last game, the stands were packed."},
      {t:"Play one more season", r:{st:"b", d:15, win:{e:{s:6,h:8}, x:"That season became a brilliant finale to your career."}, lose:{e:{b:-10}, f:"injured", x:"An injury kept you from finishing the season."}}}]},

 // abroad
 {dom:"abroad", ph:["early","late"], title:"Homesick", text:"On a holiday, your family sits together on the other side of a video call. You're the only one on a screen.",
  ch:[{t:"Buy a plane ticket", e:{r:8,h:6,m:-8}, x:"The moment you saw your mom at the airport, you cried."},
      {t:"Cook holiday food with local friends", e:{r:6,h:4}, x:"Your friends gave a thumbs-up to your clumsy holiday soup."}]},
 {dom:"abroad", ph:["late","thirty"], title:"A moment of discrimination", text:"Your ideas get ignored in meetings time and again. When a local coworker says the same thing, people applaud.",
  ch:[{t:"Prove it with results", e:{s:8,b:-3}, x:"Numbers don't lie. In the end, the leader came looking for you."},
      {t:"Raise the issue officially with HR", r:{st:"r", d:10, win:{e:{r:5,h:6}, x:"The company started changing its culture."}, lose:{e:{h:-6,r:-4}, x:"Things just turned cold."}}},
      {t:"Find strength in a community from home", e:{r:6,h:3}, x:"Many people had been through the same thing."}]},

 // business
 {dom:"business", ph:["early","late","thirty"], title:"Out of money", text:"You can't pay next month's rent or your staff's salaries.",
  ch:[{t:"Take out a personal loan", r:{st:"luck", d:5, win:{e:{m:-4,s:5}, x:"You held on, and three months later a big deal went through."}, lose:{e:{m:-15,h:-8}, x:"Only your debt grew."}}},
      {t:"Scale down the business", e:{m:4,r:-5,h:-4}, x:"You had to let two employees go. You couldn't sleep."},
      {t:"Ask your family for help", e:{m:6,r:-2,h:-3}, x:"Your pride took a hit, but the company survived."}]},
 {dom:"business", ph:["late","thirty","mid"], title:"A trusted employee", text:"An employee who had been with you since day one took your client list and started a competitor.",
  ch:[{t:"Take legal action", e:{m:-6,h:-5,s:3}, x:"It was a long, exhausting fight."},
      {t:"Win with better service", r:{st:"s", d:10, win:{e:{m:8,s:6}, x:"The clients came back in the end."}, lose:{e:{m:-8}, x:"You lost a third of your revenue."}}}]},

 // academic
 {dom:"academic", ph:["early","late"], title:"All-night experiments", text:"For months, your experiments haven't worked. One by one, your peers are publishing papers.",
  ch:[{t:"Redesign the method from scratch", r:{st:"s", d:5, win:{e:{s:12,h:6}, x:"The new method worked. Your advisor smiled for the first time."}, lose:{e:{h:-6,b:-4}, x:"It failed again. But now you know for sure what doesn't work."}}},
      {t:"Change your topic", e:{s:3,h:3}, x:"The new topic went more smoothly than expected."}]},
 {dom:"academic", ph:["late","thirty"], title:"Postdoc abroad", text:"A famous institute abroad offered you a postdoc position.",
  ch:[{t:"Go", e:{s:10,r:-5,m:-3}, f:"abroad", x:"You worked among the best in the world."},
      {t:"Find a position at home", e:{r:5,m:4}, x:"You continued your research close to family."}]},

 // work
 {dom:"work", ph:["teen","early"], title:"The junior on site", text:"What you learned in school was nothing like the real job. Your seniors say, “That's only in the textbooks.”",
  ch:[{t:"Learn the seniors' ways exactly", e:{s:7,r:5}, x:"Within a few months, it came naturally."},
      {t:"Suggest a better method", r:{st:"s", d:10, win:{e:{s:8,r:4}, x:"Your idea was adopted, and the whole team started using it."}, lose:{e:{r:-6}, x:"You were called a know-it-all."}}}]},
 {dom:"work", ph:["late","thirty"], title:"Restructuring", text:"The company announced restructuring. They're taking voluntary resignations.",
  ch:[{t:"Take the severance and leave", e:{m:10,h:-3}, f:"pivot", x:"Faced with sudden free time and money, you felt lost for a while."},
      {t:"Stay and hold on", r:{st:"s", d:10, win:{e:{s:6,m:4}, x:"You survived. Your workload doubled."}, lose:{e:{h:-8,m:-4}, x:"In the end, you were pushed to another department."}}}]},

 // love
 {dom:"love", ph:["teen","early"], title:"After the confession", text:"Since the day you found your courage, you and {lover} have talked every day. Your friends already tease you as a couple.",
  ch:[{t:"Ask them to make it official", r:{st:"r", d:0, win:{e:{h:12,r:8}, f:"partner", x:"“I was waiting for you to ask.” {lover} smiled."}, lose:{e:{h:-8}, x:"“Let's stay friends a little longer.” An unclear answer came back."}}},
      {t:"Slowly enjoy the butterflies for now", e:{h:6,r:4}, x:"Not rushing actually brought you closer."}]},
 {dom:"love", ph:["early","late"], title:"Family disapproval", text:"You introduced {lover} to your parents, but the reaction was cold. The questions were all about job and family background.",
  ch:[{t:"Win your parents over", r:{st:"r", d:10, win:{e:{r:8,h:6}, f:"partner", x:"After a few dinners, your parents' hearts opened."}, lose:{e:{r:-6,h:-6}, x:"The mood at home stayed frozen for a while."}}},
      {t:"Our decision comes first", e:{h:5,r:-4}, f:"partner", x:"You grew distant from your parents, but the two of you grew stronger."}]},
 {dom:"love", ph:["late","thirty"], title:"Proposal", cond:S=>S.flags.has("partner") && !S.flags.has("family"), text:"A few years together. While you were thinking about buying a ring, {lover} brought up the future first.",
  ch:[{t:"Propose today", e:{h:12,r:10,m:-6}, f:"family", x:"It was a proposal without a ring, but {lover} nodded through tears."},
      {t:"Say you'll do it properly", e:{h:4,r:4}, x:"Three months later, on a beach, you held out a ring."}]}
);

/* ============ everyday scenes: short, quick, any domain ============ */
var DAILY = [
 {title:"Monday morning", text:"The alarm rang for the third time. Your body feels extra heavy today.", ch:[{t:"Jump up and work out", e:{b:4,h:2}, x:"You started the day feeling fresh."},{t:"Sleep five more minutes", e:{h:2,s:-1}, x:"You ended up sleeping thirty more. You spent the whole day catching up."}]},
 {title:"Group chat reunion", text:"{friend} wants to organize a class reunion for the first time in ages. You have a lot to do that day.", ch:[{t:"Go", e:{r:6,s:-2,m:-2}, x:"You laughed until your stomach hurt."},{t:"Say you'll catch them next time", e:{s:3,r:-2}, x:"You only saw the photos. It was a bit of a shame."}]},
 {title:"Delivery boxes", text:"Things you bought on impulse are piling up at the door.", ch:[{t:"Return them and cut spending", e:{m:4}, x:"Your bank account steadied a bit."},{t:"It made me happy, so that's fine", e:{h:3,m:-3}, x:"Unboxing new things felt good."}]},
 {title:"Rainy day", text:"You forgot your umbrella and it's pouring. The person next to you offers to share theirs.", ch:[{t:"Gratefully share it", e:{r:4,h:3}, x:"It was a short chat, but it warmed your day."},{t:"Just make a run for it", e:{b:-2,h:1}, x:"You got soaked, but for some reason you laughed."}]},
 {title:"Your parent's birthday", text:"Your parent's birthday is next week. Money is tight these days.", ch:[{t:"Buy a nice gift even if it's a stretch", e:{r:6,m:-5}, x:"Your parent bragged about that gift for ages."},{t:"Take them to dinner with a handwritten letter", e:{r:7,h:3}, x:"As your father read the letter, his eyes turned red."}]},
 {title:"New hobby", text:"On the way home, you saw an ad for a climbing gym. The first month is free.", ch:[{t:"Sign up", e:{b:5,r:3,m:-2}, x:"Your palms got scraped raw, but it was fun."},{t:"Resting at home is the best", e:{h:2}, x:"You became one with the sofa."}]},
 {title:"A message at midnight", text:"An ex you broke up with long ago sent a message: “How are you?”", ch:[{t:"Reply", e:{h:-2,r:2}, x:"You exchanged a few words. It felt strange."},{t:"Read it and don't reply", e:{h:1}, x:"You turned your phone face down and tried to sleep."}]},
 {title:"Health app alert", text:"Your health app says your average this week is 2,000 steps a day.", ch:[{t:"Get off one stop early and walk", e:{b:5}, x:"As you walked, your thoughts sorted themselves out."},{t:"Turn off the alerts", e:{b:-2,h:1}, x:"What you don't know can't hurt you, you figured."}]},
 {title:"Weekend plans", text:"For the first time in a while, a weekend with nothing planned.", ch:[{t:"Take a short trip alone", e:{h:6,m:-3}, x:"You sat on an unfamiliar beach for a long time."},{t:"Catch up on studying", e:{s:5,h:-1}, x:"Monday felt much easier."},{t:"Sleep all day", e:{b:3,h:2}, x:"You could feel your body recovering."}]},
 {title:"A junior's question", text:"A new junior hesitantly asks you a question. You're busy too.", ch:[{t:"Explain it step by step", e:{r:5,s:1,h:2}, x:"The junior came back with a coffee for you."},{t:"Tell them to ask later", e:{s:2,r:-3}, x:"The junior never asked again."}]},
 {title:"Selling secondhand", text:"If you sold the things you don't use, you could make decent money.", ch:[{t:"Clear it all out and sell", e:{m:5,h:2}, x:"More space in your room and some extra money."},{t:"Too many memories to sell", e:{h:1}, x:"You put them back in the box."}]},
 {title:"Noisy neighbors", text:"The noise from upstairs has gone on for weeks. You can't sleep well.", ch:[{t:"Go up with a note and some snacks", r:{st:"r", d:0, win:{e:{r:4,b:3}, x:"The neighbors apologized and put down mats."}, lose:{e:{h:-4}, x:"It only led to an awkward argument."}}},{t:"Buy earplugs", e:{b:-1,h:-1}, x:"It took a long time to get used to."}]},
 {title:"Unexpected praise", text:"A boss who rarely speaks looked at your work and said briefly, “Good.”", ch:[{t:"Use that as fuel and dive in deeper", e:{s:5,b:-1}, x:"That week your hands were especially quick."},{t:"Thank them and ask for more feedback", e:{s:3,r:4}, x:"You got more advice than you expected."}]},
 {title:"Savings promotion", text:"Your bank launched a special one-year savings plan. The rate is pretty high.", ch:[{t:"Sign up", e:{m:6,h:-1}, x:"A year later, you had a small nest egg."},{t:"Use the money to learn something you've wanted to", e:{s:5,m:-3}, x:"Money spent on learning was never a waste."}]},
 {title:"Spontaneous get-together", text:"Near the end of the day, coworkers suddenly suggest dinner.", ch:[{t:"Tag along", e:{r:5,m:-2,b:-1}, x:"You talked about things you could never say at the office."},{t:"Go home and rest", e:{b:2,h:1}, x:"You had a quiet evening."}]},
 {title:"Social media feed", text:"Scrolling before bed, everyone looks so happy.", ch:[{t:"Delete the app and open a book", e:{h:3,s:2}, x:"You fell asleep a few pages in. You slept deeply for the first time in a while."},{t:"Scroll until dawn", e:{h:-3,b:-2}, x:"You went to work with puffy eyes."}]},
 {title:"A familiar face", text:"You ran into your old teacher {mentorName} on the street. They've aged a lot.", ch:[{t:"Invite them for a coffee", e:{r:5,h:4}, x:"“I knew you'd do well.” Those words stayed with you."},{t:"Just say hello and keep walking", e:{h:-1}, x:"After you walked away, you regretted it a little."}]},
 {title:"Competition notice", text:"You saw a notice for a {field} competition. The deadline is in two weeks.", ch:[{t:"Stay up all night and submit", r:{st:"s", d:15, win:{e:{s:6,m:5,h:4}, x:"You won an honorable mention. You treated your parents to dinner with the prize."}, lose:{e:{b:-3}, x:"You didn't win. Still, you finished something to the end."}}},{t:"Skip it this time", e:{h:1}, x:"You decided to wait for the next chance."}]},
 {title:"Feeling a cold coming", text:"Your throat is scratchy and you have a slight fever. You have something important tomorrow.", ch:[{t:"Go to bed early and take medicine", e:{b:4,s:-1}, x:"You woke up fine the next day."},{t:"Finish what you were doing anyway", e:{b:-5,s:2}, x:"You were sick for a week."}]},
 {title:"News about your rival", text:"You heard that {rival} won a big award.", ch:[{t:"Send sincere congratulations", e:{r:4,h:2}, x:"“You're next.” came the reply."},{t:"Get fired up and sit back down at your desk", e:{s:5,h:-2}, x:"That night, you were in the zone for the first time in a while."}]},
 {title:"Should you move?", text:"Your lease is ending. Move somewhere bigger, or stay where you are?", ch:[{t:"Move somewhere bigger", e:{h:5,m:-6}, x:"It was a home full of sunlight."},{t:"Stay put", e:{m:4}, x:"You loved your familiar neighborhood."}]},
 {title:"Volunteering", text:"The local community center is looking for weekend volunteers.", ch:[{t:"Join", e:{r:5,h:4,s:-1}, x:"The grandmas there learned your name by heart."},{t:"Donate instead", e:{m:-2,h:2}, x:"It was a small amount, but it put your mind at ease."}]},
 {title:"Broken laptop", text:"Your laptop suddenly won't turn on. Important files are inside.", ch:[{t:"Buy a new laptop", e:{m:-6,s:2}, x:"You marveled at how fast it was."},{t:"Take it to a repair shop and wait", e:{m:-2,h:-2}, x:"It came back to life after a week. You learned the value of backups."}]},
 {title:"To-do list", text:"You have more than twenty things to do. You don't know where to start.", ch:[{t:"Start with the hardest", e:{s:4,h:-1}, x:"Once you finished one, the rest were easy."},{t:"Cross off the easy ones first", e:{h:3,s:1}, x:"The more checkmarks you added, the better you felt."}]},
 {title:"Family trip", text:"Someone in the family group chat suggested a trip.", ch:[{t:"Take time off and go", e:{r:7,h:4,m:-4}, x:"You took a family photo for the first time in years."},{t:"Skip it this time", e:{s:2,r:-3}, x:"The empty spot in the photo stayed on your mind."}]},
 {title:"A request for advice", text:"A younger student from your hometown reached out, wanting to follow the same path as you.", ch:[{t:"Tell them the honest reality", e:{r:3,h:1}, x:"They thanked you and said they would think it over."},{t:"Encourage them", e:{r:4,h:3}, x:"They chose that path. Every now and then, they send you an update."}]},
 {title:"Late-night snack", text:"11 p.m., and you're hungry.", ch:[{t:"Make instant noodles", e:{h:3,b:-2}, x:"They were the best noodles of your life."},{t:"Drink a glass of water and sleep", e:{b:2}, x:"Your morning felt light."}]},
 {title:"Certification", text:"There's a certification exam that would help at work in three months.", ch:[{t:"Study after work", r:{st:"s", d:0, win:{e:{s:6,m:3}, x:"You passed. Your pay went up a little."}, lose:{e:{h:-3}, x:"You narrowly failed."}}},{t:"Now is the time to rest", e:{b:2,h:2}, x:"You took time to recharge."}]},
 {title:"Sorting photos", text:"While cleaning up your phone's photo album, you found photos from years ago.", ch:[{t:"Send the photos to friends from back then", e:{r:5,h:3}, x:"The group chat was buzzing for the first time in ages."},{t:"Quietly get lost in memories alone", e:{h:2}, x:"You've come a long way, you thought."}]},
 {title:"Investment tip", text:"{friend} says there's a hot stock right now and wants you to invest together.", ch:[{t:"Put in a little", r:{st:"luck", d:10, win:{e:{m:8,h:3}, x:"It rose nicely in two months. You sold without getting greedy."}, lose:{e:{m:-7,h:-3}, x:"It lost half its value."}}},{t:"Don't put money into what you don't understand", e:{m:1}, x:"{friend} later said you were smart not to."}]},
 {title:"A good book", text:"A book you picked up by chance at a bookstore captured your heart.", ch:[{t:"Read it all right there", e:{h:4,s:2}, x:"You chewed on the underlined sentences for a long time."},{t:"Buy it and put it on your shelf", e:{m:-1,h:1}, x:"One more book to read someday."}]},
 {title:"Birthday", text:"Today is your birthday. No one seems to know.", ch:[{t:"Treat yourself to a nice dinner", e:{h:5,m:-3}, x:"It was a fine birthday, even alone."},{t:"Reach out to your friends first", e:{r:5,h:4}, x:"It turned out they had a surprise party planned."}]}
];

/* ============ follow-ups: consequences of earlier choices ============ */
var FOLLOWS = [
 {need:"partner", not:"family", title:"A future together", text:"You and {lover} have been together for a while. Friends keep asking when you'll get married.",
  ch:[{t:"Plan the wedding", e:{h:8,r:8,m:-8}, f:"family", x:"You had a small wedding. Many guests cried."},
      {t:"We're happy as we are", e:{h:4,r:3}, x:"The two of you chose the present over formalities."}]},
 {need:"family", title:"Chore wars", text:"You and {lover} often clash over splitting the chores.",
  ch:[{t:"Make a chart and split things fairly", e:{r:5,h:3}, x:"The chart on the fridge brought peace."},
      {t:"Do a little more myself", e:{r:6,b:-3}, x:"{lover} thanked you by cooking a weekend dinner."}]},
 {need:"child", title:"Your child's first school", text:"Your child started school. You wonder whether to sign them up for cram classes.",
  ch:[{t:"Let them run and play freely", e:{h:6,m:2,r:4}, x:"Your child always came home covered in dirt and smiling."},
      {t:"Do as much as other parents do", e:{m:-8,h:-2}, x:"Your child's schedule became busier than yours."}]},
 {need:"own", title:"The temptation to expand", text:"Once things took off, someone suggested opening a second location.",
  ch:[{t:"Expand", r:{st:"s", d:15, win:{e:{m:14,s:6,b:-4}, f:"scale", x:"The second location succeeded too."}, lose:{e:{m:-12,h:-6}, x:"You couldn't manage both and closed one in the end."}}},
      {t:"Do one place right", e:{h:5,r:4}, x:"Regulars were always welcomed by the same taste and the same faces."}]},
 {need:"media", title:"Ad offer", text:"As more people recognized you, ad offers came in. Honestly, you've never used the product.",
  ch:[{t:"Try the product yourself before deciding", e:{r:4,m:4}, x:"Accepting only good products built trust."},
      {t:"It pays, so take them all", r:{st:"luck", d:10, win:{e:{m:12}, x:"Your bank account got fat."}, lose:{e:{m:6,r:-10,h:-6}, x:"You got caught up in a hidden-ad scandal."}}}]},
 {need:"media", title:"Hate comments", text:"A malicious post about you went up on a forum. It has hundreds of comments.",
  ch:[{t:"Calmly set the record straight", e:{r:4,h:-2}, x:"You found out how many people were rooting for you."},
      {t:"Quit social media for a while", e:{h:3,r:-2}, x:"The world off-screen was quieter than you thought."}]},
 {need:"abroad", title:"Leave again?", text:"Someone you worked with abroad asked you to come back.",
  ch:[{t:"Go", e:{s:8,r:-6,m:4}, f:"settled", x:"Your second time abroad was much easier than the first."},
      {t:"Protect what you've built here", e:{r:5,h:3}, x:"You decided to put that experience to use here."}]},
 {need:"burnout", title:"Time to recover", text:"Since the burnout, days of not wanting to do anything keep coming.",
  ch:[{t:"Get counseling", e:{h:8,b:5,m:-4}, x:"Once you put it into words, your mind began to settle."},
      {t:"Throw yourself back into work without rest", e:{s:4,b:-6,h:-5}, x:"The days of pretending to be fine grew longer."}]},
 {need:"injured", title:"Rehab", text:"Your old injury is acting up again. The doctor says you need to change how you work.",
  ch:[{t:"Change how you work", e:{b:6,s:-3}, x:"You slowed down, but now you can keep going for a long time."},
      {t:"Get by on painkillers", e:{b:-8,s:3}, x:"The pain slowly became part of everyday life."}]},
 {need:"doubt", title:"Career counseling", text:"Doubt about whether this is the right path rises again.",
  ch:[{t:"See a career counselor", e:{h:5,s:2,m:-2}, x:"You sorted out again what you're good at and what you love."},
      {t:"Seriously look into other paths", e:{h:-2}, f:"pivot", x:"New possibilities came into view."},
      {t:"Set doubt aside and see it through", e:{s:5,h:2}, x:"The more you were shaken, the deeper your roots grew."}]},
 {need:"mentor", title:"Your teacher retires", text:"Your teacher {mentorName}, who raised you, is retiring. They say they want to leave something in your hands.",
  ch:[{t:"Carry on their legacy", e:{s:6,r:6}, f:"teach", x:"You inherited the worn tools they had used."},
      {t:"Just say thank you", e:{r:3,h:2}, x:"Your teacher smiled and patted your shoulder."}]},
 {need:"teach", title:"News of a former student", text:"You heard that a student you once taught achieved something big. They mentioned your name in an interview.",
  ch:[{t:"Reach out to congratulate them", e:{h:8,r:6}, x:"“It's all thanks to you.” You smiled about it for a long time."},
      {t:"Quietly clip the article", e:{h:5}, x:"You tucked the article away in your desk drawer."}]},
 {need:"pivot", title:"First steps on a new path", text:"You've started looking into other work. Everything in the new field is unfamiliar.",
  ch:[{t:"Start completely fresh", r:{st:"luck", d:5, win:{e:{h:8,s:4}, x:"It was a calling you found late."}, lose:{e:{m:-8,h:-4}, x:"It was harder than you thought."}}},
      {t:"Blend it with what you used to do", e:{s:5,m:3}, x:"You became someone who connects two fields."}]},
 {need:"breakup", title:"A message from the past", text:"{lover}, whom you broke up with, reached out. They want to meet once.",
  ch:[{t:"Meet", r:{st:"r", d:10, win:{e:{h:10,r:8}, f:"partner", x:"You decided to start again. This time feels different."}, lose:{e:{h:-6}, x:"You only confirmed how much you've both changed."}}},
      {t:"Keep it as a good memory", e:{h:3,s:2}, x:"You politely declined. You felt at peace."}]},
 {need:"hotel", title:"Executive chef promotion exam", text:"The hotel posted an internal promotion exam. Your competitor is {rival}.",
  ch:[{t:"Go for it", r:{st:"s", d:10, win:{e:{s:10,m:8}, f:"bigplace", x:"You were promoted. Now the whole kitchen follows your lead."}, lose:{e:{h:-6}, x:"{rival} got the promotion. Your hand shook as you congratulated them."}}},
      {t:"Aim for the next chance", e:{s:4}, x:"You sharpened your skills for another year."}]},
 {need:"settled", title:"Permanent residency review", text:"Your permanent residency decision is coming soon. You got word that one document is missing.",
  ch:[{t:"Take time off and handle it yourself", e:{m:-3,s:2}, x:"Your residency came through. Now this place is truly home."},
      {t:"Leave it to an agency", r:{st:"luck", d:0, win:{e:{m:-5,h:5}, x:"It was handled without a hitch."}, lose:{e:{m:-6,h:-8}, x:"It got delayed, and you had to wait another year."}}}]},
 {need:"rivalfriend", title:"Your rival's offer", text:"{rival}, your rival from school days, reached out to work together.",
  ch:[{t:"Join forces", r:{st:"r", d:5, win:{e:{s:8,m:8}, f:"own", x:"The two of you made a far stronger team than expected."}, lose:{e:{r:-6,m:-4}, x:"Your directions differed, and you split after a year."}}},
      {t:"Cheer each other on separately", e:{r:4}, x:"You became friends who meet for a drink now and then."}]},
 {need:"grandma", title:"Grandma's notebook", text:"You heard your grandmother is unwell. The recipe notebook you once wrote comes to mind.",
  ch:[{t:"Recreate her flavor and visit her", e:{r:10,h:4}, x:"After one spoonful, your grandmother said, “That's my taste.”"},
      {t:"Make a dish from that recipe", e:{s:8,h:3}, x:"You named the dish after your grandmother."}]}
];

/* ============ real-year events ============ */
var ERAS = [
 {y:1997, title:"Asian financial crisis", text:"The news talks about the IMF every day. One by one, adults around you lose their jobs.",
  ch:[{t:"Save money for the family's sake", e:{m:5,h:-4,r:4}, x:"You cut your allowance and talked with your family more often."},{t:"Keep going on your path anyway", e:{s:4,h:-2}, x:"You were anxious, but you didn't let go."}]},
 {y:2002, title:"2002 World Cup", text:"The whole country is wearing red. Tonight is the semifinal.", ch:[{t:"Go out and cheer in the streets", e:{h:9,r:6}, x:"You hugged strangers and screamed together."},{t:"Use the time to get things done", e:{s:4,h:-2}, x:"You listened to the cheers from far away."}]},
 {y:2008, title:"Global financial crisis", text:"Financial crisis news pours in every day. Job openings have noticeably dropped.",
  ch:[{t:"Tighten your belt", e:{m:6,h:-3}, x:"It was hard, but you made it through."},{t:"Turn the crisis into a chance to build skills", e:{s:6,m:-3}, x:"When the economy recovered, you were ready."}]},
 {y:2010, title:"Smartphones arrive", text:"One by one, people around you bought smartphones. The world is moving into the palm of your hand.",
  ch:[{t:"Use the new tool at work right away", e:{s:5,m:-2}, x:"You rode the change a step ahead of others."},{t:"Wait and see for now", e:{m:2}, x:"A few years later, everyone was using one."}]},
 {y:2020, title:"COVID-19", text:"The streets are empty. You can't go out without a mask, and so much has stopped.",
  ch:[{t:"Move your work online", r:{st:"s", d:5, win:{e:{s:6,m:6}, x:"In the middle of the crisis, a new path opened up."}, lose:{e:{m:-8,h:-4}, x:"You struggled with the unfamiliar way of working."}}},
      {t:"Live off your savings", e:{m:-8,b:2}, x:"It was a long, long time."},
      {t:"Use the time to study", e:{s:6,m:-4,h:-1}, x:"While time stood still, you grew inside."}]},
 {y:2022, title:"Interest rate shock", text:"Interest rates soared. Loan payments and prices are rising together.",
  ch:[{t:"Pay off loans first", e:{m:5,h:-2}, x:"Once your debt shrank, you slept better."},{t:"Cut spending and hold on", e:{m:2,h:-3}, x:"Home cooking replaced eating out."}]},
 {y:2023, title:"The age of generative AI", text:"AI writes and draws. The way people work is changing fast.",
  ch:[{t:"Learn AI and use it at work", e:{s:6,m:3}, x:"With less repetitive work, you could focus on what matters."},{t:"Focus on what only people can do", e:{s:3,h:3,r:3}, x:"The feel of skilled hands and trust between people couldn't be replaced."}]}
];

/* ============ yearly focus ============ */
var PLANS = [
  {t:"Focus on building your skills", e:{s:6,b:-3}, focus:"s", x:"You grew noticeably over the year."},
  {t:"Spend time with people", e:{r:6,m:-2}, focus:"r", x:"The people beside you became even more precious."},
  {t:"Save money and prepare for the future", e:{m:6,h:-2}, focus:"m", x:"Your savings grew bit by bit."},
  {t:"Take care of your body and mind", e:{b:5,h:3,s:-1}, focus:"b", x:"You spent a year without getting sick."}
];

/* ============ recurring characters ============ */
var NAMES = ["Alex","Jordan","Sam","Taylor","Riley","Casey","Morgan","Jamie","Avery","Quinn","Drew","Skyler","Jesse","Robin","Charlie","Emery","Rowan","Kai","Noah","Mia"];
var SURNAMES = ["Smith","Garcia","Lee","Brown","Chen","Lopez","Martin","Wilson","Davis","Clark","Kim","Taylor","Moore","Hall"];

/* ============ v4: path-aware content ============
   New placeholders: {untaken} {taken} {situation} {years} {forkAge} */

/* events that keep coming back to the road you chose (any field) */
var PATH_EVENTS = [
 {ph:["teen","early"], title:"The weight of a choice", text:"It hasn't been long since you chose '{untaken}'. Your old friends posted photos from their life on the '{taken}' side. They all look happy.",
  ch:[{t:"Trust your choice and focus on now", e:{s:5,h:2}, x:["You remembered why you chose '{untaken}'. Your heart felt steady again.","Once you stopped comparing, today's work came into focus."]},
      {t:"Message your friends and catch up", e:{r:6,h:2}, x:["Different roads, but friends are still friends.","Talking about each other's days, you lost track of time."]},
      {t:"Wonder if you should have gone their way", e:{h:-4}, f:"doubt", x:["You tossed and turned all night. No answer came.","For a while, a corner of your heart felt heavy."]}]},
 {ph:["teen","early"], title:"The first time you were recognized", text:"On the '{untaken}' road, you heard it for the first time: “You've got a gift for this.”",
  ch:[{t:"Set a higher goal", e:{s:7,b:-3}, x:["That night, you wrote your next goal in your notebook.","The praise became fuel, and you ran without stopping for a while."]},
      {t:"Brag to your family", e:{r:6,h:5}, x:["Your family asked you to repeat those words again and again.","“See? We knew you'd be good at it.” The voice on the phone was bright."]},
      {t:"Try not to get carried away", e:{s:3,h:1}, x:["You calmly kept doing what you do. That lasted longer."]}]},
 {ph:["early","late"], title:"The reality of the road", text:"Now that you're deep into the '{untaken}' road, it's very different from how it looked from outside. Money and time are tighter than you expected.",
  ch:[{t:"Keep going to the end anyway", r:{st:"s", d:5, win:{e:{s:8,h:4}, x:"As you held on, the road slowly widened."}, lose:{e:{h:-6,m:-4}, x:"Days went on where holding on was all you could do."}}},
      {t:"Adjust your goals to reality", e:{m:5,h:2}, x:["Lowering your goal a little actually let you breathe.","You started enjoying reaching small goals one by one."]},
      {t:"Look into other roads for a while", e:{h:-2}, f:"pivot", x:["A new option appeared."]}]},
 {ph:["early","late"], title:"Why that road?", text:"Someone you just met asked, “Why did you choose '{untaken}' instead of '{taken}'?”",
  ch:[{t:"Honestly tell them the story of that day", e:{r:6,h:3}, x:["As you told it, you felt a little proud of who you were that day.","They listened, nodding, until the very end."]},
      {t:"Smile and say “No real reason”", e:{h:1}, x:["Some choices can't be fully explained in words."]},
      {t:"Say you still don't know yourself", e:{h:-2,r:3}, x:["They laughed and said, “That's how it is for everyone.”"]}]},
 {ph:["early","late"], title:"Someone you could only meet on that road", text:"You met {lover}, someone you never would have met if you hadn't chosen '{untaken}'.",
  ch:[{t:"Start the conversation", r:{st:"r", d:0, win:{e:{h:10,r:8}, f:"partner", x:"Before long, you were part of each other's everyday life."}, lose:{e:{h:-3,r:2}, x:"You stayed on good terms."}}},
      {t:"Focus on this road for now", e:{s:4,h:-2}, x:["Sometimes you thought of that person.","Instead, you grew a lot that year."]}]},
 {ph:["late","thirty"], title:"People on the same road", text:"A group formed for people walking the '{untaken}' road.",
  ch:[{t:"Lead the group yourself", e:{r:8,s:3,b:-3}, x:["People began gathering around you."]},
      {t:"Drop by now and then just for information", e:{s:4,r:2}, x:["A few meetups gave you years' worth of know-how."]},
      {t:"Walking alone is easier", e:{h:3}, x:["You learned you have a pace of your own."]}]},
 {ph:["late","thirty","mid"], title:"What has piled up", text:"It's been {years} years since you chose '{untaken}'. Writing down what you've built, it's more than you thought.",
  ch:[{t:"Make your next plan", e:{s:5,m:3}, x:["A page of your notebook filled up fast.","With a new goal, your heart raced again."]},
      {t:"Give yourself a vacation for all the hard work", e:{h:7,b:4,m:-4}, x:["For the first time in ages, you spent a week doing nothing."]},
      {t:"Reach out to people you're grateful to", e:{r:8}, x:["“I knew you'd make it.” Replies poured in."]}]},
 {ph:["thirty","mid"], title:"The friend who took the other road", text:"You met your old friend {friend}, who went the '{taken}' way, for the first time in a long while. You each seem a little envious of the other's life.",
  ch:[{t:"Share what you each learned on your roads", e:{r:6,s:3}, x:["Together, the two roads felt like one complete life."]},
      {t:"Put up a proud front for no reason", e:{h:-3}, x:["On the way home, you regretted it a little."]},
      {t:"Their life looks better, and your heart wavers", e:{h:-4}, f:"doubt", x:["The thought wouldn't leave you for days."]}]},
 {ph:["thirty","mid"], title:"A junior's crossroads", text:"A junior came to you, torn between '{untaken}' and '{taken}'. They have the exact face you had at {forkAge}.",
  ch:[{t:"Tell them about the road you walked, just as it was", e:{r:7,h:4}, f:"teach", x:["The look in their eyes changed."]},
      {t:"Tell them either way is okay", e:{r:5,h:5}, x:["Those were really the words you'd wanted to hear back then."]},
      {t:"Suggest weighing the practical factors first", e:{s:3,r:2}, x:["You wrote down the pros and cons together."]}]},
 {ph:["mid"], title:"A road that became your name", text:"The '{untaken}' road you started at {forkAge}. Now that road has become the name that describes you.",
  ch:[{t:"Add one more new challenge", r:{st:"s", d:10, win:{e:{s:9,h:6}, x:"That challenge became another signature work."}, lose:{e:{b:-5,m:-5}, x:"It wasn't easy, but you remained someone who keeps trying."}}},
      {t:"Write down the road you walked", e:{s:4,h:4}, f:"teach", x:["That record became a map for others on the same road."]},
      {t:"Slow down and take care of those around you", e:{r:7,h:5}, x:["You sat down at the dinner table more often."]}]}
];

/* scenes that quote what you wrote about that day */
var CALLBACKS = [
 {title:"The worry back then",
  textS:"You suddenly thought of yourself at {forkAge}. Back then, this is what you were worried about:\n“{situation}”\nWhat answer is today's you giving to that worry?",
  text:"You suddenly remembered being {forkAge}, torn between '{taken}' and '{untaken}'. What answer is today's you giving to that worry?",
  ch:[{t:"Tell your younger self, “You chose well”", e:{h:6}, x:["You got a little choked up. Still, you smiled."]},
      {t:"Now you know what you didn't know then", e:{s:4,h:2}, x:["In the end, the answer came from walking the road."]},
      {t:"You're still searching for the answer", e:{h:-1,s:2}, x:["You thought searching was part of this road, too."]}]},
 {title:"The diary from that day",
  textS:"While moving, you found a diary you kept at {forkAge}. It's the entry from the night before you chose '{untaken}'.\n“{situation}”",
  text:"While moving, you found a diary you kept at {forkAge}. It's the entry from the night before you chose '{untaken}'. The handwriting is shaky.",
  ch:[{t:"Continue the story on the diary's last page", e:{h:5,s:2}, x:["After {years} years, the next page of the diary was filled."]},
      {t:"Take a photo of that page and send it to your family", e:{r:5,h:3}, x:["“You really agonized over that back then.” came the reply."]},
      {t:"Quietly close it and live today", e:{h:2}, x:["The you of that day was already brave enough."]}]},
 {title:"Why you chose that road",
  textS:"You went back to your hometown for the first time in a while. It's where that worry began.\n“{situation}”\nThat feeling still seems to linger somewhere in this town.",
  text:"You went back to your hometown for the first time in a while. It's the town where you were torn between '{taken}' and '{untaken}'.",
  ch:[{t:"Walk the places you used to go", e:{h:5,b:2}, x:["Everything looked smaller. As much as you've grown."]},
      {t:"Visit someone who cheered you on back then", e:{r:7}, x:["“So, how's that road?” You talked for a long time answering that question."]},
      {t:"Take one photo and head back", e:{h:2}, x:["On the way back, you felt strong again."]}]}
];

/* a different first scene for each field */
var FIRSTS = {
 culinary:{text:"On day one, you got a white chef's jacket. Your hand trembles as you put a name tag on your knife case.",
  ch:[{t:"Arrive first and leave last", e:{s:6,b:-2}, x:"The seniors started learning your name."},
      {t:"Share recipe notebooks with classmates", e:{r:6,s:2}, x:"In the first week, you found a best friend."},
      {t:"Call home and brag about what you cooked today", e:{r:4,h:5}, x:"On the other end of the line, your mom laughed."}]},
 arts:{text:"First class, standing at an empty workbench. The room is already full of talented people.",
  ch:[{t:"Don't shrink back. Show your own style", e:{s:5,h:3}, x:"The teacher paused for a moment in front of your work."},
      {t:"Sit next to someone who's really good", e:{s:6,r:2}, x:"Just learning by watching made you improve a lot."},
      {t:"Buy a new sketchbook for your work", e:{s:3,h:3}, x:"On the first page, you wrote “Starting today.”"}]},
 sports:{text:"On the first day of training, you could barely breathe standing on the field. Everyone is faster than you.",
  ch:[{t:"Starting today, show up an hour early every day", e:{s:6,b:2}, x:"A month later, the coach called your name."},
      {t:"Ask the coach about your weaknesses", e:{s:5,r:3}, x:"It stung, but you learned what to do."},
      {t:"Make friends with teammates first", e:{r:7}, x:"Even hard training was bearable together."}]},
 abroad:{text:"Stepping off the plane, strange air rushed in. Your phone is full of “Did you land?” messages.",
  ch:[{t:"Go out right away to make local friends", e:{r:6,s:3}, x:"A conversation in broken words became your first friendship."},
      {t:"Video-call your family", e:{r:4,h:4}, x:"Seeing your family's faces on the screen put you at ease."},
      {t:"Walk alone, memorizing the neighborhood map", e:{s:4,h:2}, x:"You got lost three times, but the neighborhood became a little yours."}]},
 business:{text:"You got your business registration. Your bank balance and your list of dreams sit side by side.",
  ch:[{t:"Go out yourself to find your first customer", e:{s:6,b:-2}, x:"Around the time your soles wore thin, you got your first signed contract."},
      {t:"Make a detailed one-year plan", e:{m:5,s:2}, x:"The plan covered an entire wall."},
      {t:"Send thank-you messages to everyone who supported you", e:{r:7}, x:"Your first customer came through someone who got one of those messages."}]},
 academic:{text:"After the first class, you sighed at the pile of books on your desk. Still, your heart is racing.",
  ch:[{t:"Make the front seat in the library yours", e:{s:6}, x:"That seat was yours for years."},
      {t:"Gather people to study with", e:{r:5,s:3}, x:"You formed a team that fills in each other's gaps."},
      {t:"Go say hello to the teacher first", e:{r:4,s:3}, x:"“I like students who ask lots of questions.” A door opened."}]},
 work:{text:"On your first day at work, you hung the ID badge around your neck. The you in the mirror looks a bit grown-up.",
  ch:[{t:"Carry a notepad and write everything down", e:{s:5,r:2}, x:"Within a week, you heard “You learn fast.”"},
      {t:"Make friends with coworkers at lunch", e:{r:6}, x:"You found someone to grab coffee with on hard days."},
      {t:"Get through it imagining your first paycheck", e:{h:4,m:2}, x:"At the top of the list was a gift for your parents."}]},
 love:{text:"That day, you found your courage. Your heart pounded so hard your voice shook.",
  ch:[{t:"Tell them honestly how you feel", e:{r:6,h:4}, x:"They laughed for a while, then nodded."},
      {t:"Slowly, approach as a friend", e:{r:4,h:3}, x:"You grew a little closer every day."},
      {t:"Lie awake all night waiting for an answer", e:{h:-2,r:3}, x:"At dawn, a short reply came, and you kicked off your blanket."}]},
 generic:{text:"Your first day after choosing '{untaken}'. No one can tell you the right answer on this road, which makes it more exciting.",
  ch:[{t:"Start by writing a list of what you want to do", e:{s:5,h:2}, x:"The list was longer than you expected."},
      {t:"Find someone who walked this road before you", e:{r:5,s:3}, x:"One sentence from them saved you months of trial and error."},
      {t:"Just dive in", e:{h:5,s:3}, x:"It was more doable than you thought. And harder than you thought."}]}
};

/* opening lines that tie an everyday scene back to your road */
var LEADS = {
 teen:["One day, as your days at '{untaken}' rushed by.","Around the time you started getting used to life at the {place}.","It was a day you never would have had if you'd chosen '{taken}'."],
 early:["While spending a slightly different kind of 20s, thanks to choosing '{untaken}'.","{years} years into this road, you were just starting to see your place.","While your peers walked the '{taken}' road, you were seeing a different view."],
 late:["{years} years on the '{untaken}' road.","Hardly anyone asks anymore whether you regret choosing this road.","Around the time your days at the {place} felt like half your life."],
 thirty:["{years} years after choosing '{untaken}', you had somehow become someone's senior.","That day's choice has now become your everyday life.","Around the time you'd occasionally hear news of friends on the '{taken}' side."],
 mid:["You've spent {years} years on the road you began at {forkAge}.","Now '{untaken}' has become one word that describes you.","Looking back, that day's choice changed so much."]
};

/* the yearly check-in, written around your road */
var PLAN_TXT = {
 title:"The '{untaken}' road, year {years}",
 ask:"Where will you put your energy this year? Luck-based choices tied to it go a little better.",
 s_hi:"Your skills on that road are visibly growing.", s_lo:"You're still searching for certainty on that road.",
 r_hi:"The people you met on that road are a real source of strength.", r_lo:"While walking so busily, you've drifted a little from people.",
 m_lo:"Your bank balance keeps weighing on your mind.", b_lo:"Your body is slowly getting worn out.",
 h_hi:"Life is pretty fun these days.", h_lo:"Your heart gets tired often.", mid:"Good days and hard days take turns."
};
var PLANS_PATH = [
  {t:"Dig deeper into '{untaken}'", e:{s:6,b:-3}, focus:"s", x:["You grew noticeably over the year.","The next step on that road came into view."]},
  {t:"Spend time with people you met on that road", e:{r:6,m:-2}, focus:"r", x:["The people beside you became even more precious.","Having people to walk with was a big strength."]},
  {t:"Save money so you can walk this road for a long time", e:{m:6,h:-2}, focus:"m", x:["Your savings grew bit by bit.","It stings now, but next year's you will be grateful."]},
  {t:"Take care of your body and mind so you don't burn out", e:{b:5,h:3,s:-1}, focus:"b", x:["You spent a year without getting sick.","It was a year of learning how to rest."]}
];

/* extra options that can appear in any scene, so choices differ every life */
var WILDCARDS = [
  {t:"Ask {friend} for advice", e:{r:4,h:2}, x:["{friend} gave you an answer you never expected.","Talking it through with {friend}, the answer became clear."]},
  {t:"Sleep on it and think again tomorrow", e:{b:3,h:1}, x:["By morning, your head was clear.","After a night's sleep, the worry looked a little smaller."]},
  {t:"Ask the {mentor} for their opinion", e:{s:3,r:3}, x:["The {mentor}'s advice was short but spot-on.","“You have to decide, or you'll regret it.” Those words stayed with you."]},
  {t:"Flip a coin", r:{st:"luck", d:0, win:{e:{h:5,s:2}, x:"The coin picked a better side than you expected."}, lose:{e:{h:-3}, x:"The moment the coin landed, you realized you really wanted the other side."}}},
  {t:"Sort out your feelings in a journal", e:{h:4,s:1}, x:["As you wrote, your mind settled.","Just a few lines, and you felt much lighter."]},
  {t:"Open up to your family", e:{r:5,h:2}, x:["Your family was on your side, as always.","“Do whatever makes you happy.” That was enough."]},
  {t:"Remember why you chose '{untaken}'", e:{s:3,h:3}, x:["The feeling of that day came back. The answer was already there.","Remembering your first reason, the hesitation faded."]},
  {t:"Take a walk to clear your head", e:{b:3,h:2}, x:["After about an hour of walking, your thoughts were in order.","As you walked, the problem looked simpler than you thought."]},
  {t:"Decide alone without telling anyone", e:{s:3,r:-2}, x:["You chose it yourself, so the responsibility was all yours."]},
  {t:"Think about what {rival} would do", e:{s:4}, x:["Through a rival's eyes, you saw what you'd missed."]},
  {t:"Boldly do the exact opposite", r:{st:"h", d:10, win:{e:{h:6,s:4}, x:"A choice no one expected led to a surprising result."}, lose:{e:{h:-5}, x:"It was too much after all. At least you got a good story out of it."}}}
];

/* a short line added to a result now and then, based on your personality */
var TRAIT_FLAVOR = {
  grit:{win:"A result worthy of your persistence.", lose:"Still, persistent as you are, you didn't give up."},
  optimist:{win:"You laughed, saying you knew it would work out.", lose:"Still, you laughed it off: “Next time, for sure.”"},
  social:{win:"The people around you celebrated with you.", lose:"Your friends reached out first to comfort you."},
  careful:{win:"It paid off to prepare in advance.", lose:"Thanks to careful preparation, the damage was small."},
  adventurous:{win:"You only find out by trying.", lose:"Still, you figured it beat never trying."},
  delicate:{win:"Paying attention to small details worked.", lose:"A small mistake stayed on your mind for a long time."},
  strong:{win:"Your stamina carried you through.", lose:"Your body held up, but your heart got a little tired."},
  sensitive:{win:"Noticing what others missed really helped.", lose:"For days, it wouldn't leave your mind."},
  planner:{win:"Right according to plan.", lose:"You figured you'd just make a new plan."},
  spontaneous:{win:"A spontaneous choice brought unexpected luck.", lose:"You decided to think a little more next time."}
};

/* more events for each field */
EVENTS.push(
 {dom:"arts", ph:["teen","early"], title:"The night before the deadline", text:"It's the night before the deadline, and you're not happy with your work.",
  ch:[{t:"Start over from scratch", r:{st:"s", d:10, win:{e:{s:10,h:4}, x:"The redone piece was your best yet."}, lose:{e:{b:-6,h:-4}, x:"In the end, you missed the deadline."}}},
      {t:"Polish what you have", e:{s:4,h:2}, x:["It wasn't perfect, but it was a piece you saw through to the end."]}]},
 {dom:"arts", ph:["early","late"], title:"Your first fan", text:"A stranger sent a message: “Your work got me through a hard time.”",
  ch:[{t:"Write a heartfelt reply", e:{r:6,h:8}, x:["You've been exchanging messages with that person for years."]},
      {t:"Put that feeling into your next piece", e:{s:6,h:5}, x:["You made the next piece thinking of that person."]}]},
 {dom:"arts", ph:["thirty","mid"], title:"A sponsorship offer", text:"A company wants to sponsor your work. In return, their logo has to appear on it.",
  ch:[{t:"Accept", e:{m:10,h:-2}, x:["Your working conditions improved dramatically."]},
      {t:"Keep your work your own", e:{h:5,m:-3}, x:["You were broke, but proud."]},
      {t:"Negotiate the terms", r:{st:"r", d:10, win:{e:{m:8,h:3}, x:"You got the sponsorship without the logo."}, lose:{e:{r:-3}, x:"The negotiation fell through."}}}]},
 {dom:"sports", ph:["teen","early"], title:"First official game", text:"You're playing your first official game. Your family is in the stands.",
  ch:[{t:"Enjoy the nerves", r:{st:"s", d:5, win:{e:{s:8,h:8}, x:"You scored in your first game. Your family jumped to their feet."}, lose:{e:{h:-5,s:3}, x:"You made mistake after mistake. Your family clapped anyway, all the way to the end."}}},
      {t:"Focus on not making mistakes", e:{s:4,h:2}, x:["You got through your first game without trouble."]}]},
 {dom:"sports", ph:["early","late"], title:"Stuck numbers", text:"Your times have been stuck for months. The coach blames your form; teammates blame your mindset.",
  ch:[{t:"Rebuild your form from scratch", e:{s:6,h:-2}, x:["Two months later, your times started moving again."]},
      {t:"Get counseling", e:{h:6,b:2,m:-3}, x:["As your mind lightened, so did your body."]},
      {t:"Take a break and rediscover the joy of the sport", e:{h:7,s:-2}, x:["The feeling from your very first day came back."]}]},
 {dom:"sports", ph:["thirty","mid"], title:"A role model for juniors", text:"Juniors say you're their role model.",
  ch:[{t:"Help the juniors train", e:{r:7}, f:"teach", x:["By teaching, you learned even more."]},
      {t:"Show them you'll compete to the very end", e:{s:5,b:-4}, x:["The juniors shouted your name from the stands."]}]},
 {dom:"abroad", ph:["teen","early"], title:"Food that doesn't suit you", text:"Local food doesn't agree with you, so you eat instant noodles every day.",
  ch:[{t:"Ask local friends for their favorite places", e:{r:5,h:4}, x:["At the third place, you found your all-time favorite dish."]},
      {t:"Cook food from home yourself", e:{h:5,m:-2}, x:["You spent half a day crossing the city for ingredients."]},
      {t:"Endure and adapt", e:{b:-3,s:2}, x:["After about three months, your taste changed."]}]},
 {dom:"abroad", ph:["early","late"], title:"Two names", text:"Locally, people call you by a local-style name. Sometimes you're not sure who you really are.",
  ch:[{t:"Accept the local name as part of you too", e:{h:4,r:4}, x:["You realized both names are you."]},
      {t:"Ask to be called by your real name", e:{h:5,r:2}, x:["Your coworkers called your name in their clumsy accents."]}]},
 {dom:"abroad", ph:["thirty","mid"], title:"Go back or stay?", text:"Your parents are getting older. You wonder whether to go back home.",
  ch:[{t:"Go back", e:{r:10,s:-4}, f:"returned", x:["Your parents waved at the airport."]},
      {t:"Stay, but visit twice a year without fail", e:{r:5,m:-6}, f:"settled", x:["Life between two countries became familiar."]},
      {t:"Bring your parents here", r:{st:"r", d:15, win:{e:{r:8,h:6}, x:"Your parents liked life here more than expected."}, lose:{e:{h:-6,m:-6}, x:"Within a few months, your parents missed home."}}}]},
 {dom:"business", ph:["teen","early"], title:"First failure", text:"Your first product didn't sell a single unit.",
  ch:[{t:"Ask customers directly why", e:{s:7,h:-2}, x:["The answer hurt, but it was accurate."]},
      {t:"Lower the price", e:{m:-3,s:3}, x:["It slowly started selling."]},
      {t:"Switch to a completely different idea", r:{st:"luck", d:10, win:{e:{m:8,s:4}, x:"The second idea took off."}, lose:{e:{m:-6}, x:"The second one wasn't easy either."}}}]},
 {dom:"business", ph:["early","late"], title:"First employee", text:"You're hiring your first employee.",
  ch:[{t:"Value attitude over skill", e:{r:6,s:2}, x:["That employee became a reliable colleague for years."]},
      {t:"Bring in an experienced hire at a high salary", e:{s:6,m:-6}, x:["The pace of work changed dramatically."]},
      {t:"Bring in a friend", r:{st:"r", d:10, win:{e:{r:6,s:4}, x:"Your friend became the best partner you could ask for."}, lose:{e:{r:-8}, x:"Work made things awkward with your friend."}}}]},
 {dom:"business", ph:["thirty","mid"], title:"The boss who never rests", text:"The company runs, but you haven't taken a day off in a year.",
  ch:[{t:"Take a month off", e:{h:8,b:6,m:-4}, x:["When you came back, the company was running better than you expected."]},
      {t:"Train people you can hand work to", e:{r:5,b:3}, x:["Once you had someone to trust, you could breathe."]},
      {t:"Push harder, since this is the moment", e:{m:6,b:-8}, x:["Sales went up, but your body screamed."]}]},
 {dom:"academic", ph:["teen","early"], title:"Exam-season temptation", text:"It's exam season, and your friends want to go out.",
  ch:[{t:"Study", e:{s:6,r:-2}, x:["Your grades proved it was the right call."]},
      {t:"Have fun for just one day", e:{h:6,r:4,s:-2}, x:["A photo from that day is still your phone wallpaper."]},
      {t:"Convince them to study together", e:{r:5,s:3}, x:["You studied together at a café until late at night."]}]},
 {dom:"academic", ph:["early","late"], title:"An advisor who thinks differently", text:"You keep clashing with your advisor about the direction of your research.",
  ch:[{t:"Argue your view to the end", r:{st:"s", d:10, win:{e:{s:8}, x:"In the end, your advisor nodded."}, lose:{e:{r:-6}, x:"It only made things awkward."}}},
      {t:"Follow for now and learn what you can", e:{s:4,r:3}, x:["Looking back, that time was learning too."]},
      {t:"Find a different advisor", e:{h:3,s:-3}, x:["The new lab suited you much better."]}]},
 {dom:"academic", ph:["thirty","mid"], title:"Your first lecture", text:"For the first time, you'll give a lecture in front of a big audience.",
  ch:[{t:"Prepare all night", r:{st:"s", d:0, win:{e:{s:6,r:5}, x:"After the lecture, people lined up to ask questions."}, lose:{e:{h:-4}, x:"You were so nervous you got through less than half of what you prepared."}}},
      {t:"Talk naturally, like you always do", e:{h:4,r:4}, x:["People said it was a comfortable lecture."]}]},
 {dom:"work", ph:["teen","early"], title:"A big mistake", text:"You made a big mistake in a report. It has already gone up the chain.",
  ch:[{t:"Report it right away and fix it", e:{r:4,s:3,h:-2}, x:["“Glad you told us quickly.” It actually built trust."]},
      {t:"Quietly fix it and move on", r:{st:"luck", d:10, win:{e:{h:2}, x:"No one noticed."}, lose:{e:{r:-8,h:-5}, x:"It came out in the end. Hiding it was worse than the mistake."}}}]},
 {dom:"work", ph:["early","late"], title:"A question at the team dinner", text:"At a team dinner, your boss asks what you want to do in the future.",
  ch:[{t:"Talk honestly about your dream", e:{r:5,h:3}, x:["Your boss listened seriously."]},
      {t:"Keep it safe", e:{r:2}, x:["It was an ordinary evening."]},
      {t:"Use the chance to name the team you want", r:{st:"r", d:10, win:{e:{s:6}, x:"In the next reshuffle, you moved to that team."}, lose:{e:{r:-3}, x:"The mood got awkward for a moment."}}}]},
 {dom:"work", ph:["thirty","mid"], title:"A junior thinking of quitting", text:"A junior you care about came to you, thinking about quitting.",
  ch:[{t:"Ask them to stay", e:{r:3}, x:["They decided to stay one more year."]},
      {t:"Support their new path", e:{r:6,h:3}, x:["They left you a handwritten note when they went."]},
      {t:"Honestly share your own experience", e:{r:5,s:2}, x:["After thinking it over for a long time, they found their own answer."]}]},
 {dom:"love", ph:["early","late","thirty"], title:"A forgotten anniversary", cond:S=>S.flags.has("partner"), text:"You forgot your anniversary. {lover} is hurt.",
  ch:[{t:"Sincerely apologize and plan a surprise", e:{r:6,m:-3}, x:["In the end, {lover} burst out laughing."]},
      {t:"Make excuses", e:{r:-5}, x:["Things were cold for days."]},
      {t:"Write a handwritten letter", e:{r:5,h:3}, x:["{lover} carries that letter in their wallet."]}]},
 {dom:"love", ph:["late","thirty"], title:"Different dreams", cond:S=>S.flags.has("partner"), text:"{lover} wants to start something new somewhere far away.",
  ch:[{t:"Go together", e:{r:8,s:-5}, x:["A new life for just the two of you began in an unfamiliar place."]},
      {t:"Support them and wait", r:{st:"r", d:10, win:{e:{r:8,h:4}, x:"The distance was far, but your hearts grew closer."}, lose:{e:{h:-8}, f:"breakup", x:"In the end, you decided to go separate ways."}}},
      {t:"Share your own dream too", e:{r:4,s:3}, x:["For the first time, you talked seriously about each other's dreams."]}]},
 {dom:"love", ph:["thirty","mid"], title:"An old photo", cond:S=>S.flags.has("partner"), text:"You found a photo from when you first met {lover}.",
  ch:[{t:"Go back to that place", e:{r:7,h:6}, x:["You sat in the same spot as back then and took a photo."]},
      {t:"Put the photo in a frame", e:{h:4,r:3}, x:["That day now hangs on the living room wall."]}]}
);
