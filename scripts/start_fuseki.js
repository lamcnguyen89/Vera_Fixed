const dotenv = require("dotenv")
let spawn = require("child_process").spawn
console.log("Starting fuseki...")
dotenv.config()
console.log(process.env.FUSEKI)
let fuseki = spawn(process.env.FUSEKI)
fuseki.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`)
})

fuseki.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`)
})

fuseki.on("close", (code) => {
  console.log(`child process exited with code ${code}`)
})
