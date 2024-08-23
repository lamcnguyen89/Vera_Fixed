export function convertAllFramesToTimestamps (ann: any, type:string, array:Array<any>) {
  const convertedScenes:any = []
  array.forEach((timestamp:any) => {
    if (type === 'timeseries') {
      convertedScenes.push({
        id: timestamp[ann],
        start: getTimestampsFromFrames(timestamp.start),
        end: getTimestampsFromFrames(timestamp.end)
      })
    } else {
      convertedScenes.push({ id: timestamp[ann], time: getTimestampsFromFrames(timestamp.time) })
    }
  })
  return convertedScenes
}

// takes a time in seconds and converts to a timestamp
export function secondsToTimestamp (seconds: number) {
  const date = new Date(null)
  date.setSeconds(seconds)
  return date.toISOString().substr(11, 8)
}

export function getTimestampsFromFrames (frame: string) {
  const decimalTimestampInSeconds = Math.ceil(parseInt(frame) / 30)
  return secondsToTimestamp(decimalTimestampInSeconds)
}

export function getFrameFromTimestamp (timestamp: string) {
  const timesStampInSeconds = getTimestampInSeconds(timestamp)
  return timesStampInSeconds * 30
}

// given a time in format HH:MM:SS
export function getTimestampInSeconds (timestamp: string) {
  const time:any = timestamp.split(':')
  return ((time[0] * 3600) + (time[1] * 60) + (time[2] * 1))
}
