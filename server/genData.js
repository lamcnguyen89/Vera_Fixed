const {v4 : uuidv4} = require('uuid')
players = []
for(var i = 0; i < 5; i++) {
  let player1Id = uuidv4()
  let story1Id = uuidv4()
  let passage1 = uuidv4()
  let player2Id = uuidv4()
  let story2Id = uuidv4()
  let passage2 = uuidv4()
  players.push(
  {
    "uid": player1Id,
    "storyId": story1Id,
    "currentStory": `{\"id\":\"${story1Id}\",\"version\":\"\",\"info\":{\"id\":\"${story1Id}\",\"lastUpdate\":\"2021-06-09T20:01:29.020Z\",\"ifid\":\"F165FBA2-FFAB-45FA-81F8-A579A689D929\",\"tagColors\":{},\"name\":\"My Story\",\"startPassage\":\"${passage1}}\",\"zoom\":1,\"snapToGrid\":true,\"stylesheet\":\"\",\"script\":\"\",\"storyFormat\":\"Harlowe\",\"storyFormatVersion\":\"3.2.3\"},\"passages\":[{\"id\":\"${passage1}\",\"story\":\"${storyId1}\",\"top\":500,\"left\":475,\"width\":100,\"height\":100,\"tags\":[],\"name\":\"Untitled Passage\",\"selected\":true,\"text\":\"Double-click this passage to edit it.\"}]}`,
    "sessionStart": {
      "$date": "2021-06-09T18:30:00Z"
    },
    "files": [],
    "previousStories": [],
    "vimeoVideos": [],
    "partner": player2Id,
    "note": "P"+i,
    "bio": ""
  })
  players.push(
  {
    "uid": player2Id,
    "storyId": story2Id,
    "currentStory": `{\"id\":\"${story2Id}\",\"version\":\"\",\"info\":{\"id\":\"${story2Id}\",\"lastUpdate\":\"2021-06-09T20:01:29.020Z\",\"ifid\":\"F165FBA2-FFAB-45FA-81F8-A579A689D929\",\"tagColors\":{},\"name\":\"My Story\",\"startPassage\":\"${passage2}}\",\"zoom\":1,\"snapToGrid\":true,\"stylesheet\":\"\",\"script\":\"\",\"storyFormat\":\"Harlowe\",\"storyFormatVersion\":\"3.2.3\"},\"passages\":[{\"id\":\"${passage1}\",\"story\":\"${storyId1}\",\"top\":500,\"left\":475,\"width\":100,\"height\":100,\"tags\":[],\"name\":\"Untitled Passage\",\"selected\":true,\"text\":\"Double-click this passage to edit it.\"}]}`,
    "sessionStart": {
      "$date": "2021-06-09T18:30:00Z"
    },
    "files": [],
    "previousStories": [],
    "vimeoVideos": [],
    "partner": player1Id,
    "note": "P"+i+1,
    "bio": ""
  })
}