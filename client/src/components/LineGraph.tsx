import React from "react";
import "../styles/LineGraph.css";
import "../styles/App.css";
import { Line } from "react-chartjs-2";
import { Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import { getBsProps } from "react-bootstrap/lib/utils/bootstrapUtils";

interface ILineGraphProps {
  xValues: number[];
  yValues: number[];
  color: string;
  label: string;
  ml: object[];
  emotions: object[];
}

class LineGraph extends React.Component<ILineGraphProps> {
  constructor(props: ILineGraphProps) {
    super(props);
  }

  options = {
    tooltips: {
      callbacks: {
        title: function(tooltipItems, data) {
          const totalSeconds =
            (tooltipItems[0].datasetIndex === 1
              ? data.datasets[1].data[tooltipItems[0].index].x
              : tooltipItems[0].xLabel) / 1000;
          let mins = totalSeconds / 60;
          mins = Math.round(mins * 1) / 1;
          let secs = totalSeconds % 60;
          secs = Math.round(secs * 1000) / 1000;

          let minString = mins.toString();
          if (minString.length === 1) {
            minString = `0${minString}`;
          }

          let secString, msString;
          let sString = secs.toString();
          if (sString.includes(".")) {
            let sArray = secs.toString().split(".");
            if (sArray[0].length === 1) {
              secString = `0${sArray[0]}`;
            } else {
              secString = sArray[0];
            }

            if (sArray[1].length === 1) {
              msString = `${sArray[1]}00`;
            } else if (sArray[1].length === 2) {
              msString = `${sArray[1]}0`;
            } else {
              msString = sArray[1];
            }
          } else {
            if (sString.length === 1) {
              secString = `0${sString}`;
            } else {
              secString = sString;
            }
            msString = "000";
          }

          return `${minString}:${secString}.${msString}`;
        },
        label: function(tooltipItem, data) {
          var label = data.datasets[tooltipItem.datasetIndex].label || "";

          if (label) {
            label += ": ";
          }
          if (data.datasets[tooltipItem.datasetIndex].label === "Emotions") {
            label +=
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x
                .emotion;
          } else {
            label += Math.round(tooltipItem.yLabel * 100) / 100;
          }
          return label;
        },
      },
    },
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            display: false,
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
          },
        },
      ],
    },
  };

  data = {
    labels: this.props.xValues,
    datasets: [
      {
        borderWidth: 1,
        label: this.props.label,
        fill: true,
        lineTension: 0,
        backgroundColor: `rgba(${this.props.color},0.4)`,
        borderColor: `rgba(${this.props.color},1)`,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: `rgba(${this.props.color},1)`,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: this.props.yValues,
      },
      {
        showLine: false,
        label: "ML Events",
        fill: false,
        borderColor: `rgba(0,0,0,0.5)`,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: `rgba(0,0,0,0.5)`,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 5,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(0,0,0,1)",
        pointHoverBorderColor: "rgba(0,0,0,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: this.props.ml,
      },
      {
        showLine: false,
        label: "Emotions",
        fill: false,
        borderColor: `rgba(0,0,0,0.5)`,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: `rgba(0,0,0,0.5)`,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 1,
        pointHoverBackgroundColor: "rgba(0,0,0,1)",
        pointHoverBorderColor: "rgba(0,0,0,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: this.props.emotions,
      },
    ],
  };

  generateData() {
    let retval;
    if (this.props.emotions.length === 0) {
      retval = {
        labels: this.props.xValues,
        datasets: [
          {
            borderWidth: 1,
            label: this.props.label,
            fill: true,
            lineTension: 0,
            backgroundColor: `rgba(${this.props.color},0.4)`,
            borderColor: `rgba(${this.props.color},1)`,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: `rgba(${this.props.color},1)`,
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.props.yValues,
          },
          {
            showLine: false,
            label: "ML Events",
            fill: false,
            borderColor: `rgba(0,0,0,0.5)`,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: `rgba(0,0,0,0.5)`,
            pointBackgroundColor: "#fff",
            pointBorderWidth: 5,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(0,0,0,1)",
            pointHoverBorderColor: "rgba(0,0,0,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.props.ml,
          },
        ],
      };
    } else {
      const colors = this.props.emotions
        .map((a) => a["x"])
        .map((a) => a["color"]);
      retval = {
        labels: this.props.xValues,
        datasets: [
          {
            borderWidth: 1,
            label: this.props.label,
            fill: true,
            lineTension: 0,
            backgroundColor: `rgba(${this.props.color},0.4)`,
            borderColor: `rgba(${this.props.color},1)`,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: `rgba(${this.props.color},1)`,
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.props.yValues,
          },
          {
            showLine: false,
            label: "ML Events",
            fill: false,
            borderColor: `rgba(0,0,0,0.5)`,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: `rgba(0,0,0,0.5)`,
            pointBackgroundColor: "#fff",
            pointBorderWidth: 5,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(0,0,0,1)",
            pointHoverBorderColor: "rgba(0,0,0,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.props.ml,
          },
          {
            borderWidth: 1,
            showLine: false,
            label: "Emotions",
            fill: false,
            borderColor: `rgba(255,215,0,0.5)`,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: colors,
            pointBackgroundColor: colors,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(255,215,0,1)",
            pointHoverBorderColor: "rgba(255,215,0,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.props.emotions,
          },
        ],
      };
    }
    return retval;
  }
  // ---------------- render -----------------------------
  render() {
    return (
      <div className="line-graph">
        <Line data={this.generateData()} height={100} options={this.options} />
      </div>
    );
  }
}

export default LineGraph;
