import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
// import { faChartArea } from '@fortawesome/free-solid-svg-icons'

const Chart = (props: any) => {
  const ref = useRef();
  const [src, setSrc] = useState("");
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    type t = "hr" | "gsr" | "ibi" | "tag" | "au";
    type getBioBody = {
      uid: string;
      t: t | Array<t>;
      color?: string;
      width?: Number;
      height?: Number;
    };

    const map: any = {
      "5de54d8ebc7cbf16a043ba96": "hr",
      "5de55a46bc7cbf16a044a4a2": "ibi",
      "5de5792cbc7cbf16a044a4a3": "gsr",
    };
    const body: getBioBody = {
      uid: "5de53b98bc7cbf16a043ba95", // props.id as string
      t: (map[props.id] as t) || "ibi",
      color: "blue",
    };

    fetch(
      `/api/bio`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(body),
      }
    )
      .then((res: any) => res.blob())
      .then((blob: any) => setSrc(URL.createObjectURL(blob)))
      .catch(console.log);
  }, []);
  return <img ref={ref} src={src} />;
};
Chart.displayName = "Chart";

export default Chart;
