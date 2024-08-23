// import fs from 'fs'
import express from "express";
import * as csv from "fast-csv";
// import { MongoClient } from 'mongodb'
// const twaudbBASEURI = require('../../config/keys').twauBASEURI
import Player from "../../models/Player";
import Project from "../../models/Project";
import Bio from "../../models/Bio";
import MLOut from "../../models/MLOut";
import Processing from "../../models/Processing";
import multer from "multer";
import path from "path";
import passport from "passport";
// import ChartjsNode from 'chartjs-node'
import PNGCrop from "png-crop";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fieldSize: 50 * 1024 * 1024 },
});
const type = upload.single("file");
import * as fs from "fs";

// conver action units from OpenFace on data-collection client to emotions using sketchy chart from wikipedia
// note, no one has any idea how to actually detect emotions with just facial data.
let auIndexes: any[];
let timestampIndex: string | number;
const regex = /AU(\d+)_r/g;

const getEmotions = (
  row: { [x: string]: any },
  firstRow: string[],
  resetSignal?: boolean
) => {
  if (resetSignal) {
    auIndexes = undefined;
    return;
  }
  // https://en.wikipedia.org/wiki/Facial_Action_Coding_System#Uses
  // https://github.com/TadasBaltrusaitis/OpenFace/wiki/Action-Units
  // thresholded at 1 out of 5 (may need to be tuned later for better accuracy).
  if (auIndexes === undefined) {
    auIndexes = firstRow
      .map((str: string, i: any) =>
        regex.test(str)
          ? { auNumber: Number(regex.exec(str)[1]), idx: i }
          : null
      )
      .filter((v: any) => v);
  }
  if (timestampIndex === undefined) {
    timestampIndex = firstRow.indexOf("timestamp");
  }

  const aus: { [key: number]: number } = []; // action units from row
  auIndexes.forEach(
    (r: { auNumber: string | number; idx: string | number }) => {
      aus[r.auNumber] = Number(row[r.idx]);
    }
  );

  const ret: {
    ms: number;
    happiness?: number;
    sadness?: number;
    surprise?: number;
    fear?: number;
    anger?: number;
    disgust?: number;
  } = {
    ms: Number(row[timestampIndex]) * 1000,
  }; // timestamp is in seconds
  if (aus[6] >= 1 && aus[12] >= 1) {
    ret.happiness = (aus[6] + aus[12]) / 2;
  }
  if (aus[1] >= 1 && aus[4] >= 1 && aus[15] >= 1) {
    ret.sadness = (aus[1] + aus[4] + aus[15]) / 3;
  }
  if (aus[1] >= 1 && aus[2] >= 1 && aus[5] >= 1 && aus[5] < 2 && aus[26] >= 1) {
    ret.surprise = (aus[1] + aus[2] + (aus[5] - 1) * 5 + aus[26]) / 4;
  }
  if (
    aus[1] >= 1 &&
    aus[2] >= 1 &&
    aus[4] >= 1 &&
    aus[5] >= 1 &&
    aus[7] >= 1 &&
    aus[20] >= 1 &&
    aus[26] >= 1
  ) {
    ret.fear = (aus[1] + aus[4] + aus[15]) / 7;
  }
  if (aus[4] >= 1 && aus[5] >= 1 && aus[7] >= 1 && aus[23] >= 1) {
    ret.anger = (aus[4] + aus[5] + aus[7] + aus[23]) / 4;
  }
  if (aus[9] >= 1 && aus[15] >= 1 && aus[16] >= 1) {
    ret.disgust = (aus[9] + aus[15] + aus[16]) / 3;
  }
  // Contempt R12A+R14A -- this requires position info OpenFace doesn't provide
  return ret;
};

router.post("/bio/:t/:uid", type, (req, res) => {
  console.log(req.params.uid);
  const string = req.body.file;
  const regex = /^data:.+\/(.+);base64,(.*)$/;

  const matches = string.match(regex);
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");
  fs.writeFileSync(`uploads/${req.params.uid}-${req.params.t}.csv`, buffer);

  Bio.countDocuments(
    { uid: req.params.uid, t: req.params.t },
    (err, n: number) => {
      if (err !== null) {
        console.error(err);
        res.sendStatus(400);
        return;
      }
      if (n !== 0) {
        res.json({
          success: false,
          error: `${n} records with this type and uid already exist. Add \`override: true\` to request body to insert anyway`,
        });
      } else {
        // console.log(req.file.path);
        let firstRow;
        let isFirst = true;
        let bios = [];
        let batchCounter = 0;
        let batchNumber = 1;
        let batchPromise;
        const stream = fs.createReadStream(
          `uploads/${req.params.uid}-${req.params.t}.csv`
        );
        csv
          .parseStream(stream)
          .on(
            "data",
            async (row): Promise<void> => {
              // console.log("Data", row);
              if (isFirst) {
                isFirst = false;
                firstRow = row.map((v) => v.trim().split(":")[0]);
              } else {
                let dp: { uid?: string; t?: string; ms?: number } = {};
                if (req.body.t === "au") {
                  // action units
                  dp = getEmotions(row, firstRow);
                } else {
                  for (let i = 0; i < firstRow.length; i++) {
                    dp[firstRow[i]] = Number(row[i]);
                  }
                }
                dp.uid = req.params.uid;
                dp.t = req.params.t;
                bios.push(dp);
                batchCounter++;
                if (batchCounter === 1000) {
                  await batchPromise;
                  batchPromise = Bio.insertMany(bios)
                    .then(async (docs) => {
                      console.log(
                        `Inserted ${
                          docs.length.toString() as string
                        } docs into db for batch #${batchNumber}`
                      );
                      await Processing.insertMany(bios)
                        .then((docs) =>
                          console.log(
                            `Inserted ${
                              docs.length.toString() as string
                            } docs into db for batch #${batchNumber}`
                          )
                        )
                        .catch((err) =>
                          console.log(
                            `error putting ${n} docs in db on batch number ${batchNumber}:`,
                            err
                          )
                        );
                    })
                    .catch((err) =>
                      console.log(
                        `error putting ${n} docs in db on batch number ${batchNumber}:`,
                        err
                      )
                    );
                  batchCounter = 0;
                  batchNumber++;
                  bios = [];
                }
              }
            }
          )
          .on("error", (e) => {
            console.log(e);
            res
              .status(500)
              .json({ success: false, error: "error parsing csv" });
          })
          .on("end", async (n) => {
            console.log(
              `DONE READING, read ${
                n.toString() as string
              } total objects from Watson client (csv file), inserting any remaining into db...`
            );
            getEmotions(null, null, true); // gross hacky reset >.<
            await batchPromise;
            await Bio.insertMany(bios)
              .then(async (docs) => {
                console.log("success! all docs inserted into bios collection");
                await Processing.insertMany(bios)
                  .then((docs) =>
                    console.log(
                      "success! all docs inserted into processing collection"
                    )
                  )
                  .catch((err) =>
                    console.log(
                      `error putting ${
                        n.toString() as string
                      } docs in processing collection:`,
                      err
                    )
                  )
                  .then(() => res.sendStatus(200));
              })
              .catch((err) =>
                console.log(
                  `error putting ${
                    n.toString() as string
                  } docs in bios collection:`,
                  err
                )
              );

            // fs.unlink(req.body.data.path, () => res.json({ success: true }))
          });
      }
    }
  );
});

router.post(
  "/bio",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Bio.find(
      { uid: req.body.uid, t: req.body.t },
      undefined,
      { sort: { ms: 1 } },
      async (err: any, cursor: Array<{}>) => {
        if (err) {
          console.error(err);
          return;
        }
        const data = {
          ms: [],
          v: [],
        };
        for (const record of cursor) {
          const newRecord = { ...record["_doc"] };
          data.ms.push(newRecord["ms"]);
          data.v.push(newRecord["v"]);
        }
        res.send(data);
      }
    );
  }
);

router.post(
  "/bio/ml",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    MLOut.find(
      { uid: req.body.uid, t: req.body.t },
      undefined,
      { sort: { ms: 1 } },
      async (err: any, cursor: Array<{}>) => {
        if (err) {
          console.error(err);
          return;
        }
        const data = [];
        for (const record of cursor) {
          let newRecord;
          if (req.body.t === "au") {
            // console.log(typeof record);
            if (record["emotions"]) {
              newRecord = { ...record["_doc"] };
              let color;
              let v;

              switch (newRecord["emotions"].trim()) {
                case "joy":
                  color = "#d6de00";
                  v = 40;
                  break;
                case "sadness":
                  color = "#1746bd";
                  v = 16;
                  break;
                case "surprise":
                  color = "#07e091";
                  v = 32;
                  break;
                case "fear":
                  color = "#a41ce8";
                  v = 0;
                  break;
                case "anger":
                  color = "#87130b";
                  v = 8;
                  break;
                case "contempt":
                  color = "#f00e77";
                  v = 24;
                  break;
                default:
                  v = 48;
                  color = "#f0830e";
              }

              data.push({
                ms: newRecord["ms"],
                emotion: newRecord["emotions"],
                color: color,
                v: v,
              });
            }
          } else {
            newRecord = { ...record["_doc"] };
            data.push(newRecord["ms"]);
          }
        }
        res.send(data);
      }
    );
  }
);

// /CreatePlayerWithVimeoURI
// req.body: { playerName: string, uri: string like /videos/368137605" }
// TODO: change playerName to something more anonymous
router.post("/AddVimeoURI/:uid", function (req, res) {
  let player = Player.findOne({ uid: req.params.uid });
  player.vimeoVideos.push({ uri: req.body.uri, duration: req.params.duration });
  player.save(function (err, player) {
    if (err !== null) {
      console.log("/CreatePlayerWithVimeoURI: obj.save err", err);
      res.sendStatus(500);
    } else res.send(player._id.toString());
  });
});
// /CreatePlayerWithVimeoURI
// req.body: { playerName: string, uri: string like /videos/368137605" }
// TODO: change playerName to something more anonymous
router.post("/CreatePlayerWithVimeoURI", function (req, res) {
  new Player({
    playerName: req.body.playerName,
    vimeoVideos: [{ uri: req.body.uri, duration: req.body.duration }],
  }).save(async (err, val) => {
    if (err !== null) {
      console.log(`error saving ${val as string} to db: `, err);
    }
    const obj = await Project.findOne({ _id: req.body.projectID });
    obj.players.push(val._id);
    obj.save(function (err, player) {
      if (err !== null) {
        console.log("/CreatePlayerWithVimeoURI: obj.save err", err);
        res.sendStatus(500);
      } else res.send(player._id.toString());
    });
  });
});
export default router;
