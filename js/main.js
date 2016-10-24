var knight
var dragon = {}
var gameID
var weatherCode

var knightsSent
var dragonDeaths

var dragonNames = [
  "Aayush",
  "Akarsh",
  "Darshit",
  "Dhruv",
  "Eshan",
  "Faiyaz",
  "Gurkiran",
  "Hansh",
  "Indrajit",
  "Jayesh",
  "Lakshit",
  "Lakshay",
  "Madhup",
  "Mitul",
  "Neerav",
  "Nishith",
  "Ojas",
  "Pranay",
  "Priyansh",
  "Rachit",
  "Reyansh",
  "Ranbir",
  "Rohan",
  "Sahil",
  "Samar",
  "Shaan",
  "Shlok",
  "Shray",
  "Shreyas",
  "Tushar",
  "Uthkarsh",
  "Vaibhav",
  "Vihaan",
  "Vivaan",
  "Yakshit",
  "Additri",
  "Aaryahi",
  "Bhavya",
  "Charvi",
  "Drishya",
  "Eva",
  "Hrishita",
  "Inaaya",
  "Ira",
  "Jivika",
  "Jiya",
  "Kashvi",
  "Kavya",
  "Keya",
  "Khushi",
  "Kiara",
  "Mahika",
  "Mishti",
  "Navya",
  "Nitya",
  "Parinaaz",
  "Prisha",
  "Saanvi",
  "Samaira"
]

const equiv = {
  "attack": "scaleThickness",
  "armor": "clawSharpness",
  "agility": "wingStrength",
  "endurance": "fireBreath",
}

$("#fetchKnight").click(function(){
  $(".results").empty()
  knightsSent++
  axios.get("http://www.dragonsofmugloar.com/api/game").then(function(response){
    knight = response.data.knight
    gameID = response.data.gameId
    $("#gameID").html(gameID)
    $("#knightName").html(knight.name)
    $("#knightAttack").html(knight.attack)
    $("#knightArmor").html(knight.armor)
    $("#knightAgility").html(knight.agility)
    $("#knightEndurance").html(knight.endurance)
    fetchWeather(gameID)
  }).catch(function(error){
    console.log("Knight fetch failed")
  })
})

function fetchWeather(gameID) {
  axios.get("http://www.dragonsofmugloar.com/weather/api/report/"+gameID).then(function(response){
    var weatherReport = JXON.stringToJs(response.data).report
    weatherCode = weatherReport.code
    $("#weatherCode").html(weatherCode)
    $("#weatherDesc").html(weatherReport.message)
    analyzeKnight()
  }).catch(function(error){
    console.log("Weather fetch failed", error.message)
  })
}

function analyzeKnight() {
  switch(weatherCode) {
    case "HVA": { // Heavy rain. Fire is useless, claws need extra sharpening (10!)
      dragon = {
        "dragon": {
          clawSharpness: 10,
          scaleThickness: 10,
          wingStrength: 0,
          fireBreath: 0
        }
      }
      break
    }
    case "FUNDEFINEDG": // Fog, can send any dragon at all
    case "NMR": { // Regular weather, need the best dragon against the knights stats
      // If the knight has 1 stat at 0, then we need to beat the best stat by 2, -1 on 2nd best, -1 on 3rd best, and 0 on last
      // Otherwise we should have 2+ against Knights best still, no more than -1 to all others.
      // Also no stat above 10, no stat below 1
      var knightStats = Object.keys(knight)
      knightStats.shift()
      knightStats.sort(function(a,b){
        return knight[a] < knight[b]
      })

      var toDistribute = 20
      var newDragon = {
        "dragon": {
        }
      }

      if(knight[knightStats[3]] == 0) { // 1 or more knight stats are at 0
        var tmp = highest(knight[knightStats[0]], 2)  // Beat best stat by 2, max 10
        newDragon.dragon[equiv[knightStats[0]]] = tmp
        $("#"+equiv[knightStats[0]]).val(tmp)
        toDistribute -= tmp

        tmp = knight[knightStats[1]] -1 // -1 on 2nd best
        newDragon.dragon[equiv[knightStats[1]]] = tmp
        $("#"+equiv[knightStats[1]]).val(tmp)
        toDistribute -= tmp

        tmp = knight[knightStats[2]] - 1 // -1 on 2nd worst
        newDragon.dragon[equiv[knightStats[2]]] = tmp
        $("#"+equiv[knightStats[2]]).val(tmp)
        toDistribute -= tmp

        newDragon.dragon[equiv[knightStats[3]]] = toDistribute
        $("#"+equiv[knightStats[3]]).val(toDistribute) // remainder for the worst stat
      }
      else { // No knight stats are at 0
        var tmp = highest(knight[knightStats[0]], 2)
        newDragon.dragon[equiv[knightStats[0]]] = tmp
        $("#"+equiv[knightStats[0]]).val(tmp)
        toDistribute -= tmp

        tmp = knight[knightStats[1]]
        newDragon.dragon[equiv[knightStats[1]]] = tmp
        $("#"+equiv[knightStats[1]]).val(tmp)
        toDistribute -= tmp

        tmp = lowest(knight[knightStats[3]], 1)
        newDragon.dragon[equiv[knightStats[3]]] = tmp
        $("#"+equiv[knightStats[3]]).val(tmp)
        toDistribute -= tmp

        newDragon.dragon[equiv[knightStats[2]]] = toDistribute
        $("#"+equiv[knightStats[2]]).val(toDistribute)
      }
      dragon = newDragon
      break
    }
    case "T E": {  // The Long Dry - need totally Zen dragon
      dragon = {
        "dragon": {
          clawSharpness: 5,
          scaleThickness: 5,
          wingStrength: 5,
          fireBreath: 5
        }
      }
      $(".dragonInput").val(5)
      break
    }
    default: {  // Only remaining code is SRO - there's a storm, don't send a dragon
      $(".dragonInput").val(0)
    }
  }

  sendDragon()
}

function sendDragon() {
  var scaleThickness = Number($("#scaleThickness").val())
  var clawSharpness = Number($("#clawSharpness").val())
  var wingStrength = Number($("#wingStrength").val())
  var fireBreath = Number($("#fireBreath").val())

  if(scaleThickness + clawSharpness + wingStrength + fireBreath == 20) {
    dragon = {
      "dragon": {
        "scaleThickness": scaleThickness,
        "clawSharpness": clawSharpness,
        "wingStrength": wingStrength,
        "fireBreath": fireBreath
      }
    }
  }
  if(gameID) {
    axios.put("http://www.dragonsofmugloar.com/api/game/" + gameID + "/solution", dragon).then(function(response){
      $("#knightDetails").html(knight.name + ", with " +
        strength(knight.attack) + " attack (" + knight.attack + "), " +
        strength(knight.armor) + " armor (" + knight.armor + "), " +
        strength(knight.agility) + " agility (" + knight.agility + "), and " +
        strength(knight.endurance) + " endurance (" + knight.endurance + ") has mounted an attack on our Kingdom!");
      if(dragon.hasOwnProperty("dragon")) {
        var ourDragon = dragon.dragon
        $("#dragonDetails").html("We had sent " + dragonName() + ", a dragon with " +
          strength(ourDragon.scaleThickness) + " scales ("  + ourDragon.scaleThickness + "), " +
          strength(ourDragon.clawSharpness) + " claws (" + ourDragon.clawSharpness + "), " +
          strength(ourDragon.wingStrength) + " wings (" + ourDragon.wingStrength + "), and " +
          strength(ourDragon.fireBreath) + " firey breath (" + ourDragon.fireBreath + ") To Fight and protect our Kingdom.")
      } else {
        $("#dragonDetails").html("The weather is not suitable we will not send a dragon out in this weather")
      }
      $("#result").html(response.data.status + "! " + response.data.message + ".")
      if(response.data.status !== "Victory") {
        dragonDeaths++
      }
      updateStats()
      dragon = {}
    })
  }
}

$(document).ready(function() {
  knightsSent = retrieve("knightsSent")
  dragonDeaths = retrieve("dragonDeaths")

  if(knightsSent) {
    updateStats()
  }
})

$("#sendDragon").click(function(){sendDragon()})

function store(key, val) {
  try {
    window.localStorage.setItem(key, val)
  }
  catch(e) {
  }
}

function retrieve(key) {
  try {
    var res = window.localStorage.getItem(key)
    if(res === null) {
      return 0
    }
    else {
      return res
    }
  }
  catch(e) {
    return 0
  }
}

function updateStats() { // Update our success stats
  if(knightsSent) {
    $("#stats").html("Battle Stats History: " + knightsSent + " knights had invaded our territory till now, and we have lost " + dragonDeaths +
      " battles till now. " + ((knightsSent - dragonDeaths) / knightsSent * 100).toFixed(2) +
      "% Success Rate")
  }
  store("dragonDeaths", dragonDeaths)
  store("knightsSent", knightsSent)
}

function highest(target, exceedBy) {  // Return a value exceedBy higher than target, with 10 as maximum
  if(target + exceedBy > 10) {
    return 10
  }
  else return target + exceedBy
}

function lowest(target, deceedBy) { // Return a value deceedBy lower than target, with 0 as minimum
  if(target - deceedBy < 0) {
    return 0
  }
  else return target - deceedBy
}

function strength(val) { // Input range expected to be 0 to 10
  switch (val) {
    case 0: {
      return "no"
      break
    }
    case 1:
    case 2: {
      return "weak"
      break
    }
    case 3:
    case 4: {
      return "mild"
      break
    }
    case 5:
    case 6:
    case 7: {
      return "average"
      break
    }
    case 8:
    case 9: {
      return "good"
      break
    }
    case 10: {
      return "legendary"
      break
    }
    default: { // Input range should be 0 to 10, should never reach here
      return "curious"
    }
  }
}

function dragonName() {
  return dragonNames[Math.floor(Math.random() * dragonNames.length)];
}
