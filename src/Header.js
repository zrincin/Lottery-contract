import React from "react";

const Header = ({ data }) => {
  return (
    <nav style={{ display: "flex", justifyContent: "space-evenly" }}>
      {data
        .filter((item) => item.ticker !== "USDT" && item.ticker !== "HEX")
        .map(({ key, name, ticker, price }) => {
          return (
            <ul key={key} style={{ listStyle: "none" }}>
              <li>
                {name} {`[${ticker}]`} &nbsp; <b>{`$${price}`}</b>
              </li>
            </ul>
          );
        })}
    </nav>
  );
};

export default Header;
