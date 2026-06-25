import dayjs from "dayjs";

export const adaptMessage = (message) => {
  const messageArray = message.split("");
  let nCount = 0;
  const resultArray = messageArray.map((item) => {
    if (item !== "\n") {
      nCount = 0;
      return item;
    }
    if (item === "\n") {
      nCount = nCount + 1;
    }

    if (nCount >= 3) {
      return "";
    }

    return item;
  });
  const resultMessage = resultArray.join("");
  return resultMessage;
};

export const formatDate = (time) => {
  return dayjs(time).format("DD.MM.YYYY HH:MM");
};

export const convertToTimestamp = (dateString) => {
  const dateParts = dateString.split(" ");

  const day = parseInt(dateParts[0]);
  const monthNames = [
    "Січня,",
    "Лютого,",
    "Березеня,",
    "Квітня,",
    "Травня,",
    "Червня,",
    "Липня,",
    "Серпня,",
    "Вересня,",
    "Жовтня,",
    "Листопада,",
    "Грудня,",
  ];
  const monthIndex = monthNames.indexOf(dateParts[1]) + 1;
  const year = parseInt(dateParts[2]);

  const date = new Date(year, monthIndex - 1, day);

  const timestamp = date.getTime();

  return timestamp;
};

export const formatTimestampToDate = (timestamp, locale) => {
  const date = new Date(+timestamp);
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString(locale, options);
};

export const formatStartDate = (date, lang) => {
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString(lang, options);
};

const standartColorList = [
  "#438DF6",
  "#383d45",
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#795548",
  "#9e9e9e",
  "#607d8b",
  "#8ca6cb",
];

export const getTintedColor = (color, v) => {
  if (!standartColorList.includes(color)) {
    return color;
  }

  if (color.length > 6) {
    color = color.substring(1, color.length);
  }
  var rgb = parseInt(color, 16);
  var r = Math.abs(((rgb >> 16) & 0xff) + v);
  if (r > 255) r = r - (r - 255);
  var g = Math.abs(((rgb >> 8) & 0xff) + v);
  if (g > 255) g = g - (g - 255);
  var b = Math.abs((rgb & 0xff) + v);
  if (b > 255) b = b - (b - 255);
  r = Number(r < 0 || isNaN(r)) ? 0 : (r > 255 ? 255 : r).toString(16);
  if (r.length === 1) r = "0" + r;
  g = Number(g < 0 || isNaN(g)) ? 0 : (g > 255 ? 255 : g).toString(16);
  if (g.length === 1) g = "0" + g;
  b = Number(b < 0 || isNaN(b)) ? 0 : (b > 255 ? 255 : b).toString(16);
  if (b.length === 1) b = "0" + b;
  return "#" + r + g + b;
};

export const widgetColorStyle = (color) => {
  switch (color) {
    case "#438DF6":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(67, 141, 246, 0.6) 0.48%, rgba(67, 141, 246, 0.8) 44.96%, #438DF6 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(78, 148, 247, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(67, 141, 246, 0.4) -8.76%, rgba(67, 141, 246, 0.8) 47.81%, #438DF6 108.03%)",
        buttonColor: "#438DF6",
        buttonContentColor: "#438DF6",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#A1C6FB",
      };
    case "#383d45":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(57, 61, 68, 0.6) 0.48%, rgba(57, 61, 68, 0.8) 44.96%, #393D44 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(57, 61, 68, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(57, 61, 68, 0.4) -8.76%, rgba(57, 61, 68, 0.8) 49.03%, #393D44 108.03%)",
        buttonColor: "#393D44",
        buttonContentColor: "#393D44",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#96989C",
      };
    case "#f44336":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(225, 81, 65, 0.6) 0.48%, rgba(225, 81, 65, 0.8) 44.96%, #E15141 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(225, 81, 65, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(225, 81, 65, 0.4) -8.76%, rgba(225, 81, 65, 0.8) 52.07%, #E15141 108.03%)",
        buttonColor: "#E15141",
        buttonContentColor: "#E15141",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#F0A8A0",
      };
    case "#e91e63":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(214, 57, 100, 0.6) 0.48%, rgba(214, 57, 100, 0.8) 44.95%, rgba(214, 57, 100, 0.8) 44.96%, #D63964 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(214, 57, 100, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(214, 57, 100, 0.83) -8.76%, rgba(214, 57, 100, 0.4) -8.76%, rgba(214, 57, 100, 0.8) 49.64%, #D63964 108.03%)",
        buttonColor: "#D63964",
        buttonContentColor: "#D63964",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#ECA2B6",
      };
    case "#9c27b0":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(144, 54, 170, 0.6) 0.48%, rgba(144, 54, 170, 0.8) 44.96%, #9036AA 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(144, 54, 170, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(144, 54, 170, 0.4) -8.76%, rgba(144, 54, 170, 0.8) 52.68%, #9036AA 108.03%)",
        buttonColor: "#9036AA",
        buttonContentColor: "#9036AA",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#CBA1D7",
      };
    case "#673ab7":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(96, 64, 176, 0.6) 0.48%, rgba(96, 64, 176, 0.8) 44.96%, #6040B0 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(96, 64, 176, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(96, 64, 176, 0.4) -8.76%, rgba(96, 64, 176, 0.8) 47.81%, #6040B0 108.03%)",
        buttonColor: "#6040B0",
        buttonContentColor: "#6040B0",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#B4A5DA",
      };
    case "#3f51b5":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(65, 83, 175, 0.6) 0.48%, rgba(65, 83, 175, 0.8) 44.96%, #4153AF 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(65, 83, 175, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(65, 83, 175, 0.4) -8.76%, rgba(65, 83, 175, 0.8) 47.81%, #4153AF 108.03%)",
        buttonColor: "#4153AF",
        buttonContentColor: "#4153AF",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#A1A9D7",
      };
    case "#2196f3":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(70, 150, 236, 0.6) 0.48%, rgba(70, 150, 236, 0.8) 44.96%, #4696EC 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(70, 150, 236, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(70, 150, 236, 0.5) -8.76%, rgba(70, 150, 236, 0.8) 47.81%, #4696EC 108.03%)",
        buttonColor: "#4696EC",
        buttonContentColor: "#4696EC",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#99C5F4",
      };
    case "#03a9f4":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(72, 167, 238, 0.6) 0.48%, rgba(72, 167, 238, 0.8) 44.96%, #48A7EE 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(72, 167, 238, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(72, 167, 238, 0.4) -8.76%, rgba(72, 167, 238, 0.8) 50.85%, #48A7EE 108.03%)",
        buttonColor: "#48A7EE",
        buttonContentColor: "#48A7EE",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#9FD1F6",
      };
    case "#00bcd4":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(82, 185, 209, 0.6) 0.48%, rgba(82, 185, 209, 0.8) 44.96%, #52B9D1 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(82, 185, 209, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(82, 185, 209, 0.4) -8.76%, rgba(82, 185, 209, 0.8) 52.68%, #52B9D1 108.03%)",
        buttonColor: "#52B9D1",
        buttonContentColor: "#52B9D1",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#ABDDE9",
      };
    case "#009688":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(65, 148, 136, 0.6) 0.48%, rgba(65, 148, 136, 0.8) 44.96%, #419488 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(65, 148, 136, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(65, 148, 136, 0.4) -8.76%, rgba(65, 148, 136, 0.8) 47.81%, #419488 108.03%)",
        buttonColor: "#419488",
        buttonContentColor: "#419488",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#A0C9C3",
      };
    case "#4caf50":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(103, 172, 91, 0.6) 0.48%, rgba(103, 172, 91, 0.8) 44.96%, #67AC5B 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(151, 192, 92, 0.2)",
        gradient:
          "linear-gradient(180deg, rgba(103, 172, 91, 0.4) -8.76%, rgba(103, 172, 91, 0.8) 52.68%, #67AC5B 108.03%)",
        buttonColor: "#67AC5B",
        buttonContentColor: "#67AC5B",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#B8D8B2",
      };
    case "#8bc34a":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(151, 192, 92, 0.6) 0.48%, rgba(151, 192, 92, 0.8) 51.52%, #97C05C 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(151, 192, 92, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(151, 192, 92, 0.4) -8.76%, rgba(151, 192, 92, 0.8) 52.68%, #97C05C 108.03%)",
        buttonColor: "#97C05C",
        buttonContentColor: "#97C05C",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#B5D28B",
      };
    case "#cddc39":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(209, 219, 89, 0.6) 0.48%, rgba(209, 219, 89, 0.8) 44.96%, #D1DB59 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(209, 219, 89, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(209, 219, 89, 0.4) -8.76%, rgba(209, 219, 89, 0.8) 44.77%, #D1DB59 108.03%)",
        buttonColor: "#D1DB59",
        buttonContentColor: "#757B29",
        textColor: "#757B29",
        opacityTextColor: "rgba(117, 123, 41, 0.76)",
        svgColor: "#757B29",
        backgroundContainerLogo: "#D9E175",
      };
    case "#ffeb3b":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(253, 234, 96, 0.6) 0.48%, rgba(253, 234, 96, 0.8) 44.96%, #FDEA60 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(253, 234, 96, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(253, 234, 96, 0.4) -8.76%, rgba(253, 234, 96, 0.8) 49.03%, #FDEA60 108.03%)",
        buttonColor: "#FDEA60",
        buttonContentColor: "#74574A",
        textColor: "#74574A",
        opacityTextColor: "rgba(116, 87, 74, 0.76)",
        svgColor: "#74574A",
        backgroundContainerLogo: "#E6D86C",
      };
    case "#ffc107":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(247, 193, 68, 0.6) 0.48%, rgba(247, 193, 68, 0.8) 44.96%, #F7C144 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(247, 193, 68, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(247, 193, 68, 0.4) -8.76%, rgba(247, 193, 68, 0.8) 44.77%, #F7C144 108.03%)",
        buttonColor: "#F7C144",
        buttonContentColor: "#74574A",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#F8C655",
      };
    case "#795548":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(116, 87, 74, 0.6) 0.48%, rgba(116, 87, 74, 0.8) 44.96%, #74574A 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(116, 87, 74, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(116, 87, 74, 0.4) -8.76%, rgba(116, 87, 74, 0.8) 51.46%, #74574A 108.03%)",
        buttonColor: "#74574A",
        buttonContentColor: "#74574A",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#A8968E",
      };
    case "#9e9e9e":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(158, 158, 158, 0.6) 0.48%, rgba(158, 158, 158, 0.8) 44.96%, #9E9E9E 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(158, 158, 158, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(158, 158, 158, 0.4) -8.76%, rgba(158, 158, 158, 0.8) 47.81%, #9E9E9E 108.03%)",
        buttonColor: "#9E9E9E",
        buttonContentColor: "#9E9E9E",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#ABABAB",
      };
    case "#607d8b":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(102, 124, 137, 0.6) 0.48%, rgba(102, 124, 137, 0.8) 44.96%, #667C89 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(102, 124, 137, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(102, 124, 137, 0.4) -8.76%, rgba(102, 124, 137, 0.8) 47.81%, #667C89 108.03%)",
        buttonColor: "#667C89",
        buttonContentColor: "#667C89",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#ABB7BF",
      };
    case "#8ca6cb":
      return {
        mainColor:
          "linear-gradient(359.41deg, rgba(144, 166, 200, 0.6) 0.48%, rgba(144, 166, 200, 0.8) 44.96%, #90A6C8 99.46%)",
        backgroundColor: "#fff",
        messageColor: "rgba(144, 166, 200, 0.16)",
        gradient:
          "linear-gradient(180deg, rgba(144, 166, 200, 0.4) -8.76%, rgba(144, 166, 200, 0.8) 49.03%, #90A6C8 108.03%)",
        buttonColor: "#90A6C8",
        buttonContentColor: "#90A6C8",
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#A4B6D2",
      };
    default:
      return {
        mainColor: color,
        backgroundColor: "#fff",
        messageColor: "rgba(78, 148, 247, 0.13)",
        gradient: color,
        buttonColor: color,
        buttonContentColor: color,
        textColor: "#fff",
        opacityTextColor: "rgba(255, 255, 255, 0.76)",
        svgColor: "#fff",
        backgroundContainerLogo: "#A1C6FB",
      };
  }
};

export const openFile = (fileUrl) => {
  window.open(fileUrl, "_blank");
};

export const getFileName = (fileUrl) => {
  return fileUrl.split("/").pop();
};
