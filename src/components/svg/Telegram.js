import React from "react";

const Telegram = ({ telegramBotLink, color }) => {
  const onClickHandler = () => {
    window.open(telegramBotLink, "blank");
  };
  return (
    <div onClick={onClickHandler} className="telegram-wrapper">
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.2218 0.0971059L1.44681 5.79461C0.438474 6.19961 0.444308 6.76211 1.26181 7.01294L5.05514 8.19627L13.8318 2.65877C14.2468 2.40627 14.626 2.54211 14.3143 2.81877L7.20347 9.23627H7.20181L7.20347 9.23711L6.94181 13.1471C7.32514 13.1471 7.49431 12.9713 7.70931 12.7638L9.55181 10.9721L13.3843 13.8029C14.091 14.1921 14.5985 13.9921 14.7743 13.1488L17.2901 1.29211C17.5476 0.259606 16.896 -0.207894 16.2218 0.0971059Z" fill={color}/>
</svg>
    </div>
  );
};

export default Telegram;
